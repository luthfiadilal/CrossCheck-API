import { Request, Response } from "express";

/**
 * POST /api/upload
 * Upload gambar (multipart/form-data dengan field 'image')
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: "error",
        message: "File gambar tidak ditemukan. Pastikan field bernama 'image'.",
      });
      return;
    }

    // Mendapatkan URL file
    // Asumsi server berjalan di port yang sudah diset di env, misalnya http://localhost:5000
    // File dapat diakses di URL: http://localhost:5000/uploads/nama-file.jpg
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      message: "Gambar berhasil diunggah",
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error("uploadImage error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengunggah gambar",
      error: error.message,
    });
  }
};
