import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from potential .env locations
const envPaths = [
  path.join(process.cwd(), ".env"),
  path.join(__dirname, ".env"),
  path.join(__dirname, "..", ".env"),
];

let loadedEnv = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[Env] Loaded environment configuration from: ${envPath}`);
    loadedEnv = true;
    break;
  }
}
if (!loadedEnv) {
  dotenv.config();
}

import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import mysql from "mysql2/promise";
import { Member, Study, AttendanceRecord, MemorizationRecord, PointHistory, RewardItem, ChatMessage, CashRecord } from "./src/types";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Path to file persistence (simulating relational memory)
const DATA_FILE = path.join(process.cwd(), "database_store.json");
const SQL_FILE = path.join(process.cwd(), "databaseikra.sql");

interface Database {
  members: Member[];
  studies: Study[];
  attendance: AttendanceRecord[];
  memorization: MemorizationRecord[];
  rewards: RewardItem[];
  pointHistory: PointHistory[];
  cashRecords: CashRecord[];
}

// Initial seed data — kosong, admin mengisi data sendiri
const INITIAL_DATABASE: Database = {
  members: [],
  studies: [],
  attendance: [],
  memorization: [],
  rewards: [],
  pointHistory: [],
  cashRecords: []
};

// SQL escape helper: escape single quotes for SQL string values
function esc(val: string | undefined | null): string {
  if (val === undefined || val === null) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// Generate database.sql file with DDL schema + INSERT statements from current data
function saveDatabaseSQL(data: Database) {
  try {
    const timestamp = new Date().toISOString();
    let sql = `-- =====================================================================
-- DATABASE: UKM IKRAAMUL QUR'AN DIGITAL DASHBOARD
-- Target RDBMS: MySQL v8.0+ / MariaDB
-- Auto-generated from runtime data
-- Last Updated: ${timestamp}
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`ikraamul_quran_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`ikraamul_quran_db\`;

-- ---------------------------------------------------------------------
-- Table 1: USERS (Anggota, Pengurus, Admin)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS \`cash_records\`;
DROP TABLE IF EXISTS \`point_history\`;
DROP TABLE IF EXISTS \`memorization\`;
DROP TABLE IF EXISTS \`attendance\`;
DROP TABLE IF EXISTS \`rewards\`;
DROP TABLE IF EXISTS \`studies\`;
DROP TABLE IF EXISTS \`users\`;

CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`role\` ENUM('Admin', 'Pengurus', 'Anggota') NOT NULL DEFAULT 'Anggota',
  \`branch\` VARCHAR(150) DEFAULT NULL,
  \`prodi\` VARCHAR(100) DEFAULT NULL COMMENT 'Program Studi / Jurusan',
  \`avatar\` MEDIUMTEXT DEFAULT NULL,
  \`total_points\` INT DEFAULT 0,
  \`xp\` INT DEFAULT 0,
  \`level\` INT DEFAULT 1,
  \`level_name\` VARCHAR(50) DEFAULT 'Mubtadi',
  \`group_memorization\` VARCHAR(100) DEFAULT NULL,
  \`target_memorization\` INT DEFAULT 100,
  \`completed_memorization\` INT DEFAULT 0,
  \`phone\` VARCHAR(25) DEFAULT NULL,
  \`joined_date\` DATE NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: STUDIES (Kajian, Tahsin, Rapat, Kegiatan)
-- ---------------------------------------------------------------------
CREATE TABLE \`studies\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(180) NOT NULL,
  \`speaker\` VARCHAR(150) NOT NULL,
  \`date\` DATE NOT NULL,
  \`time\` VARCHAR(50) NOT NULL,
  \`location\` VARCHAR(255) NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`image_url\` MEDIUMTEXT DEFAULT NULL,
  \`type\` ENUM('Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat') NOT NULL,
  \`lat\` DECIMAL(10, 8) DEFAULT NULL,
  \`lng\` DECIMAL(11, 8) DEFAULT NULL,
  \`quota\` INT DEFAULT 100,
  \`registered_count\` INT DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 3: ATTENDANCE (Presensi GPS & QR Code)
-- ---------------------------------------------------------------------
CREATE TABLE \`attendance\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`study_id\` VARCHAR(50) NOT NULL,
  \`study_title\` VARCHAR(180) DEFAULT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`member_name\` VARCHAR(150) DEFAULT NULL,
  \`date\` DATE NOT NULL,
  \`time\` VARCHAR(50) NOT NULL,
  \`status\` ENUM('Hadir', 'Izin', 'Alpa', 'Sakit') NOT NULL,
  \`method\` ENUM('QR', 'GPS', 'Manual') NOT NULL,
  \`lat\` DECIMAL(10, 8) DEFAULT NULL,
  \`lng\` DECIMAL(11, 8) DEFAULT NULL,
  \`distance\` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Jarak dalam meter',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_attendance_study\` FOREIGN KEY (\`study_id\`) REFERENCES \`studies\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_attendance_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 4: MEMORIZATION (Setoran Hafalan Al-Qur'an)
-- ---------------------------------------------------------------------
CREATE TABLE \`memorization\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`member_name\` VARCHAR(150) DEFAULT NULL,
  \`surah_name\` VARCHAR(100) NOT NULL,
  \`ayat_range\` VARCHAR(100) NOT NULL,
  \`ayat_count\` INT NOT NULL,
  \`juz\` INT NOT NULL,
  \`date\` DATE NOT NULL,
  \`reviewer\` VARCHAR(100) NOT NULL,
  \`status\` VARCHAR(50) DEFAULT 'Disetujui',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_memorization_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 5: REWARDS (Katalog Hadiah Poin Berkah)
-- ---------------------------------------------------------------------
CREATE TABLE \`rewards\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`cost\` INT NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`icon\` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 6: POINT_HISTORY (Log Poin Berkah)
-- ---------------------------------------------------------------------
CREATE TABLE \`point_history\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`member_name\` VARCHAR(150) DEFAULT NULL,
  \`points\` INT NOT NULL,
  \`description\` VARCHAR(255) NOT NULL,
  \`date\` DATE NOT NULL,
  \`type\` ENUM('Tambah', 'Kurang') NOT NULL,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_point_history_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 7: CASH_RECORDS (Uang Kas UKM)
-- ---------------------------------------------------------------------
CREATE TABLE \`cash_records\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`amount\` DECIMAL(15, 2) NOT NULL,
  \`type\` ENUM('Masuk', 'Keluar') NOT NULL,
  \`description\` VARCHAR(255) NOT NULL,
  \`date\` DATE NOT NULL,
  \`recorded_by\` VARCHAR(150) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

    // ===== INSERT DATA: USERS =====
    if (data.members.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: USERS\n-- =====================================================================\n`;
      for (const m of data.members) {
        sql += `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`role\`, \`branch\`, \`prodi\`, \`avatar\`, \`total_points\`, \`xp\`, \`level\`, \`level_name\`, \`group_memorization\`, \`target_memorization\`, \`completed_memorization\`, \`phone\`, \`joined_date\`) VALUES (${esc(m.id)}, ${esc(m.name)}, ${esc(m.email)}, ${esc(m.role)}, ${esc(m.branch)}, ${esc(m.prodi)}, ${esc(m.avatar)}, ${m.totalPoints}, ${m.xp}, ${m.level}, ${esc(m.levelName)}, ${esc(m.groupMemorization)}, ${m.targetMemorization}, ${m.completedMemorization}, ${esc(m.phone)}, ${esc(m.joinedDate)});\n`;
      }
    }

    // ===== INSERT DATA: STUDIES =====
    if (data.studies.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: STUDIES\n-- =====================================================================\n`;
      for (const s of data.studies) {
        sql += `INSERT INTO \`studies\` (\`id\`, \`title\`, \`speaker\`, \`date\`, \`time\`, \`location\`, \`description\`, \`image_url\`, \`type\`, \`lat\`, \`lng\`, \`quota\`, \`registered_count\`) VALUES (${esc(s.id)}, ${esc(s.title)}, ${esc(s.speaker)}, ${esc(s.date)}, ${esc(s.time)}, ${esc(s.location)}, ${esc(s.description)}, ${s.imageUrl ? esc(s.imageUrl) : 'NULL'}, ${esc(s.type)}, ${s.lat}, ${s.lng}, ${s.quota}, ${s.registeredCount || 0});\n`;
      }
    }

    // ===== INSERT DATA: ATTENDANCE =====
    if (data.attendance.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: ATTENDANCE\n-- =====================================================================\n`;
      for (const a of data.attendance) {
        sql += `INSERT INTO \`attendance\` (\`id\`, \`study_id\`, \`study_title\`, \`member_id\`, \`member_name\`, \`date\`, \`time\`, \`status\`, \`method\`, \`lat\`, \`lng\`, \`distance\`) VALUES (${esc(a.id)}, ${esc(a.studyId)}, ${esc(a.studyTitle)}, ${esc(a.memberId)}, ${esc(a.memberName)}, ${esc(a.date)}, ${esc(a.time)}, ${esc(a.status)}, ${esc(a.method)}, ${a.lat !== undefined ? a.lat : 'NULL'}, ${a.lng !== undefined ? a.lng : 'NULL'}, ${a.distance !== undefined ? a.distance : 'NULL'});\n`;
      }
    }

    // ===== INSERT DATA: MEMORIZATION =====
    if (data.memorization.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: MEMORIZATION\n-- =====================================================================\n`;
      for (const h of data.memorization) {
        sql += `INSERT INTO \`memorization\` (\`id\`, \`member_id\`, \`member_name\`, \`surah_name\`, \`ayat_range\`, \`ayat_count\`, \`juz\`, \`date\`, \`reviewer\`, \`status\`) VALUES (${esc(h.id)}, ${esc(h.memberId)}, ${esc(h.memberName)}, ${esc(h.surahName)}, ${esc(h.ayatRange)}, ${h.ayatCount}, ${h.juz}, ${esc(h.date)}, ${esc(h.reviewer)}, ${esc(h.status)});\n`;
      }
    }

    // ===== INSERT DATA: REWARDS =====
    if (data.rewards.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: REWARDS\n-- =====================================================================\n`;
      for (const r of data.rewards) {
        sql += `INSERT INTO \`rewards\` (\`id\`, \`title\`, \`cost\`, \`description\`, \`stock\`, \`icon\`) VALUES (${esc(r.id)}, ${esc(r.title)}, ${r.cost}, ${esc(r.description)}, ${r.stock}, ${esc(r.icon)});\n`;
      }
    }

    // ===== INSERT DATA: POINT_HISTORY =====
    if (data.pointHistory.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: POINT_HISTORY\n-- =====================================================================\n`;
      for (const p of data.pointHistory) {
        sql += `INSERT INTO \`point_history\` (\`id\`, \`member_id\`, \`member_name\`, \`points\`, \`description\`, \`date\`, \`type\`) VALUES (${esc(p.id)}, ${esc(p.memberId)}, ${esc(p.memberName)}, ${p.points}, ${esc(p.description)}, ${esc(p.date)}, ${esc(p.type)});\n`;
      }
    }

    // ===== INSERT DATA: CASH_RECORDS =====
    if (data.cashRecords && data.cashRecords.length > 0) {
      sql += `\n-- =====================================================================\n-- DATA: CASH_RECORDS\n-- =====================================================================\n`;
      for (const c of data.cashRecords) {
        sql += `INSERT INTO \`cash_records\` (\`id\`, \`amount\`, \`type\`, \`description\`, \`date\`, \`recorded_by\`) VALUES (${esc(c.id)}, ${c.amount}, ${esc(c.type)}, ${esc(c.description)}, ${esc(c.date)}, ${esc(c.recordedBy)});\n`;
      }
    }

    fs.writeFileSync(SQL_FILE, sql, "utf-8");
    console.log(`[SQL Sync] ${path.basename(SQL_FILE)} updated successfully.`);
  } catch (error) {
    console.error(`Failed to generate ${path.basename(SQL_FILE)}:`, error);
  }
}

