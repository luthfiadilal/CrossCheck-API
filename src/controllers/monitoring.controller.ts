import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middlewares/auth.middleware";
import TrMonitoringLog from "../models/tr-monitoring-log.model";
import TrMonitoringDetail from "../models/tr-monitoring-detail.model";
import MsUser from "../models/ms-user.model";
import MsTaskType from "../models/ms-task-type.model";
import { getCurrentTimestamp } from "../helpers/id-generator";
import sequelize from "../config/database";

/**
 * POST /api/monitoring
 * Mandor membuat laporan monitoring baru beserta detail pekerjaan
 *
 * Body:
 * {
 *   worker_name: "Nama Pekerja",
 *   location_lat: "-2.123456",
 *   location_long: "110.123456",
 *   details: [
 *     { task_type_id: "TSK-xxx", quantity: "10", conditions: "BAIK", photo_path: "...", descriptions: "..." },
 *     ...
 *   ]
 * }
 */
export const createMonitoringLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const mandor_id = req.user!.user_id;
    const { worker_name, details } = req.body;

    // Validasi input
    if (!worker_name) {
      res.status(400).json({
        status: "error",
        message: "Field worker_name wajib diisi",
      });
      return;
    }

    if (!details || !Array.isArray(details) || details.length === 0) {
      res.status(400).json({
        status: "error",
        message: "Minimal 1 detail pekerjaan harus diisi",
      });
      return;
    }

    const now = getCurrentTimestamp();
    const log_id = `LOG-${uuidv4().split("-")[0]}`;

    // Buat header monitoring log
    const monitoringLog = await TrMonitoringLog.create(
      {
        log_id,
        worker_name,
        mandor_id,
        status_approval: "PENDING",
        created_at: now,
        updated_at: now,
      },
      { transaction }
    );

    // Buat detail pekerjaan
    const detailRecords = details.map((detail: any) => ({
      detail_id: `DTL-${uuidv4().split("-")[0]}`,
      log_id,
      task_type_id: detail.task_type_id,
      quantity: detail.quantity || null,
      conditions: detail.conditions || null,
      photo_path: detail.photo_path || null,
      descriptions: detail.descriptions || null,
      locations: detail.locations || null,
      status_task: "PENDING",
      created_at: now,
    }));

    await TrMonitoringDetail.bulkCreate(detailRecords, { transaction });

    await transaction.commit();

    // Ambil data lengkap dengan relasi
    const result = await TrMonitoringLog.findByPk(log_id, {
      include: [
        {
          model: TrMonitoringDetail,
          as: "details",
          include: [{ model: MsTaskType, as: "taskType" }],
        },
        {
          model: MsUser,
          as: "mandor",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: "Laporan monitoring berhasil dibuat",
      data: result,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("createMonitoringLog error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * GET /api/monitoring
 * Ambil semua laporan monitoring
 * - Mandor: hanya melihat laporan miliknya
 * - Asisten/Kepala Kebun: melihat laporan mandor bawahannya
 */
export const getAllMonitoringLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, role } = req.user!;
    const { status, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Filter berdasarkan role
    const whereClause: any = {};

    if (role === "MANDOR") {
      whereClause.mandor_id = user_id;
    }

    if (status) {
      whereClause.status_approval = status;
    }

    const { count, rows } = await TrMonitoringLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: TrMonitoringDetail,
          as: "details",
          include: [{ model: MsTaskType, as: "taskType" }],
        },
        {
          model: MsUser,
          as: "mandor",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      status: "success",
      message: "Data laporan monitoring berhasil diambil",
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error: any) {
    console.error("getAllMonitoringLogs error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * GET /api/monitoring/:id
 * Ambil detail laporan monitoring berdasarkan ID
 */
export const getMonitoringLogById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const monitoringLog = await TrMonitoringLog.findByPk(id, {
      include: [
        {
          model: TrMonitoringDetail,
          as: "details",
          include: [{ model: MsTaskType, as: "taskType" }],
        },
        {
          model: MsUser,
          as: "mandor",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
    });

    if (!monitoringLog) {
      res.status(404).json({
        status: "error",
        message: "Laporan monitoring tidak ditemukan",
      });
      return;
    }

    res.json({
      status: "success",
      data: monitoringLog,
    });
  } catch (error: any) {
    console.error("getMonitoringLogById error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * PUT /api/monitoring/:id
 * Mandor update laporan (hanya jika status masih PENDING atau RE-CHECK)
 */
export const updateMonitoringLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const id = req.params.id as string;
    const mandor_id = req.user!.user_id;
    const { worker_name, details } = req.body;

    const monitoringLog = await TrMonitoringLog.findByPk(id);

    if (!monitoringLog) {
      res.status(404).json({
        status: "error",
        message: "Laporan monitoring tidak ditemukan",
      });
      return;
    }

    // Pastikan mandor hanya bisa edit miliknya sendiri
    if (monitoringLog.mandor_id !== mandor_id) {
      res.status(403).json({
        status: "error",
        message: "Anda tidak berhak mengubah laporan ini",
      });
      return;
    }

    // Hanya bisa edit jika PENDING atau RE-CHECK
    if (monitoringLog.status_approval === "APPROVED") {
      res.status(400).json({
        status: "error",
        message: "Laporan yang sudah APPROVED tidak dapat diubah",
      });
      return;
    }

    const now = getCurrentTimestamp();

    // Update header
    await monitoringLog.update(
      {
        ...(worker_name && { worker_name }),
        status_approval: "PENDING",
        updated_at: now,
      },
      { transaction }
    );

    // Jika ada details baru, hapus yang lama dan buat ulang
    if (details && Array.isArray(details) && details.length > 0) {
      await TrMonitoringDetail.destroy({
        where: { log_id: id },
        transaction,
      });

      const detailRecords = details.map((detail: any) => ({
        detail_id: `DTL-${uuidv4().split("-")[0]}`,
        log_id: id,
        task_type_id: detail.task_type_id,
        quantity: detail.quantity || null,
        conditions: detail.conditions || null,
        photo_path: detail.photo_path || null,
        descriptions: detail.descriptions || null,
        locations: detail.locations || null,
        status_task: "PENDING",
        created_at: now,
      }));

      await TrMonitoringDetail.bulkCreate(detailRecords, { transaction });
    }

    await transaction.commit();

    // Ambil data terbaru
    const result = await TrMonitoringLog.findByPk(id, {
      include: [
        {
          model: TrMonitoringDetail,
          as: "details",
          include: [{ model: MsTaskType, as: "taskType" }],
        },
        {
          model: MsUser,
          as: "mandor",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
    });

    res.json({
      status: "success",
      message: "Laporan monitoring berhasil diperbarui",
      data: result,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("updateMonitoringLog error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/monitoring/:id
 * Mandor hapus laporan (hanya jika masih PENDING)
 */
export const deleteMonitoringLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const id = req.params.id as string;
    const mandor_id = req.user!.user_id;

    const monitoringLog = await TrMonitoringLog.findByPk(id);

    if (!monitoringLog) {
      res.status(404).json({
        status: "error",
        message: "Laporan monitoring tidak ditemukan",
      });
      return;
    }

    if (monitoringLog.mandor_id !== mandor_id) {
      res.status(403).json({
        status: "error",
        message: "Anda tidak berhak menghapus laporan ini",
      });
      return;
    }

    if (monitoringLog.status_approval !== "PENDING") {
      res.status(400).json({
        status: "error",
        message: "Hanya laporan dengan status PENDING yang dapat dihapus",
      });
      return;
    }

    // Hapus detail dulu, lalu header
    await TrMonitoringDetail.destroy({ where: { log_id: id }, transaction });
    await monitoringLog.destroy({ transaction });

    await transaction.commit();

    res.json({
      status: "success",
      message: "Laporan monitoring berhasil dihapus",
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("deleteMonitoringLog error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
