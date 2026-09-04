-- =====================================================================
-- DATABASE: UKM IKRAAMUL QUR'AN DIGITAL DASHBOARD
-- Target RDBMS: MySQL v8.0+ / MariaDB
-- Auto-generated from runtime data
-- Last Updated: 2026-06-24T00:52:02.665Z
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `ikraamul_quran_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ikraamul_quran_db`;

-- ---------------------------------------------------------------------
-- Table 1: USERS (Anggota, Pengurus, Admin)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cash_records`;
DROP TABLE IF EXISTS `point_history`;
DROP TABLE IF EXISTS `memorization`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `rewards`;
DROP TABLE IF EXISTS `studies`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('Admin', 'Pengurus', 'Anggota') NOT NULL DEFAULT 'Anggota',
  `branch` VARCHAR(150) DEFAULT NULL,
  `prodi` VARCHAR(100) DEFAULT NULL COMMENT 'Program Studi / Jurusan',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `total_points` INT DEFAULT 0,
  `xp` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  `level_name` VARCHAR(50) DEFAULT 'Mubtadi',
  `group_memorization` VARCHAR(100) DEFAULT NULL,
  `target_memorization` INT DEFAULT 100,
  `completed_memorization` INT DEFAULT 0,
  `phone` VARCHAR(25) DEFAULT NULL,
  `joined_date` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: STUDIES (Kajian, Tahsin, Rapat, Kegiatan)
-- ---------------------------------------------------------------------
CREATE TABLE `studies` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `speaker` VARCHAR(150) NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat') NOT NULL,
  `lat` DECIMAL(10, 8) DEFAULT NULL,
  `lng` DECIMAL(11, 8) DEFAULT NULL,
  `quota` INT DEFAULT 100,
  `registered_count` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 3: ATTENDANCE (Presensi GPS & QR Code)
-- ---------------------------------------------------------------------
CREATE TABLE `attendance` (
  `id` VARCHAR(50) NOT NULL,
  `study_id` VARCHAR(50) NOT NULL,
  `study_title` VARCHAR(180) DEFAULT NULL,
  `member_id` VARCHAR(50) NOT NULL,
  `member_name` VARCHAR(150) DEFAULT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `status` ENUM('Hadir', 'Izin', 'Alpa', 'Sakit') NOT NULL,
  `method` ENUM('QR', 'GPS', 'Manual') NOT NULL,
  `lat` DECIMAL(10, 8) DEFAULT NULL,
  `lng` DECIMAL(11, 8) DEFAULT NULL,
  `distance` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Jarak dalam meter',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attendance_study` FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_member` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 4: MEMORIZATION (Setoran Hafalan Al-Qur'an)
-- ---------------------------------------------------------------------
CREATE TABLE `memorization` (
  `id` VARCHAR(50) NOT NULL,
  `member_id` VARCHAR(50) NOT NULL,
  `member_name` VARCHAR(150) DEFAULT NULL,
  `surah_name` VARCHAR(100) NOT NULL,
  `ayat_range` VARCHAR(100) NOT NULL,
  `ayat_count` INT NOT NULL,
  `juz` INT NOT NULL,
  `date` DATE NOT NULL,
  `reviewer` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Disetujui',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_memorization_member` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 5: REWARDS (Katalog Hadiah Poin Berkah)
-- ---------------------------------------------------------------------
CREATE TABLE `rewards` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `cost` INT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `icon` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 6: POINT_HISTORY (Log Poin Berkah)
-- ---------------------------------------------------------------------
CREATE TABLE `point_history` (
  `id` VARCHAR(50) NOT NULL,
  `member_id` VARCHAR(50) NOT NULL,
  `member_name` VARCHAR(150) DEFAULT NULL,
  `points` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `type` ENUM('Tambah', 'Kurang') NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_point_history_member` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 7: CASH_RECORDS (Uang Kas UKM)
-- ---------------------------------------------------------------------
CREATE TABLE `cash_records` (
  `id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `type` ENUM('Masuk', 'Keluar') NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `recorded_by` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

