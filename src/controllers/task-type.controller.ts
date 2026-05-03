import { Request, Response } from "express";
import MsTaskType from "../models/ms-task-type.model";
import { getCurrentTimestamp } from "../helpers/id-generator";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/task-types
 * Ambil semua tipe tugas
 */
export const getAllTaskTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const taskTypes = await MsTaskType.findAll({
      order: [["task_name", "ASC"]],
    });

    res.json({
      status: "success",
      message: "Data tipe tugas berhasil diambil",
      data: taskTypes,
    });
  } catch (error: any) {
    console.error("getAllTaskTypes error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * GET /api/task-types/:id
 * Ambil tipe tugas berdasarkan ID
 */
export const getTaskTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const taskType = await MsTaskType.findByPk(id);

    if (!taskType) {
      res.status(404).json({
        status: "error",
        message: "Tipe tugas tidak ditemukan",
      });
      return;
    }

    res.json({
      status: "success",
      data: taskType,
    });
  } catch (error: any) {
    console.error("getTaskTypeById error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * POST /api/task-types
 * Buat tipe tugas baru
 */
export const createTaskType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { task_name, unit_measure } = req.body;

    if (!task_name || !unit_measure) {
      res.status(400).json({
        status: "error",
        message: "Field task_name dan unit_measure wajib diisi",
      });
      return;
    }

    const task_type_id = `TSK-${uuidv4().split("-")[0]}`;

    const taskType = await MsTaskType.create({
      task_type_id,
      task_name,
      unit_measure,
      created_at: getCurrentTimestamp(),
    });

    res.status(201).json({
      status: "success",
      message: "Tipe tugas berhasil dibuat",
      data: taskType,
    });
  } catch (error: any) {
    console.error("createTaskType error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * PUT /api/task-types/:id
 * Update tipe tugas
 */
export const updateTaskType = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { task_name, unit_measure } = req.body;

    const taskType = await MsTaskType.findByPk(id);
    if (!taskType) {
      res.status(404).json({
        status: "error",
        message: "Tipe tugas tidak ditemukan",
      });
      return;
    }

    await taskType.update({
      ...(task_name && { task_name }),
      ...(unit_measure && { unit_measure }),
    });

    res.json({
      status: "success",
      message: "Tipe tugas berhasil diperbarui",
      data: taskType,
    });
  } catch (error: any) {
    console.error("updateTaskType error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/task-types/:id
 * Hapus tipe tugas
 */
export const deleteTaskType = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const taskType = await MsTaskType.findByPk(id);
    if (!taskType) {
      res.status(404).json({
        status: "error",
        message: "Tipe tugas tidak ditemukan",
      });
      return;
    }

    await taskType.destroy();

    res.json({
      status: "success",
      message: "Tipe tugas berhasil dihapus",
    });
  } catch (error: any) {
    console.error("deleteTaskType error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
