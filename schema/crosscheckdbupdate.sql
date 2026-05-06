-- --------------------------------------------------------
-- Host:                         154.19.37.71
-- Server version:               8.0.42-0ubuntu0.20.04.1 - (Ubuntu)
-- Server OS:                    Linux
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table crosscheckdb.ms_task_type
CREATE TABLE IF NOT EXISTS `ms_task_type` (
  `task_type_id` varchar(50) NOT NULL COMMENT 'ID unik tipe tugas',
  `task_name` varchar(100) NOT NULL COMMENT 'Nama pekerjaan (Contoh: Beneficial plant, Pruning, dll)',
  `unit_measure` varchar(20) NOT NULL COMMENT 'Satuan ukur (hektar, tph, pokok, dll)',
  `created_at` varchar(30) DEFAULT NULL COMMENT 'Waktu data master dibuat',
  PRIMARY KEY (`task_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table crosscheckdb.ms_user
CREATE TABLE IF NOT EXISTS `ms_user` (
  `user_id` varchar(50) NOT NULL COMMENT 'ID unik pengguna, dibuat melalui helper backend',
  `name` varchar(100) NOT NULL COMMENT 'Nama lengkap karyawan',
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(30) NOT NULL COMMENT 'Jabatan: MANDOR, ASISTEN_LAPANGAN, atau KEPALA_KEBUN',
  `parent_user_id` varchar(50) DEFAULT NULL COMMENT 'ID Atasan langsung untuk hirarki approval',
  `is_active` smallint DEFAULT NULL,
  `created_at` varchar(30) DEFAULT NULL COMMENT 'Waktu data dibuat (format ISO 8601)',
  `updated_at` varchar(30) DEFAULT NULL COMMENT 'Waktu data terakhir diubah',
  PRIMARY KEY (`user_id`),
  KEY `parent_user_id` (`parent_user_id`),
  CONSTRAINT `ms_user_ibfk_1` FOREIGN KEY (`parent_user_id`) REFERENCES `ms_user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table crosscheckdb.tr_approval_history
CREATE TABLE IF NOT EXISTS `tr_approval_history` (
  `approval_id` varchar(50) NOT NULL COMMENT 'ID unik riwayat verifikasi',
  `log_id` varchar(50) NOT NULL COMMENT 'ID laporan yang diverifikasi',
  `approver_id` varchar(50) NOT NULL COMMENT 'ID User yang melakukan verifikasi (ms_user)',
  `status_approval` varchar(20) NOT NULL COMMENT 'Keputusan: APPROVE atau RE-CHECK',
  `notes` varchar(255) DEFAULT NULL COMMENT 'Alasan penolakan atau catatan tambahan dari atasan',
  `action_date` varchar(30) NOT NULL COMMENT 'Waktu tindakan verifikasi dilakukan',
  PRIMARY KEY (`approval_id`),
  KEY `log_id` (`log_id`),
  KEY `approver_id` (`approver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table crosscheckdb.tr_monitoring_detail
CREATE TABLE IF NOT EXISTS `tr_monitoring_detail` (
  `detail_id` varchar(50) NOT NULL COMMENT 'ID unik baris detail',
  `log_id` varchar(50) NOT NULL COMMENT 'ID Header Relasi ke tr_monitoring_log',
  `task_type_id` varchar(50) NOT NULL COMMENT 'ID Jenis pekerjaan Relasi ke ms_task_type',
  `nama_anggota` varchar(200) DEFAULT NULL COMMENT 'Nama anggota',
  `quantity` varchar(20) DEFAULT NULL COMMENT 'Jumlah hasil kerja yang dicapai',
  `conditions` varchar(10) DEFAULT NULL COMMENT 'Kualitas hasil kerja BAIK SEDANG atau BURUK',
  `photo_path` varchar(255) DEFAULT NULL COMMENT 'Alamat simpan file foto bukti lapangan',
  `descriptions` varchar(255) DEFAULT NULL COMMENT 'Catatan tambahan terkait kondisi di lapangan',
  `nomor_baris` varchar(50) DEFAULT NULL COMMENT 'Nomor baris pekerjaan yang sedang di monitor',
  `created_at` varchar(30) DEFAULT NULL COMMENT 'Waktu detail item ini dicatat',
  `locations` varchar(255) DEFAULT NULL COMMENT 'Lokasi',
  `status_task` varchar(255) DEFAULT NULL COMMENT 'PENDING, RECHECK, APPROVED',
  PRIMARY KEY (`detail_id`),
  KEY `log_id` (`log_id`),
  KEY `task_type_id` (`task_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table crosscheckdb.tr_monitoring_log
CREATE TABLE IF NOT EXISTS `tr_monitoring_log` (
  `log_id` varchar(50) NOT NULL COMMENT 'ID unik transaksi laporan',
  `worker_name` varchar(100) NOT NULL COMMENT 'Nama pekerja lapangan yang melakukan tugas',
  `mandor_id` varchar(50) NOT NULL COMMENT 'ID Mandor yang bertanggung jawab (Relasi ke ms_user)',
  `status_approval` varchar(20) DEFAULT 'PENDING' COMMENT 'Status akhir laporan: PENDING, APPROVED, atau RE-CHECK',
  `created_at` varchar(30) DEFAULT NULL COMMENT 'Waktu laporan pertama kali dikirim',
  `updated_at` varchar(30) DEFAULT NULL COMMENT 'Waktu update status terakhir',
  PRIMARY KEY (`log_id`),
  KEY `mandor_id` (`mandor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table crosscheckdb.tr_monitoring_photos
CREATE TABLE IF NOT EXISTS `tr_monitoring_photos` (
  `photo_id` varchar(50) NOT NULL COMMENT 'ID unik foto',
  `detail_id` varchar(50) NOT NULL COMMENT 'Relasi ke tr_monitoring_detail',
  `photo_path` varchar(255) NOT NULL COMMENT 'Path/URL file foto',
  `caption` varchar(255) DEFAULT NULL COMMENT 'Keterangan khusus untuk foto ini',
  `created_at` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `detail_id` (`detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
