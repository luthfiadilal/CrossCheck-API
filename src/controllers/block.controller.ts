import { Request, Response } from "express";
import MsBlock from "../models/ms-block.model";
import { getCurrentTimestamp } from "../helpers/id-generator";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/blocks
 * Ambil semua data master blok
 */
export const getAllBlocks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blocks = await MsBlock.findAll({
      order: [["block_code", "ASC"]],
    });

    res.json({
      status: "success",
      message: "Data master blok berhasil diambil",
      data: blocks,
    });
  } catch (error: any) {
    console.error("getAllBlocks error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * GET /api/blocks/:id
 * Ambil master blok berdasarkan ID atau block_code
 */
export const getBlockById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const block = await MsBlock.findByPk(id);

    if (!block) {
      res.status(404).json({
        status: "error",
        message: "Blok tidak ditemukan",
      });
      return;
    }

    res.json({
      status: "success",
      data: block,
    });
  } catch (error: any) {
    console.error("getBlockById error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * POST /api/blocks
 * Buat master blok baru
 */
export const createBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { block_code, block_name, afdeling, area_ha } = req.body;

    if (!block_code) {
      res.status(400).json({
        status: "error",
        message: "Field block_code wajib diisi",
      });
      return;
    }

    const codeUpper = String(block_code).trim().toUpperCase();
    const existing = await MsBlock.findOne({ where: { block_code: codeUpper } });
    if (existing) {
      res.status(400).json({
        status: "error",
        message: `Blok dengan kode ${codeUpper} sudah terdaftar`,
      });
      return;
    }

    const block_id = `BLK-${uuidv4().split("-")[0]}`;

    const block = await MsBlock.create({
      block_id,
      block_code: codeUpper,
      block_name: block_name ? String(block_name).trim() : `Blok ${codeUpper}`,
      afdeling: afdeling || null,
      area_ha: area_ha !== undefined && area_ha !== "" ? Number(area_ha) : null,
      created_at: getCurrentTimestamp(),
    });

    res.status(201).json({
      status: "success",
      message: "Master blok berhasil dibuat",
      data: block,
    });
  } catch (error: any) {
    console.error("createBlock error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * PUT /api/blocks/:id
 * Update master blok
 */
export const updateBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { block_code, block_name, afdeling, area_ha } = req.body;

    const block = await MsBlock.findByPk(id);
    if (!block) {
      res.status(404).json({
        status: "error",
        message: "Blok tidak ditemukan",
      });
      return;
    }

    await block.update({
      ...(block_code && { block_code: String(block_code).trim().toUpperCase() }),
      ...(block_name && { block_name: String(block_name).trim() }),
      ...(afdeling !== undefined && { afdeling }),
      ...(area_ha !== undefined && { area_ha: area_ha !== null && area_ha !== "" ? Number(area_ha) : null }),
    });

    res.json({
      status: "success",
      message: "Master blok berhasil diperbarui",
      data: block,
    });
  } catch (error: any) {
    console.error("updateBlock error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/blocks/:id
 * Hapus master blok
 */
export const deleteBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const block = await MsBlock.findByPk(id);
    if (!block) {
      res.status(404).json({
        status: "error",
        message: "Blok tidak ditemukan",
      });
      return;
    }

    await block.destroy();

    res.json({
      status: "success",
      message: "Master blok berhasil dihapus",
    });
  } catch (error: any) {
    console.error("deleteBlock error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