// Helper to load and save data from file database
function loadDatabase(): Database {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to read database store, resetting...");
  }
  // Initialize with initial data
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

// MySQL Config and Connection Pool
const useMySQL = !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
let pool: mysql.Pool | null = null;

if (useMySQL) {
  const isCloudDB = process.env.DB_HOST?.includes("tidbcloud.com") ||
                    process.env.DB_HOST?.includes("aivencloud.com") ||
                    process.env.DB_SSL === "true";

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: isCloudDB ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log(`[Database] MySQL Connection Pool created for host: ${process.env.DB_HOST} (SSL: ${isCloudDB ? 'Enabled' : 'Disabled'})`);
} else {
  console.log("[Database] Using JSON file storage (fallback mode).");
}

async function initializeMySQL() {
  if (!pool) return;
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'users'");
    if ((rows as any[]).length === 0) {
      console.log("[Database] MySQL tables do not exist. Initializing schema...");
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`users\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`name\` VARCHAR(150) NOT NULL,
            \`email\` VARCHAR(100) NOT NULL UNIQUE,
            \`role\` ENUM('Admin', 'Pengurus', 'Anggota') NOT NULL DEFAULT 'Anggota',
            \`branch\` VARCHAR(150) DEFAULT NULL,
            \`prodi\` VARCHAR(100) DEFAULT NULL,
            \`avatar\` MEDIUMTEXT DEFAULT NULL,
            \`total_points\` INT DEFAULT 0,
            \`xp\` INT DEFAULT 0,
            \`level\` INT DEFAULT 1,
            \`level_name\` VARCHAR(50) DEFAULT 'Mubtadi',
            \`group_memorization\` VARCHAR(100) DEFAULT NULL,
            \`target_memorization\` INT DEFAULT 100,
            \`completed_memorization\` INT DEFAULT 0,
            \`phone\` VARCHAR(25) DEFAULT NULL,
            \`joined_date\` DATE NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`studies\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`title\` VARCHAR(180) NOT NULL,
            \`speaker\` VARCHAR(150) NOT NULL,
            \`date\` DATE NOT NULL,
            \`time\` VARCHAR(50) NOT NULL,
            \`location\` VARCHAR(255) NOT NULL,
            \`description\` TEXT DEFAULT NULL,
            \`image_url\` MEDIUMTEXT DEFAULT NULL,
            \`type\` ENUM('Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat') NOT NULL,
            \`lat\` DECIMAL(10, 8) DEFAULT NULL,
            \`lng\` DECIMAL(11, 8) DEFAULT NULL,
            \`quota\` INT DEFAULT 100,
            \`registered_count\` INT DEFAULT 0,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`attendance\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`study_id\` VARCHAR(50) NOT NULL,
            \`study_title\` VARCHAR(180) DEFAULT NULL,
            \`member_id\` VARCHAR(50) NOT NULL,
            \`member_name\` VARCHAR(150) DEFAULT NULL,
            \`date\` DATE NOT NULL,
            \`time\` VARCHAR(50) NOT NULL,
            \`status\` ENUM('Hadir', 'Izin', 'Alpa', 'Sakit') NOT NULL,
            \`method\` ENUM('QR', 'GPS', 'Manual') NOT NULL,
            \`lat\` DECIMAL(10, 8) DEFAULT NULL,
            \`lng\` DECIMAL(11, 8) DEFAULT NULL,
            \`distance\` DECIMAL(8, 2) DEFAULT NULL,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_attendance_study\` FOREIGN KEY (\`study_id\`) REFERENCES \`studies\`(\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`fk_attendance_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`memorization\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`member_id\` VARCHAR(50) NOT NULL,
            \`member_name\` VARCHAR(150) DEFAULT NULL,
            \`surah_name\` VARCHAR(100) NOT NULL,
            \`ayat_range\` VARCHAR(100) NOT NULL,
            \`ayat_count\` INT NOT NULL,
            \`juz\` INT NOT NULL,
            \`date\` DATE NOT NULL,
            \`reviewer\` VARCHAR(100) NOT NULL,
            \`status\` VARCHAR(50) DEFAULT 'Disetujui',
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_memorization_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`rewards\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`title\` VARCHAR(150) NOT NULL,
            \`cost\` INT NOT NULL,
            \`description\` TEXT DEFAULT NULL,
            \`stock\` INT NOT NULL DEFAULT 0,
            \`icon\` VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`point_history\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`member_id\` VARCHAR(50) NOT NULL,
            \`member_name\` VARCHAR(150) DEFAULT NULL,
            \`points\` INT NOT NULL,
            \`description\` VARCHAR(255) NOT NULL,
            \`date\` DATE NOT NULL,
            \`type\` ENUM('Tambah', 'Kurang') NOT NULL,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_point_history_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`cash_records\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`amount\` DECIMAL(15, 2) NOT NULL,
            \`type\` ENUM('Masuk', 'Keluar') NOT NULL,
            \`description\` VARCHAR(255) NOT NULL,
            \`date\` DATE NOT NULL,
            \`recorded_by\` VARCHAR(150) NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.commit();
        console.log("[Database] MySQL schema created successfully.");
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // ── Run column migrations for existing tables ──
    try {
      await pool.query("ALTER TABLE `users` MODIFY COLUMN `avatar` MEDIUMTEXT DEFAULT NULL");
      console.log("[Migration] users.avatar upgraded to MEDIUMTEXT.");
    } catch (_) { /* already correct type */ }

    try {
      await pool.query("ALTER TABLE `studies` ADD COLUMN `image_url` MEDIUMTEXT DEFAULT NULL");
      console.log("[Migration] studies.image_url column added.");
    } catch (_) { /* already exists */ }

  } catch (error) {
    console.error("[Database] Failed to initialize MySQL schema:", error);
  }
}

async function loadDatabaseFromMySQL(): Promise<Database> {
  const data: Database = {
    members: [],
    studies: [],
    attendance: [],
    memorization: [],
    rewards: [],
    pointHistory: [],
    cashRecords: []
  };

  if (!pool) return data;

  try {
    const [membersRows] = await pool.query("SELECT * FROM users");
    data.members = (membersRows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      branch: row.branch,
      prodi: row.prodi || "",
      avatar: row.avatar,
      totalPoints: row.total_points,
      xp: row.xp,
      level: row.level,
      levelName: row.level_name,
      groupMemorization: row.group_memorization,
      targetMemorization: row.target_memorization,
      completedMemorization: row.completed_memorization,
      phone: row.phone || "",
      joinedDate: row.joined_date instanceof Date ? row.joined_date.toISOString().split("T")[0] : String(row.joined_date)
    }));

    const [studiesRows] = await pool.query("SELECT * FROM studies");
    data.studies = (studiesRows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      speaker: row.speaker,
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
      time: row.time,
      location: row.location,
      description: row.description || "",
      imageUrl: row.image_url || undefined,
      type: row.type,
      lat: Number(row.lat),
      lng: Number(row.lng),
      quota: row.quota,
      registeredCount: row.registered_count || 0
    }));

    const [attendanceRows] = await pool.query("SELECT * FROM attendance");
    data.attendance = (attendanceRows as any[]).map(row => ({
      id: row.id,
      studyId: row.study_id,
      studyTitle: row.study_title || "",
      memberId: row.member_id,
      memberName: row.member_name || "",
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
      time: row.time,
      status: row.status,
      method: row.method,
      lat: row.lat ? Number(row.lat) : undefined,
      lng: row.lng ? Number(row.lng) : undefined,
      distance: row.distance ? Number(row.distance) : undefined
    }));

    const [memorizationRows] = await pool.query("SELECT * FROM memorization");
    data.memorization = (memorizationRows as any[]).map(row => ({
      id: row.id,
      memberId: row.member_id,
      memberName: row.member_name || "",
      surahName: row.surah_name,
      ayatRange: row.ayat_range,
      ayatCount: row.ayat_count,
      juz: row.juz,
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
      reviewer: row.reviewer,
      status: row.status
    }));

    const [rewardsRows] = await pool.query("SELECT * FROM rewards");
    data.rewards = (rewardsRows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      cost: row.cost,
      description: row.description || "",
      stock: row.stock,
      icon: row.icon || "BookOpen"
    }));

    const [pointHistoryRows] = await pool.query("SELECT * FROM point_history");
    data.pointHistory = (pointHistoryRows as any[]).map(row => ({
      id: row.id,
      memberId: row.member_id,
      memberName: row.member_name || "",
      points: row.points,
      description: row.description,
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
      type: row.type
    }));

    const [cashRows] = await pool.query("SELECT * FROM cash_records");
    data.cashRecords = (cashRows as any[]).map(row => ({
      id: row.id,
      amount: Number(row.amount),
      type: row.type,
      description: row.description,
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
      recordedBy: row.recorded_by
    }));

    console.log(`[Database] Loaded from MySQL: ${data.members.length} members, ${data.studies.length} studies, ${data.attendance.length} attendance records, ${data.memorization.length} memorization records, ${data.rewards.length} rewards, ${data.pointHistory.length} point history items, ${data.cashRecords.length} cash records.`);
  } catch (error) {
    console.error("[Database] Failed to load data from MySQL:", error);
  }

  return data;
}

async function seedMySQL(data: Database) {
  if (!pool) return;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("[Database] Seeding initial data into MySQL...");

    for (const m of data.members) {
      await connection.query(
        "INSERT INTO users (id, name, email, role, branch, prodi, avatar, total_points, xp, level, level_name, group_memorization, target_memorization, completed_memorization, phone, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [m.id, m.name, m.email, m.role, m.branch, m.prodi || null, m.avatar, m.totalPoints, m.xp, m.level, m.levelName, m.groupMemorization, m.targetMemorization, m.completedMemorization, m.phone, m.joinedDate]
      );
    }

    for (const r of data.rewards) {
      await connection.query(
        "INSERT INTO rewards (id, title, cost, description, stock, icon) VALUES (?, ?, ?, ?, ?, ?)",
        [r.id, r.title, r.cost, r.description, r.stock, r.icon]
      );
    }

    for (const s of data.studies) {
      await connection.query(
        "INSERT INTO studies (id, title, speaker, date, time, location, description, image_url, type, lat, lng, quota, registered_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [s.id, s.title, s.speaker, s.date, s.time, s.location, s.description, s.imageUrl || null, s.type, s.lat, s.lng, s.quota, s.registeredCount || 0]
      );
    }

    for (const a of data.attendance) {
      await connection.query(
        "INSERT INTO attendance (id, study_id, study_title, member_id, member_name, date, time, status, method, lat, lng, distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [a.id, a.studyId, a.studyTitle || null, a.memberId, a.memberName || null, a.date, a.time, a.status, a.method, a.lat || null, a.lng || null, a.distance || null]
      );
    }

    for (const h of data.memorization) {
      await connection.query(
        "INSERT INTO memorization (id, member_id, member_name, surah_name, ayat_range, ayat_count, juz, date, reviewer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [h.id, h.memberId, h.memberName || null, h.surahName, h.ayatRange, h.ayatCount, h.juz, h.date, h.reviewer, h.status]
      );
    }

    for (const p of data.pointHistory) {
      await connection.query(
        "INSERT INTO point_history (id, member_id, member_name, points, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.id, p.memberId, p.memberName || null, p.points, p.description, p.date, p.type]
      );
    }

    for (const c of data.cashRecords || []) {
      await connection.query(
        "INSERT INTO cash_records (id, amount, type, description, date, recorded_by) VALUES (?, ?, ?, ?, ?, ?)",
        [c.id, c.amount, c.type, c.description, c.date, c.recordedBy]
      );
    }

    await connection.commit();
    console.log("[Database] Seeding completed successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("[Database] Failed to seed initial data to MySQL:", error);
  } finally {
    connection.release();
  }
}

async function syncDatabaseToMySQL(data: Database) {
  if (!pool) return;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM point_history");
    await connection.query("DELETE FROM memorization");
    await connection.query("DELETE FROM attendance");
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM studies");
    await connection.query("DELETE FROM rewards");
    await connection.query("DELETE FROM cash_records");

    for (const m of data.members) {
      await connection.query(
        "INSERT INTO users (id, name, email, role, branch, prodi, avatar, total_points, xp, level, level_name, group_memorization, target_memorization, completed_memorization, phone, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [m.id, m.name, m.email, m.role, m.branch, m.prodi || null, m.avatar, m.totalPoints, m.xp, m.level, m.levelName, m.groupMemorization, m.targetMemorization, m.completedMemorization, m.phone, m.joinedDate]
      );
    }

    for (const r of data.rewards) {
      await connection.query(
        "INSERT INTO rewards (id, title, cost, description, stock, icon) VALUES (?, ?, ?, ?, ?, ?)",
        [r.id, r.title, r.cost, r.description, r.stock, r.icon]
      );
    }

    for (const s of data.studies) {
      await connection.query(
        "INSERT INTO studies (id, title, speaker, date, time, location, description, image_url, type, lat, lng, quota, registered_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [s.id, s.title, s.speaker, s.date, s.time, s.location, s.description, s.imageUrl || null, s.type, s.lat, s.lng, s.quota, s.registeredCount || 0]
      );
    }

    for (const a of data.attendance) {
      await connection.query(
        "INSERT INTO attendance (id, study_id, study_title, member_id, member_name, date, time, status, method, lat, lng, distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [a.id, a.studyId, a.studyTitle || null, a.memberId, a.memberName || null, a.date, a.time, a.status, a.method, a.lat || null, a.lng || null, a.distance || null]
      );
    }

    for (const h of data.memorization) {
      await connection.query(
        "INSERT INTO memorization (id, member_id, member_name, surah_name, ayat_range, ayat_count, juz, date, reviewer, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [h.id, h.memberId, h.memberName || null, h.surahName, h.ayatRange, h.ayatCount, h.juz, h.date, h.reviewer, h.status]
      );
    }

    for (const p of data.pointHistory) {
      await connection.query(
        "INSERT INTO point_history (id, member_id, member_name, points, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.id, p.memberId, p.memberName || null, p.points, p.description, p.date, p.type]
      );
    }

    for (const c of data.cashRecords || []) {
      await connection.query(
        "INSERT INTO cash_records (id, amount, type, description, date, recorded_by) VALUES (?, ?, ?, ?, ?, ?)",
        [c.id, c.amount, c.type, c.description, c.date, c.recordedBy]
      );
    }

    await connection.commit();
    console.log("[Database] Asynchronously synced memory DB state to MySQL database.");
  } catch (error) {
    await connection.rollback();
    console.error("[Database] Failed to sync memory DB state to MySQL database:", error);
  } finally {
    connection.release();
  }
}

function saveDatabase(data: Database) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    saveDatabaseSQL(data);
    
    if (useMySQL) {
      syncDatabaseToMySQL(data).catch(err => {
        console.error("[Database] Background sync to MySQL failed:", err);
      });
    }
  } catch (error) {
    console.error("Failed to save database store:", error);
  }
}

// Ensure database file is generated locally first
let db = loadDatabase();
saveDatabase(db);

// Safely configure Gemini Client using the @google/genai SDK
let geminiClientStore: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!geminiClientStore) {
    geminiClientStore = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClientStore;
}

// API: Health Check (for Railway / deployment platforms)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: useMySQL ? "mysql" : "json-file",
    version: "1.0.0"
  });
});

// API: Auth Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Relational search lookup in simulated users table
  const member = db.members.find(m => m.email.toLowerCase() === email.trim().toLowerCase());
  if (member) {
    res.json({ success: true, member });
  } else {
    // If not found, create a fallback user/role simulation
    res.status(401).json({ success: false, message: "Email atau Password salah!" });
  }
});

// API: Auth Register
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, role, prodi } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: "Nama, email, dan peran wajib diisi!" });
  }

  db = loadDatabase();
  const exists = db.members.some(m => m.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
  }

  const newMember: Member = {
    id: "M" + String(db.members.length + 1).padStart(3, "0"),
    name,
    email: email.trim().toLowerCase(),
    role: role as any,
    branch: role === "Pengurus" ? "Kader Inti UNINUS Bandung" : "Anggota Aktif UNINUS",
    prodi: prodi || "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    totalPoints: 0,
    xp: 0,
    level: 1,
    levelName: "Mubtadi",
    groupMemorization: "Halaqah Utsman",
    targetMemorization: 100,
    completedMemorization: 0,
    phone: "",
    joinedDate: new Date().toISOString().split("T")[0]
  };

  db.members.push(newMember);
  saveDatabase(db);

  res.status(201).json({ success: true, member: newMember });
});

// API: Members CRUD
app.get("/api/members", (req, res) => {
  db = loadDatabase();
  res.json(db.members);
});

app.post("/api/members", (req, res) => {
  const newMember = req.body;
  newMember.id = "M" + String(db.members.length + 1).padStart(3, "0");
  newMember.joinedDate = new Date().toISOString().split("T")[0];
  newMember.totalPoints = newMember.totalPoints || 0;
  newMember.xp = newMember.xp || 0;
  newMember.level = newMember.level || 1;
  newMember.levelName = newMember.levelName || "Mubtadi";
  db.members.push(newMember);
  saveDatabase(db);
  res.status(201).json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const index = db.members.findIndex(m => m.id === id);
  if (index !== -1) {
    db.members[index] = { ...db.members[index], ...updatedData };
    saveDatabase(db);
    res.json(db.members[index]);
  } else {
    res.status(404).json({ error: "Mamber not found" });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  const index = db.members.findIndex(m => m.id === id);
  if (index !== -1) {
    // Delete related records in JSON fallback
    db.members.splice(index, 1);
    db.attendance = db.attendance.filter(a => a.memberId !== id);
    db.memorization = db.memorization.filter(h => h.memberId !== id);
    db.pointHistory = db.pointHistory.filter(p => p.memberId !== id);
    
    // Delete from MySQL
    if (pool) {
      try {
        await pool.query("DELETE FROM users WHERE id = ?", [id]);
        console.log(`[Database] Deleted member ${id} from MySQL`);
      } catch(e) {
        console.error("Failed to delete from MySQL:", e);
      }
    }

    saveDatabase(db);
    res.json({ success: true, message: "Anggota berhasil dihapus" });
  } else {
    res.status(404).json({ error: "Anggota tidak ditemukan" });
  }
});

// API: Uang Kas CRUD
app.get("/api/cash", (req, res) => {
  db = loadDatabase();
  res.json(db.cashRecords || []);
});

app.post("/api/cash", (req, res) => {
  const { amount, type, description, recordedBy } = req.body;
  if (!amount || !type || !description || !recordedBy) {
    return res.status(400).json({ error: "Semua field wajib diisi!" });
  }
  
  db = loadDatabase();
  if (!db.cashRecords) {
    db.cashRecords = [];
  }
  
  const newRecord: CashRecord = {
    id: "C" + String(db.cashRecords.length + 1).padStart(3, "0") + "_" + Date.now().toString().slice(-4),
    amount: Number(amount),
    type,
    description,
    date: new Date().toISOString().split("T")[0],
    recordedBy
  };
  
  db.cashRecords.push(newRecord);
  saveDatabase(db);
  res.status(201).json(newRecord);
});

app.delete("/api/cash/:id", (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  if (!db.cashRecords) {
    db.cashRecords = [];
  }
  const index = db.cashRecords.findIndex(c => c.id === id);
  if (index !== -1) {
    db.cashRecords.splice(index, 1);
    saveDatabase(db);
    res.json({ success: true, message: "Transaksi kas berhasil dihapus" });
  } else {
    res.status(404).json({ error: "Transaksi kas tidak ditemukan" });
  }
});

// API: Admin Reset — wipe ALL transactional data and reset member stats to zero
app.post("/api/admin/reset-all", async (req, res) => {
  try {
    db = loadDatabase();

    // Reset all transactional data in memory (JSON fallback)
    db.attendance = [];
    db.memorization = [];
    db.pointHistory = [];
    db.cashRecords = [];
    db.studies = [];
    db.rewards = [];

    // Reset all member stats to zero
    db.members = db.members.map(m => ({
      ...m,
      totalPoints: 0,
      xp: 0,
      level: 1,
      levelName: "Mubtadi",
      completedMemorization: 0
    }));

    // Persist to JSON file
    saveDatabase(db);

    const mysqlResults: string[] = [];

    // Also wipe MySQL if connected
    if (useMySQL && pool) {
      const conn = await pool.getConnection();
      try {
        // Ensure cash_records table exists before trying to delete from it
        await conn.query(`
          CREATE TABLE IF NOT EXISTS \`cash_records\` (
            \`id\` VARCHAR(50) NOT NULL,
            \`amount\` DECIMAL(15, 2) NOT NULL,
            \`type\` ENUM('Masuk', 'Keluar') NOT NULL,
            \`description\` VARCHAR(255) NOT NULL,
            \`date\` DATE NOT NULL,
            \`recorded_by\` VARCHAR(150) NOT NULL,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Clear each table individually with per-table error handling
        const tablesToClear = [
          "DELETE FROM point_history",
          "DELETE FROM memorization",
          "DELETE FROM attendance",
          "DELETE FROM cash_records",
          "DELETE FROM studies",
          "DELETE FROM rewards",
          "UPDATE users SET total_points=0, xp=0, level=1, level_name='Mubtadi', completed_memorization=0"
        ];

        for (const query of tablesToClear) {
          try {
            await conn.query(query);
            mysqlResults.push(`✅ ${query.split(" ").slice(0, 3).join(" ")}`);
          } catch (tableErr: any) {
            mysqlResults.push(`⚠️ Skipped: ${tableErr.message}`);
          }
        }

        console.log("[Database] Admin reset: all transactional data cleared from MySQL.");
      } catch (err) {
        console.error("[Admin Reset MySQL] Error:", err);
      } finally {
        conn.release();
      }
    }

    res.json({ 
      success: true, 
      message: "Seluruh data riwayat berhasil dibersihkan. Dashboard dimulai dari awal.",
      cleared: ["attendance", "memorization", "point_history", "cash_records", "studies", "rewards"],
      membersReset: db.members.length,
      mysqlDetails: mysqlResults
    });
  } catch (error) {
    console.error("[Admin Reset] Failed:", error);
    res.status(500).json({ success: false, error: "Gagal mereset data: " + String(error) });
  }
});

// API: Studies CRUDS
app.get("/api/studies", (req, res) => {
  db = loadDatabase();
  res.json(db.studies);
});

app.post("/api/studies", (req, res) => {
  const newStudy = req.body;
  newStudy.id = "S" + String(db.studies.length + 1).padStart(3, "0");
  newStudy.registeredCount = 0;
  db.studies.push(newStudy);
  saveDatabase(db);
  res.status(201).json(newStudy);
});

app.delete("/api/studies/:id", async (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  const index = db.studies.findIndex(s => s.id === id);
  if (index !== -1) {
    db.studies.splice(index, 1);
    db.attendance = db.attendance.filter(a => a.studyId !== id);
    
    if (pool) {
      try {
        await pool.query("DELETE FROM studies WHERE id = ?", [id]);
        console.log(`[Database] Deleted study ${id} from MySQL`);
      } catch (e) {
        console.error("Failed to delete study from MySQL:", e);
      }
    }
    
    saveDatabase(db);
    res.json({ success: true, message: "Kajian/Kegiatan berhasil dihapus" });
  } else {
    res.status(404).json({ error: "Kajian/Kegiatan tidak ditemukan" });
  }
});

// API: Attendance / Presensi validation GPS + QR
app.post("/api/attendance", (req, res) => {
  const { studyId, memberId, status, method, lat, lng } = req.body;
  db = loadDatabase();

  const study = db.studies.find(s => s.id === studyId);
  const member = db.members.find(m => m.id === memberId);

  if (!study || !member) {
    return res.status(400).json({ success: false, message: "Kajian atau Anggota tidak ditemukan" });
  }

  // Calculate distance if GPS-based
  let distanceMeter: number | undefined;
  if (method === "GPS" && lat && lng) {
    // Haversine formula
    const R = 6371e3; // metres
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (study.lat * Math.PI) / 180;
    const deltaPhi = ((study.lat - lat) * Math.PI) / 180;
    const deltaLambda = ((study.lng - lng) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    distanceMeter = Math.round(R * c);

    // If radius is too large (> 100 meters, allow 150 margin for simulator)
    if (distanceMeter > 150) {
      return res.status(400).json({
        success: false,
        message: `Presensi gagal. Anda berada terlalu jauh (${distanceMeter} meter) dari lokasi kajian. Radius maksimal adalah 150 meter.`,
        distance: distanceMeter
      });
    }
  }

  // Record attendance
  const newRecord: AttendanceRecord = {
    id: "A" + String(db.attendance.length + 101),
    studyId,
    studyTitle: study.title,
    memberId,
    memberName: member.name,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB",
    status: status || "Hadir",
    method,
    lat,
    lng,
    distance: distanceMeter
  };

  db.attendance.push(newRecord);

  // Reward points if "Hadir"
  if (newRecord.status === "Hadir") {
    const pointsAwarded = method === "GPS" ? 250 : 200; // Bonus for GPS validation
    member.totalPoints += pointsAwarded;
    member.xp += pointsAwarded;
    // Calculate Level (every 2500 XP raises level name)
    member.level = Math.min(10, Math.floor(member.xp / 2500) + 1);
    if (member.level >= 5) member.levelName = "Mujahid";
    else if (member.level >= 3) member.levelName = "Muqarrab";
    else member.levelName = "Mubtadi";

    db.pointHistory.push({
      id: "P" + String(db.pointHistory.length + 1).padStart(3, "0"),
      memberId,
      memberName: member.name,
      points: pointsAwarded,
      description: `Hadir Kajian: ${study.title} via ${method}`,
      date: newRecord.date,
      type: "Tambah"
    });
  }

  saveDatabase(db);
  res.json({ success: true, record: newRecord, member });
});

app.get("/api/attendance", (req, res) => {
  db = loadDatabase();
  res.json(db.attendance);
});

app.delete("/api/attendance/:id", (req, res) => {
  const { id } = req.params;
  db = loadDatabase();
  const index = db.attendance.findIndex(a => a.id === id);
  if (index !== -1) {
    db.attendance.splice(index, 1);
    saveDatabase(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Data presensi tidak ditemukan" });
  }
});

// API: Memorization / Setoran Hafalan
app.get("/api/memorization", (req, res) => {
  db = loadDatabase();
  res.json(db.memorization);
});

app.post("/api/memorization", (req, res) => {
  const { memberId, surahName, ayatRange, ayatCount, juz, reviewer } = req.body;
  db = loadDatabase();

  const member = db.members.find(m => m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: "Anggota tidak ditemukan" });
  }

  const newRecord: MemorizationRecord = {
    id: "H" + String(db.memorization.length + 1).padStart(3, "0"),
    memberId,
    memberName: member.name,
    surahName,
    ayatRange,
    ayatCount: Number(ayatCount),
    juz: Number(juz),
    date: new Date().toISOString().split("T")[0],
    reviewer,
    status: "Disetujui"
  };

  db.memorization.push(newRecord);

  // Update setoran stats
  member.completedMemorization += Number(ayatCount);
  
  // Award points: 20 points per verse
  const pointsAwarded = Number(ayatCount) * 20;
  member.totalPoints += pointsAwarded;
  member.xp += pointsAwarded;
  member.level = Math.min(10, Math.floor(member.xp / 2500) + 1);

  db.pointHistory.push({
    id: "P" + String(db.pointHistory.length + 1).padStart(3, "0"),
    memberId,
    memberName: member.name,
    points: pointsAwarded,
    description: `Setoran Hafalan QS ${surahName} (${ayatRange})`,
    date: newRecord.date,
    type: "Tambah"
  });

  saveDatabase(db);
  res.json({ success: true, record: newRecord, member });
});

// API: Poin Berkah Rewards Catalog & History
app.get("/api/rewards", (req, res) => {
  db = loadDatabase();
  res.json(db.rewards);
});

app.post("/api/rewards/redeem", (req, res) => {
  const { memberId, rewardId } = req.body;
  db = loadDatabase();

  const member = db.members.find(m => m.id === memberId);
  const reward = db.rewards.find(r => r.id === rewardId);

  if (!member || !reward) {
    return res.status(404).json({ error: "Anggota atau Item hadiah tidak ditemukan" });
  }

  if (member.totalPoints < reward.cost) {
    return res.status(400).json({ error: "Poin Berkah tidak mencukupi untuk menukar hadiah ini!" });
  }

  if (reward.stock <= 0) {
    return res.status(400).json({ error: "Stok hadiah habis!" });
  }

  // Perform transaction
  member.totalPoints -= reward.cost;
  reward.stock -= 1;

  db.pointHistory.push({
    id: "P" + String(db.pointHistory.length + 1).padStart(3, "0"),
    memberId,
    memberName: member.name,
    points: reward.cost,
    description: `Tukar Hadiah: ${reward.title}`,
    date: new Date().toISOString().split("T")[0],
    type: "Kurang"
  });

  saveDatabase(db);
  res.json({ success: true, member, reward });
});

app.get("/api/points/history", (req, res) => {
  db = loadDatabase();
  res.json(db.pointHistory);
});


// API: AI Islami (Using Server-Side Gemini API with safety checks)
app.post("/api/ai-islami", async (req: Request, res: Response) => {
  const { messages, option } = req.body; // option could be 'Tafsir', 'Fiqh', 'Tajwid', 'Umum'
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Format request tidak valid" });
  }

  const userPrompt = messages[messages.length - 1].content;
  const systemInstruction = 
    `Anda adalah "Tanya Qur'an & AI Islami", asisten asatidz digital yang bijaksana, santun, dan berpengetahuan luas untuk UKM IKRAAMUL QUR'AN. 
    Konteks saat ini: Membantu Anggota, Pengurus, dan Admin di UKM IKRAAMUL QUR'AN dalam belajar tafsir, hukum fiqh, makhraj/tajwid, dan motivasi ber-introspeksi diri menghafal Al-Qur'an.
    Fokus opsi saat ini: ${option || "Tafsir & Motivasi Islami"}.
    Jawablah dengan bahasa Indonesia yang sangat sopan, sejuk, memotivasi, dan sertakan rujukan ayat atau hadis rasm Utsmani secara literal yang relevan jika memungkinkan. 
    Gunakan gaya persuasif layaknya pembimbing rohani yang hangat.`;

  try {
    const api = getGeminiClient();
    if (api) {
      // Create chat thread format with strict Gemini-3.5-flash setup
      const response = await api.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "Mohon maaf hangat, saya sedang menelaah kitab suci dan belum dapat memberikan jawaban instan saat ini.";
      res.json({ content: replyText });
    } else {
      // High fidelity Offline Mock response based on themes if Gemini is not set up
      setTimeout(() => {
        let responseMock = "";
        const promptLower = userPrompt.toLowerCase();

        if (promptLower.includes("hafalan") || promptLower.includes("hafal")) {
          responseMock = "Assalamu'alaikum wr. wb. Saudaraku yang dirahmati Allah, menjaga motivasi hafalan Al-Qur'an (murojaah) adalah perjuangan agung. Sebagaimana Rasulullah SAW bersabda, 'Jagalah Al-Qur'an ini, demi Dzat yang jiwaku berada di tangan-Nya, sungguh ia lebih cepat lepas daripada unta yang terikat.' Tetaplah istiqomah setoran di UKM Ikraamul Qur'an meskipun sedikit demi sedikit (tadrij). Poin berkah Anda akan menemani perjalanan mulia ini! Ada yang bisa saya bantu lagi bagi hafalan Anda?";
        } else if (promptLower.includes("tajwid") || promptLower.includes("ikhfa") || promptLower.includes("ikhfa")) {
          responseMock = "Dalam ilmu Tajwid, khususnya Makharijul Huruf, ketepatan bunyi sangat mulia. Allah SWT berfirman: 'Dan bacalah Al-Qur'an itu dengan perlahan/tartil' (QS. Al-Muzzammil: 4). Untuk hukum Nun Sukun dan Tanwin seperti Ikhfa Haqiqi, pastikan suara disamarkan (dengung) sepanjang 2 harakat dengan mencondongkan makhraj ke huruf berikutnya. Gunakan AI Tajwid penganalisis di aplikasi kami untuk latihan mandiri!";
        } else if (promptLower.includes("fiqh") || promptLower.includes("hukum") || promptLower.includes("zakat")) {
          responseMock = "Berkaitan dengan hukum Fiqh Ibadah di era modern ini, para ulama sepakat bahwa kebaikan itu dinilai dari keikhlasan dan kesesuaian dengan sunnah Nabawiyah. Sebagaimana kaidah ushul fiqh: 'Al-Aslu fil 'Ibadat al-Hazru' (Hukum asal ibadah adalah dilarang kecuali ada dalilnya). Silakan konsultasikan lebih lanjut kepada Ustadz Ahmad Hidayat, Lc. dalam Kajian Akhlak & Fiqh kita setiap Sabtu jam 10.00 di Aula FEB!";
        } else {
          responseMock = `Assalamu'alaikum wr. wb. Riset dan Al-Qur'an mengajarkan kita untuk selalu bertafakur. Terkait pertanyaan Anda mengenai "${userPrompt}", mari kita renungkan firman-Nya: "Maka bertanyalah kepada orang yang mempunyai pengetahuan jika kamu tidak mengetahui" (QS. An-Nahl: 43). Kita selalu terdorong untuk menuntut ilmu bersama-sama di forum UKM IKRAAMUL QUR'AN. Semoga Allah meluaskan ilmu kita selalu.`;
        }
        res.json({ content: responseMock });
      }, 1000);
    }
  } catch (error) {
    console.error("Gemini AI error:", error);
    res.status(500).json({ error: "Asisten AI Islami mengalami sedikit hambatan jaringan. Silakan coba kembali sesaat lagi." });
  }
});

