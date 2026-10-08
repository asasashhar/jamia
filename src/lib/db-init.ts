import fs from "fs";
import path from "path";
// @ts-expect-error node:sqlite is built-in in Node 22 runtime
import { DatabaseSync } from "node:sqlite";

export function ensureDatabaseInitialized() {
  try {
    const cwd = process.cwd();
    const dbPaths = [
      path.join(cwd, "dev.db"),
      path.join(cwd, "prisma", "dev.db"),
    ];

    // Ensure prisma directory exists
    const prismaDir = path.join(cwd, "prisma");
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }

    // Check if either DB has the User table
    for (const p of dbPaths) {
      if (fs.existsSync(p)) {
        try {
          const db = new DatabaseSync(p);
          const userTable = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")
            .get();
          if (userTable) {
            // Already initialized, sanitize dates and sync files
            sanitizeDates(db);
            syncDbFiles(dbPaths);
            return;
          }
        } catch {
          // Continue to initialization
        }
      }
    }

    // Initialize the primary db file
    const targetDb = dbPaths[0];
    const db = new DatabaseSync(targetDb);
    const now = new Date().toISOString();

    // Create all tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "role" TEXT NOT NULL,
        "phone" TEXT,
        "password" TEXT NOT NULL,
        "avatar_url" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        "updatedAt" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE IF NOT EXISTS "AcademicYear" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "year_name" TEXT NOT NULL,
        "start_date" DATETIME NOT NULL,
        "end_date" DATETIME NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT false,
        "is_admission_open" BOOLEAN NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "Class" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "display_name" TEXT NOT NULL,
        "level_order" INTEGER NOT NULL,
        "section" TEXT NOT NULL,
        "max_students" INTEGER NOT NULL,
        "class_teacher_id" TEXT,
        FOREIGN KEY ("class_teacher_id") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "class_id" TEXT NOT NULL,
        "teacher_id" TEXT,
        "max_marks" INTEGER NOT NULL,
        "pass_marks" INTEGER NOT NULL,
        FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("teacher_id") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "enrollment_id" TEXT NOT NULL UNIQUE,
        "user_id" TEXT NOT NULL UNIQUE,
        "first_name" TEXT NOT NULL,
        "last_name" TEXT NOT NULL,
        "class_id" TEXT NOT NULL,
        "dob" DATETIME NOT NULL,
        "guardian_name" TEXT NOT NULL,
        "guardian_phone" TEXT NOT NULL,
        "guardian_email" TEXT,
        "status" TEXT NOT NULL,
        "can_edit_profile" BOOLEAN NOT NULL DEFAULT false,
        "address" TEXT,
        FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Teacher" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "staff_id" TEXT NOT NULL UNIQUE,
        "user_id" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "designation" TEXT NOT NULL,
        "qualifications" TEXT NOT NULL,
        "salary" REAL NOT NULL,
        "status" TEXT NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" DATETIME NOT NULL,
        "student_id" TEXT NOT NULL,
        "class_id" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Exam" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "term" TEXT NOT NULL,
        "academic_year_id" TEXT NOT NULL,
        FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Result" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "exam_id" TEXT NOT NULL,
        "student_id" TEXT NOT NULL,
        "subject_id" TEXT NOT NULL,
        "marks_obtained" REAL NOT NULL,
        "remarks" TEXT,
        FOREIGN KEY ("exam_id") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("subject_id") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "FeeStructure" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "class_id" TEXT NOT NULL,
        "fee_type" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "FeeRecord" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "student_id" TEXT NOT NULL,
        "fee_type" TEXT NOT NULL,
        "total_amount" REAL NOT NULL,
        "paid_amount" REAL NOT NULL,
        "due_date" DATETIME NOT NULL,
        "status" TEXT NOT NULL,
        "receipt_number" TEXT,
        "payment_date" DATETIME,
        FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "student_id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "doc_type" TEXT NOT NULL,
        "file_url" TEXT NOT NULL,
        "uploaded_at" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Notice" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "target_role" TEXT NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE IF NOT EXISTS "Admission" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "applicant_name" TEXT NOT NULL,
        "dob" DATETIME NOT NULL,
        "class_applied" TEXT NOT NULL,
        "father_name" TEXT NOT NULL,
        "mother_name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "academic_year_id" TEXT,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        "updatedAt" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);

    // Insert Seed Data with proper ISO-8601 timestamps
    db.exec(`
      INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "password", "createdAt", "updatedAt")
      VALUES
        ('user-admin', 'admin@jamia.edu', 'Super Admin', 'SUPER_ADMIN', '$2b$10$yUhhdvD6Jk2.b1YF4qG6FuDfpUEhDAQyYtm6f7PZ5JV/U8rFHIFRG', '${now}', '${now}'),
        ('user-teacher', 'khadija@jamia.edu', 'Ustaza Khadija', 'TEACHER', '$2b$10$ql5EjuJFDLgA/HvKPn.la.RziK1CRKkzgLaRo0zWtHiqgvfcljyYK', '${now}', '${now}'),
        ('user-student', 'student1@jamia.edu', 'Aisha Binte Umar', 'STUDENT', '$2b$10$xdWrV8dLoEdu3EePmvGZHuDENgZ4HLwr8v2iNWqzkJO89o89uf7Ce', '${now}', '${now}');

      INSERT OR IGNORE INTO "Teacher" ("id", "staff_id", "user_id", "title", "designation", "qualifications", "salary", "status")
      VALUES ('tch-001', 'TCH-001', 'user-teacher', 'Ustaza', 'Senior Arabic Teacher', 'Alima, Dars-e-Nizami', 25000, 'ACTIVE');

      INSERT OR IGNORE INTO "AcademicYear" ("id", "year_name", "start_date", "end_date", "is_active", "is_admission_open")
      VALUES ('ay-2025', '2025-26', '2025-04-01T00:00:00.000Z', '2026-03-31T23:59:59.000Z', 1, 1);

      INSERT OR IGNORE INTO "Class" ("id", "name", "display_name", "level_order", "section", "max_students", "class_teacher_id")
      VALUES ('cls-ula', 'Ula', 'Ula (1st Year)', 1, 'A', 30, 'tch-001');

      INSERT OR IGNORE INTO "Subject" ("id", "name", "code", "type", "class_id", "teacher_id", "max_marks", "pass_marks")
      VALUES
        ('sub-qrn', 'Quran Kareem', 'QRN-01', 'THEORY', 'cls-ula', 'tch-001', 100, 40),
        ('sub-arb', 'Arabic Grammar', 'ARB-01', 'THEORY', 'cls-ula', 'tch-001', 100, 40);

      INSERT OR IGNORE INTO "Student" ("id", "enrollment_id", "user_id", "first_name", "last_name", "class_id", "dob", "guardian_name", "guardian_phone", "guardian_email", "status", "address")
      VALUES ('std-001', 'JK-2025-001', 'user-student', 'Aisha', 'Binte Umar', 'cls-ula', '2010-05-15T00:00:00.000Z', 'Umar Farooq', '9876543210', 'umar@example.com', 'ENROLLED', '123 Jamia Street');

      INSERT OR IGNORE INTO "Exam" ("id", "name", "term", "academic_year_id")
      VALUES ('exam-mid', 'Mid-Term 2025', 'Term 1', 'ay-2025');

      INSERT OR IGNORE INTO "Result" ("id", "exam_id", "student_id", "subject_id", "marks_obtained", "remarks")
      VALUES
        ('res-001', 'exam-mid', 'std-001', 'sub-qrn', 85, 'Excellent recitation'),
        ('res-002', 'exam-mid', 'std-001', 'sub-arb', 72, 'Good progress');

      INSERT OR IGNORE INTO "FeeRecord" ("id", "student_id", "fee_type", "total_amount", "paid_amount", "due_date", "status", "receipt_number", "payment_date")
      VALUES ('fee-001', 'std-001', 'Tuition Fee', 5000, 5000, '2025-05-31T00:00:00.000Z', 'PAID', 'RCP-001', '2025-05-10T00:00:00.000Z');
    `);

    sanitizeDates(db);
    syncDbFiles(dbPaths);
  } catch (err) {
    console.warn("[AI Studio] Error initializing SQLite database:", err);
  }
}

