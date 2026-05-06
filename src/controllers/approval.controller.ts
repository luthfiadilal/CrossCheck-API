import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middlewares/auth.middleware";
import TrApprovalHistory from "../models/tr-approval-history.model";
import TrMonitoringLog from "../models/tr-monitoring-log.model";
import TrMonitoringDetail from "../models/tr-monitoring-detail.model";
import MsUser from "../models/ms-user.model";
import MsTaskType from "../models/ms-task-type.model";
import TrMonitoringPhoto from "../models/tr-monitoring-photo.model";
import { getCurrentTimestamp } from "../helpers/id-generator";

/**
 * POST /api/approval
 * Asisten Lapangan / Kepala Kebun melakukan verifikasi laporan mandor
 *
 * Body:
 * {
 *   log_id: "LOG-xxx",
 *   status_approval: "APPROVED" | "RE-CHECK",
 *   notes: "Catatan opsional"
 * }
 */
export const submitApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const approver_id = req.user!.user_id;
    const { log_id, status_approval, notes } = req.body;

    // Validasi input
    if (!log_id || !status_approval) {
      res.status(400).json({
        status: "error",
        message: "Field log_id dan status_approval wajib diisi",
      });
      return;
    }

    // Validasi status
    const validStatuses = ["APPROVED", "RE-CHECK"];
    if (!validStatuses.includes(status_approval)) {
      res.status(400).json({
        status: "error",
        message: "status_approval harus APPROVED atau RE-CHECK",
      });
      return;
    }

    let targetStatus = status_approval;

    // Jika ingin APPROVE secara total, cek apakah semua detail sudah APPROVED
    if (status_approval === "APPROVED") {
      const totalDetails = await TrMonitoringDetail.count({ where: { log_id } });
      const approvedDetails = await TrMonitoringDetail.count({ 
        where: { log_id, status_task: "APPROVED" } 
      });

      if (totalDetails === 0 || approvedDetails < totalDetails) {
        res.status(400).json({
          status: "error",
          message: "Semua detail tugas harus di-APPROVE satu per satu sebelum menyetujui laporan secara keseluruhan",
        });
        return;
      }
    }

    // Cek apakah log ada
    const monitoringLog = await TrMonitoringLog.findByPk(log_id);
    if (!monitoringLog) {
      res.status(404).json({
        status: "error",
        message: "Laporan monitoring tidak ditemukan",
      });
      return;
    }

    // Cek apakah sudah APPROVED
    if (monitoringLog.status_approval === "APPROVED") {
      res.status(400).json({
        status: "error",
        message: "Laporan ini sudah APPROVED sebelumnya",
      });
      return;
    }

    const now = getCurrentTimestamp();
    const approval_id = `APR-${uuidv4().split("-")[0]}`;

    // Simpan riwayat approval
    const approval = await TrApprovalHistory.create({
      approval_id,
      log_id,
      approver_id,
      status_approval,
      notes: notes || null,
      action_date: now,
    });

    // Update status di monitoring log
    await monitoringLog.update({
      status_approval: targetStatus,
      updated_at: now,
    });

    // Ambil data approval lengkap
    const result = await TrApprovalHistory.findByPk(approval_id, {
      include: [
        {
          model: MsUser,
          as: "approver",
          attributes: ["user_id", "name", "email", "role"],
        },
        {
          model: TrMonitoringLog,
          as: "monitoringLog",
          include: [
            {
              model: MsUser,
              as: "mandor",
              attributes: ["user_id", "name", "email", "role"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: `Laporan berhasil di-${status_approval === "APPROVED" ? "approve" : "re-check"}`,
      data: result,
    });
  } catch (error: any) {
    console.error("submitApproval error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * POST /api/approval/detail
 * Melakukan approval per item pekerjaan
 */
export const submitDetailApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { detail_id, status, notes } = req.body;

    if (!detail_id || !status) {
      res.status(400).json({
        status: "error",
        message: "Field detail_id dan status wajib diisi",
      });
      return;
    }

    const detail = await TrMonitoringDetail.findByPk(detail_id);
    if (!detail) {
      res.status(404).json({
        status: "error",
        message: "Detail pekerjaan tidak ditemukan",
      });
      return;
    }

    await detail.update({ status_task: status });

    res.json({
      status: "success",
      message: `Status tugas berhasil diubah menjadi ${status}`,
      data: detail,
    });
  } catch (error: any) {
    console.error("submitDetailApproval error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * GET /api/approval/history/:logId
 * Ambil riwayat approval untuk suatu laporan monitoring
 */
export const getApprovalHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { logId } = req.params;

    const histories = await TrApprovalHistory.findAll({
      where: { log_id: logId },
      include: [
        {
          model: MsUser,
          as: "approver",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
      order: [["action_date", "DESC"]],
    });

    res.json({
      status: "success",
      message: "Riwayat approval berhasil diambil",
      data: histories,
    });
  } catch (error: any) {
    console.error("getApprovalHistory error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * GET /api/approval/pending
 * Ambil semua laporan yang menunggu verifikasi (untuk atasan)
 */
export const getPendingApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, role } = req.user!;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await TrMonitoringLog.findAndCountAll({
      where: { status_approval: "PENDING" },
      include: [
        {
          model: TrMonitoringDetail,
          as: "details",
          include: [
            { model: MsTaskType, as: "taskType" },
            { model: TrMonitoringPhoto, as: "photos" }
          ],
        },
        {
          model: MsUser,
          as: "mandor",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "ASC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      status: "success",
      message: "Data laporan pending berhasil diambil",
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error: any) {
    console.error("getPendingApprovals error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