// API: MySQL DDL Exporter (Provides structural schema for student thesis / implementation)
app.get("/api/db/export-sql", (req, res) => {
  const sqlContent = `-- =====================================================================
-- DATABASE SCHEMA: UKM IKRAAMUL QUR'AN DIGITAL DASHBOARD
-- Target RDBMS: MySQL v8.0+ / MariaDB
-- Generated for Skripsi / Professional Implementation
-- Time Generated: ${new Date().toISOString()}
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`ikraamul_quran_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`ikraamul_quran_db\`;

-- ---------------------------------------------------------------------
-- Table 1: USERS (Anggota, Pengurus, Admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL COMMENT 'UID Anggota',
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`role\` ENUM('Admin', 'Pengurus', 'Anggota') NOT NULL DEFAULT 'Anggota',
  \`branch\` VARCHAR(150) DEFAULT 'Pengurus Wilayah IKRAAMUL QUR\\'AN',
  \`prodi\` VARCHAR(100) DEFAULT NULL COMMENT 'Program Studi / Jurusan',
  \`avatar\` VARCHAR(255) DEFAULT NULL,
  \`total_points\` INT DEFAULT 0 COMMENT 'Poin Berkah Aktif',
  \`xp\` INT DEFAULT 0 COMMENT 'Total Pengalaman Akumulatif',
  \`level\` INT DEFAULT 1,
  \`level_name\` VARCHAR(50) DEFAULT 'Mujahid',
  \`group_memorization\` VARCHAR(100) DEFAULT 'Halaqah Abu Bakar',
  \`target_memorization\` INT DEFAULT 100,
  \`completed_memorization\` INT DEFAULT 0,
  \`phone\` VARCHAR(25) DEFAULT NULL,
  \`joined_date\` DATE NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: STUDIES (Kajian, Tahsin, Rapat, Kegiatan)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`studies\` (
  \`id\` VARCHAR(50) NOT NULL AND COMMENT 'UID Kajian',
  \`title\` VARCHAR(180) NOT NULL,
  \`speaker\` VARCHAR(150) NOT NULL,
  \`date\` DATE NOT NULL,
  \`time\` VARCHAR(50) NOT NULL COMMENT 'Format WIB',
  \`location\` VARCHAR(255) NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`type\` ENUM('Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat') NOT NULL,
  \`lat\` DECIMAL(10, 8) DEFAULT NULL COMMENT 'Guna Geofencing GPS',
  \`lng\` DECIMAL(11, 8) DEFAULT NULL,
  \`quota\` INT DEFAULT 100,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 3: ATTENDANCE (Presensi dengan QR & Geofencing GPS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`attendance\` (
  \`id\` INT AUTO_INCREMENT NOT NULL,
  \`study_id\` VARCHAR(50) NOT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`date\` DATE NOT NULL,
  \`time\` TIME NOT NULL,
  \`status\` ENUM('Hadir', 'Izin', 'Alpa', 'Sakit') NOT NULL,
  \`method\` ENUM('QR', 'GPS', 'Manual') NOT NULL,
  \`lat\` DECIMAL(10, 8) DEFAULT NULL COMMENT 'Presensi Koordinat User',
  \`lng\` DECIMAL(11, 8) DEFAULT NULL,
  \`distance_meter\` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Jarak kalkulasi geo_distance',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_attendance_study\` FOREIGN KEY (\`study_id\`) REFERENCES \`studies\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_attendance_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 4: MEMORIZATION (Setoran Hafalan Al-Qur'an)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`memorization\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`surah_name\` VARCHAR(100) NOT NULL,
  \`ayat_range\` VARCHAR(100) NOT NULL,
  \`ayat_count\` INT NOT NULL,
  \`juz\` INT NOT NULL,
  \`date\` DATE NOT NULL,
  \`reviewer\` VARCHAR(100) NOT NULL,
  \`status\` VARCHAR(50) DEFAULT 'Disetujui',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_memorization_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 5: POINT_REWARDS_CATALOG & EXCHANGE HISTORY
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`rewards\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(150) NOT NULL,
  \`cost\` INT NOT NULL COMMENT 'Biaya penukaran poin berkah',
  \`description\` TEXT DEFAULT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 6: POINT_HISTORY (Log Perolehan dan Pengurangan Poin Berkah)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`point_history\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`member_id\` VARCHAR(50) NOT NULL,
  \`points\` INT NOT NULL,
  \`description\` VARCHAR(255) NOT NULL,
  \`date\` DATE NOT NULL,
  \`type\` ENUM('Tambah', 'Kurang') NOT NULL,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_point_history_member\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- SEED DATA SETUP (PRESETS FOR QUICK LAUNCH)
-- =====================================================================

INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`role\`, \`branch\`, \`avatar\`, \`total_points\`, \`xp\`, \`level\`, \`level_name\`, \`group_memorization\`, \`target_memorization\`, \`completed_memorization\`, \`phone\`, \`joined_date\`)
VALUES
('M001', 'Rizqi', 'rizqielektronika@gmail.com', 'Admin', 'Pengurus Wilayah IKRAAMUL QUR\\'AN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 12500, 12500, 5, 'Mujahid', 'Halaqah Abu Bakar', 100, 87, '+6281234567890', '2025-01-10'),
('M002', 'Ahmad Hidayat', 'ahmad@gmail.com', 'Pengurus', 'Kader Inti UNINUS Bandung', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 8400, 8400, 4, 'Muqarrab', 'Halaqah Umar', 150, 121, '+628998877665', '2025-02-15'),
('M003', 'Zuhair', 'zuhair@gmail.com', 'Anggota', 'Anggota Aktif UNINUS', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 3400, 3400, 2, 'Mubtadi', 'Halaqah Utsman', 50, 32, '+6285211223344', '2025-04-20');

INSERT INTO \`studies\` (\`id\`, \`title\`, \`speaker\`, \`date\`, \`time\`, \`location\`, \`description\`, \`type\`, \`lat\`, \`lng\`, \`quota\`)
VALUES
('S001', 'Tahsin Al-Qur\\'an', 'Masjid Al-Ikhlas UNINUS', '2026-06-20', '08.00 - 10.00 WIB', 'Masjid Al-Ikhlas UNINUS', 'Belajar memperbaiki tajwid dan kelancaran membaca Al-Qur\\'an', 'Tahsin', -6.94042850, 107.65342460, 50),
('S002', 'Kajian Akhlak', 'Ustadz Ahmad Hidayat, Lc.', '2026-06-20', '10.00 - 12.00 WIB', 'Aula Rektorat UNINUS', 'Kajian rutin mingguan membangun karakter Qur\\'ani di era millenial', 'Kajian', -6.94121200, 107.65311200, 100);

INSERT INTO \`attendance\` (\`study_id\`, \`member_id\`, \`date\`, \`time\`, \`status\`, \`method\`, \`lat\`, \`lng\`, \`distance_meter\`)
VALUES
('S001', 'M001', '2026-06-20', '08:15:22', 'Hadir', 'GPS', -6.94042850, 107.65342460, 12.50);

INSERT INTO \`memorization\` (\`id\`, \`member_id\`, \`surah_name\`, \`ayat_range\`, \`ayat_count\`, \`juz\`, \`date\`, \`reviewer\`, \`status\`)
VALUES
('H001', 'M001', 'An-Naba', '1 - 20', 20, 30, '2026-06-19', 'Ustadz Ahmad', 'Disetujui');

INSERT INTO \`rewards\` (\`id\`, \`title\`, \`cost\`, \`description\`, \`stock\`)
VALUES
('R001', 'Mushaf Al-Qur\\'an Madinah', 5000, 'Al-Qur\\'an cetakan Madinah rasm Utsmani berkualitas tinggi.', 12),
('R002', 'Jaket Eksklusif UKM IKQ', 10000, 'Jaket parasit premium tahan angin berlapis dakron dengan bordir emas.', 5);
`;

  res.setHeader("Content-Disposition", "attachment; filename=ikraamul_quran_mysql.sql");
  res.setHeader("Content-Type", "text/plain");
  res.send(sqlContent);
});