function sanitizeDates(db: any) {
  try {
    db.exec(`
      UPDATE "AcademicYear" SET start_date = start_date || 'T00:00:00.000Z' WHERE length(start_date) = 10;
      UPDATE "AcademicYear" SET end_date = end_date || 'T00:00:00.000Z' WHERE length(end_date) = 10;
      UPDATE "User" SET createdAt = replace(createdAt, ' ', 'T') || '.000Z' WHERE createdAt NOT LIKE '%Z';
      UPDATE "User" SET updatedAt = replace(updatedAt, ' ', 'T') || '.000Z' WHERE updatedAt NOT LIKE '%Z';
      UPDATE "Student" SET dob = dob || 'T00:00:00.000Z' WHERE length(dob) = 10;
      UPDATE "FeeRecord" SET due_date = due_date || 'T00:00:00.000Z' WHERE length(due_date) = 10;
      UPDATE "FeeRecord" SET payment_date = payment_date || 'T00:00:00.000Z' WHERE length(payment_date) = 10;
      UPDATE "Attendance" SET date = date || 'T00:00:00.000Z' WHERE length(date) = 10;
      UPDATE "Admission" SET dob = dob || 'T00:00:00.000Z' WHERE length(dob) = 10;
      UPDATE "Admission" SET createdAt = replace(createdAt, ' ', 'T') || '.000Z' WHERE createdAt NOT LIKE '%Z';
      UPDATE "Admission" SET updatedAt = replace(updatedAt, ' ', 'T') || '.000Z' WHERE updatedAt NOT LIKE '%Z';
    `);
  } catch {
    // Ignore if tables do not exist
  }
}

function syncDbFiles(paths: string[]) {
  try {
    const primary = paths[0];
    const secondary = paths[1];
    if (fs.existsSync(primary) && !fs.existsSync(secondary)) {
      fs.copyFileSync(primary, secondary);
    } else if (fs.existsSync(secondary) && !fs.existsSync(primary)) {
      fs.copyFileSync(secondary, primary);
    }
  } catch {
    // Ignore sync errors
  }
}
