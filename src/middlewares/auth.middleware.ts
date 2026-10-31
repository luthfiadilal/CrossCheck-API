import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const getJwtSecret = (): jwt.Secret => {
  return process.env.JWT_SECRET || "crosscheck-jwt-secret-2026";
};

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: string;
  };
}

/**
 * Middleware untuk verifikasi JWT token
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { user_id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback verifikasi jika ada perbedaan secret lama vs baru
    try {
      const fallbackSecret = "crosscheck-secret-key";
      const decoded = jwt.verify(token, fallbackSecret) as { user_id: string; role: string };
      req.user = decoded;
      next();
    } catch (_) {
      res.status(401).json({
        status: "error",
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses untuk fitur ini",
      });
      return;
    }

    const userRole = req.user.role;
    
    // Cek apakah role user ada di daftar yang diizinkan
    // Atau jika role user diawali dengan salah satu role yang diizinkan (misal: MANDOR A cocok dengan MANDOR)
    const isAllowed = allowedRoles.some(role => 
      userRole === role || userRole.startsWith(`${role} `) || userRole.startsWith(role)
    );

    if (!isAllowed) {
      res.status(403).json({
        status: "error",
        message: `Role ${userRole} tidak memiliki akses untuk fitur ini`,
      });
      return;
    }
    next();
  };
};