// Serve frontend assets
async function startServer() {
  if (useMySQL) {
    try {
      await initializeMySQL();

      // One-time cleanup for point_history requested by user
      if (pool) {
        try {
          await pool.query("DELETE FROM point_history WHERE member_id != 'M001' AND member_name NOT LIKE '%Rizqi%'");
          console.log("[Database] Cleaned up point_history for other members.");
        } catch (cleanupErr) {
          console.error("[Database] Failed to clean up point history:", cleanupErr);
        }
      }

      const mysqlDb = await loadDatabaseFromMySQL();
      if (mysqlDb.members && mysqlDb.members.length > 0) {
        db = mysqlDb;
        console.log("[Database] Successfully loaded database state from MySQL.");
      } else {
        console.log("[Database] MySQL database is empty. Seeding INITIAL_DATABASE...");
        await seedMySQL(INITIAL_DATABASE);
        db = INITIAL_DATABASE;
      }
    } catch (err) {
      console.error("[Database] Failed to initialize/load MySQL on startup, falling back to local file:", err);
    }
  }

  // Dynamic fallback for APK download (handles different casing/spaces/file names)
  app.get("/downloads/ikraamul-quran.apk", (req, res, next) => {
    const possibleDirs = [
      path.join(process.cwd(), "public", "downloads"),
      path.join(process.cwd(), "dist", "downloads"),
      path.join(process.cwd(), "downloads")
    ];
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          // Look for any APK file in the downloads folder
          const apkFile = files.find(f => f.toLowerCase().endsWith(".apk"));
          if (apkFile) {
            const filePath = path.join(dir, apkFile);
            console.log(`[Download] Serving APK file: ${filePath}`);
            return res.download(filePath, apkFile);
          }
        } catch (err) {
          console.error("[Download] Error reading downloads directory:", err);
        }
      }
    }
    next();
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Dynamically locate the production dist directory
    let distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(path.join(__dirname, "index.html"))) {
      distPath = __dirname;
    } else if (fs.existsSync(path.join(__dirname, "dist", "index.html"))) {
      distPath = path.join(__dirname, "dist");
    }

    console.log(`[Static Files] Serving production assets from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Handle port binding robustly for environments using port numbers or Unix sockets (like Phusion Passenger)
  if (!process.env.VERCEL) {
    if (typeof PORT === "number" || !isNaN(Number(PORT))) {
      app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`[IKRAAMUL QUR'AN Fullstack Server] Running on http://localhost:${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`[IKRAAMUL QUR'AN Fullstack Server] Running on socket ${PORT}`);
      });
    }
  } else {
    console.log("[IKRAAMUL QUR'AN Fullstack Server] Running in Vercel Serverless environment (skipping app.listen)");
  }
}

startServer();

// Export app for Vercel Serverless Function compatibility
export default app;
