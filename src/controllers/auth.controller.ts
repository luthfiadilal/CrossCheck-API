import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MsUser from "../models/ms-user.model";
import { generateUserId, getCurrentTimestamp } from "../helpers/id-generator";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "crosscheck-secret-key";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

/**
 * POST /api/auth/register
 * Register akun baru dengan role MANDOR
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = "MANDOR" } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      res.status(400).json({
        status: "error",
        message: "Field name, email, dan password wajib diisi",
      });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await MsUser.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate user ID
    const userId = generateUserId(role);
    const now = getCurrentTimestamp();

    // Simpan user baru
    const newUser = await MsUser.create({
      user_id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      is_active: 1,
      created_at: now,
      updated_at: now,
    });

    // Generate token
    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil",
      data: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at,
        token,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Login user, return semua data user beserta role dan token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      res.status(400).json({
        status: "error",
        message: "Email dan password wajib diisi",
      });
      return;
    }

    // Cari user berdasarkan email
    const user = await MsUser.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Email tidak ditemukan",
      });
      return;
    }

    // Cek apakah akun aktif
    if (user.is_active !== 1) {
      res.status(403).json({
        status: "error",
        message: "Akun tidak aktif. Hubungi admin.",
      });
      return;
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "error",
        message: "Password yang Anda masukkan salah",
      });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        parent_user_id: user.parent_user_id,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        token,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
