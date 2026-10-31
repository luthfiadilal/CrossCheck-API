import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import MsUser from "../models/ms-user.model";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "crosscheck-secret-key";

interface AuthenticatedSocket extends Socket {
  user?: {
    user_id: string;
    role: string;
    name?: string;
    parent_user_id?: string | null;
  };
}

let ioInstance: Server | null = null;

/**
 * Inisialisasi Socket.IO Server dengan autentikasi JWT & Room per User/Role
 *
 * Cara sistem mengenali target notifikasi (Mandor A <-> Asisten Lapangan):
 * 1. Saat aplikasi Flutter terhubung ke Socket, ia mengirimkan JWT token di `auth.token`.
 * 2. Server memverifikasi JWT (`user_id` & `role`) dan mengambil data `ms_user` (termasuk `parent_user_id`).
 * 3. Setiap user otomatis dimasukkan ke dalam Room spesifik:
 *    - `user:<user_id>` (Room pribadi milik user tersebut, misal `user:MDR-xxx` atau `user:AST-xxx`)
 *    - `role:APPROVER` (Jika role-nya `ASISTEN_LAPANGAN` atau `KEPALA_KEBUN`)
 * 4. Ketika Mandor A melakukan Sync laporan:
 *    - Jika Mandor A memiliki `parent_user_id` (atasan langsung), sinyal dikirim langsung ke `user:<parent_user_id>` dan `role:APPROVER`.
 * 5. Ketika Asisten Lapangan melakukan Approval / RE-CHECK pada laporan milik Mandor A:
 *    - Server mengambil `monitoringLog.mandor_id` dan mengirim sinyal spesifik HANYA ke room `user:<mandor_id>` (Mandor A saja, Mandor B tidak terganggu).
 */
export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware autentikasi Socket menggunakan JWT Token (sama seperti req.user di HTTP)
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.toString().replace("Bearer ", "") ||
        socket.handshake.query?.token?.toString();

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; role: string };
      const dbUser = await MsUser.findByPk(decoded.user_id, {
        attributes: ["user_id", "name", "role", "parent_user_id"],
      });

      socket.user = {
        user_id: decoded.user_id,
        role: dbUser?.role || decoded.role,
        name: dbUser?.name,
        parent_user_id: dbUser?.parent_user_id || null,
      };

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.user) return;

    const { user_id, role, name } = socket.user;

    // 1. Gabung ke room spesifik user_id (contoh: "user:MDR-570222f3")
    const userRoom = `user:${user_id}`;
    socket.join(userRoom);

    // 2. Gabung ke room role
    socket.join(`role:${role}`);
    if (role === "ASISTEN_LAPANGAN" || role === "KEPALA_KEBUN") {
      socket.join("role:APPROVER");
    }

    console.log(`🔌 Socket connected: ${name || user_id} (${role}) -> Joined [${userRoom}]`);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${name || user_id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = (): Server | null => ioInstance;

/**
 * Kirim notifikasi real-time ke Asisten Lapangan / Kepala Kebun saat Mandor selesai Sync laporan
 */
export const emitMonitoringSyncedNotification = async (params: {
  mandor_id: string;
  log_ids: string[];
  worker_name?: string;
}): Promise<void> => {
  if (!ioInstance) return;

  try {
    const mandor = await MsUser.findByPk(params.mandor_id, {
      attributes: ["user_id", "name", "role", "parent_user_id"],
    });

    const mandorName = mandor?.name || params.worker_name || "Mandor";
    const count = params.log_ids.length;

    const payload = {
      type: "MONITORING_SYNCED",
      title: "Laporan Monitoring Baru Masuk",
      message: `${mandorName} baru saja menyinkronkan ${count} laporan verifikasi untuk ditinjau.`,
      mandor_id: params.mandor_id,
      mandor_name: mandorName,
      count,
      log_ids: params.log_ids,
      timestamp: new Date().toISOString(),
    };

    // Jika Mandor punya parent_user_id (Atasan langsung), kirim ke room atasan tersebut & room APPROVER
    if (mandor?.parent_user_id) {
      ioInstance
        .to(`user:${mandor.parent_user_id}`)
        .to("role:APPROVER")
        .emit("notification:monitoring_synced", payload);
    } else {
      ioInstance.to("role:APPROVER").emit("notification:monitoring_synced", payload);
    }
  } catch (error) {
    console.error("emitMonitoringSyncedNotification error:", error);
  }
};

/**
 * Kirim notifikasi real-time spesifik ke Mandor pemilik laporan saat Asisten memberikan keputusan Approval / RE-CHECK
 */
export const emitApprovalDecisionNotification = async (params: {
  mandor_id: string;
  approver_id: string;
  log_id: string;
  status_approval: string;
  notes?: string | null;
}): Promise<void> => {
  if (!ioInstance) return;

  try {
    const approver = await MsUser.findByPk(params.approver_id, {
      attributes: ["user_id", "name", "role"],
    });

    const approverName = approver?.name || "Asisten Lapangan";
    const isApproved = params.status_approval === "APPROVED";

    const payload = {
      type: "APPROVAL_DECISION",
      title: isApproved
        ? "Laporan Monitoring Disetujui (APPROVED)"
        : "Laporan Perlu Perbaikan (RE-CHECK)",
      message: isApproved
        ? `Laporan #${params.log_id} telah disetujui oleh ${approverName}.`
        : `Laporan #${params.log_id} dikembalikan (RE-CHECK) oleh ${approverName}${params.notes ? `: "${params.notes}"` : "."}`,
      log_id: params.log_id,
      mandor_id: params.mandor_id,
      approver_id: params.approver_id,
      approver_name: approverName,
      status_approval: params.status_approval,
      notes: params.notes || null,
      timestamp: new Date().toISOString(),
    };

    // Kirim HANYA ke room pribadi milik Mandor pemilik laporan (`user:<mandor_id>`)
    ioInstance.to(`user:${params.mandor_id}`).emit("notification:approval_decision", payload);
  } catch (error) {
    console.error("emitApprovalDecisionNotification error:", error);
  }
};
