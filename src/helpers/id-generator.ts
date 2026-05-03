import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique user ID dengan prefix role
 * Format: MDR-xxxxxxxx (MANDOR), AST-xxxxxxxx (ASISTEN), KBN-xxxxxxxx (KEPALA_KEBUN)
 */
export const generateUserId = (role: string): string => {
  const prefixMap: Record<string, string> = {
    MANDOR: "MDR",
    ASISTEN_LAPANGAN: "AST",
    KEPALA_KEBUN: "KBN",
  };

  const prefix = role.startsWith("MANDOR")
    ? "MDR"
    : prefixMap[role] || "USR";
  const shortId = uuidv4().split("-")[0];

  return `${prefix}-${shortId}`;
};

/**
 * Get current timestamp in ISO 8601 format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
