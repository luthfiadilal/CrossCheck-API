import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "crosscheck-secret-key";

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
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
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
