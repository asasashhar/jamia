import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords properly
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@jamia.edu' },
    update: { password: adminPassword, name: 'Super Admin', role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@jamia.edu',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      password: adminPassword,
    },
  });
  console.log('Created super admin:', superAdmin.email);

  // Create Teacher User
  const teacherUser = await prisma.user.upsert({
    where: { email: 'khadija@jamia.edu' },
    update: { password: teacherPassword, name: 'Ustaza Khadija', role: 'TEACHER' },
    create: {
      email: 'khadija@jamia.edu',
      name: 'Ustaza Khadija',
      role: 'TEACHER',
      password: teacherPassword,
    },
  });
  console.log('Created teacher:', teacherUser.email);

  // Create Student User
  const studentUser = await prisma.user.upsert({
    where: { email: 'student1@jamia.edu' },
    update: { password: studentPassword, name: 'Aisha Binte Umar', role: 'STUDENT' },
    create: {
      email: 'student1@jamia.edu',
      name: 'Aisha Binte Umar',
      role: 'STUDENT',
      password: studentPassword,
    },
  });
  console.log('Created student:', studentUser.email);

  // Create Teacher Profile (upsert to avoid duplicates)
  const teacher = await prisma.teacher.upsert({
    where: { user_id: teacherUser.id },
    update: {},
    create: {
      staff_id: 'TCH-001',
      user_id: teacherUser.id,
      title: 'Ustaza',
      designation: 'Senior Arabic Teacher',
      qualifications: 'Alima, Dars-e-Nizami',
      salary: 25000,
      status: 'ACTIVE',
    },
  });
  console.log('Created teacher profile:', teacher.staff_id);

  // Create Academic Year (check first)
  let year = await prisma.academicYear.findFirst({ where: { year_name: '2025-26' } });
  if (!year) {
    year = await prisma.academicYear.create({
      data: {
        year_name: '2025-26',
        start_date: new Date('2025-04-01'),
        end_date: new Date('2026-03-31'),
        is_active: true,
      },
    });
  }
  console.log('Academic year:', year.year_name);

  // Create Class (check first)
  let ulaClass = await prisma.class.findFirst({ where: { name: 'Ula', section: 'A' } });
  if (!ulaClass) {
    ulaClass = await prisma.class.create({
      data: {
        name: 'Ula',
        display_name: 'Ula (1st Year)',
        level_order: 1,
        section: 'A',
        max_students: 30,
        class_teacher_id: teacher.id,
      },
    });
  }
  console.log('Class:', ulaClass.display_name);

  // Create Subjects (check first)
  let quranSubject = await prisma.subject.findFirst({ where: { code: 'QRN-01' } });
  if (!quranSubject) {
    quranSubject = await prisma.subject.create({
      data: {
        name: 'Quran Kareem',
        code: 'QRN-01',
        type: 'THEORY',
        class_id: ulaClass.id,
        teacher_id: teacher.id,
        max_marks: 100,
        pass_marks: 40,
      },
    });
  }

  let arabicSubject = await prisma.subject.findFirst({ where: { code: 'ARB-01' } });
  if (!arabicSubject) {
    arabicSubject = await prisma.subject.create({
      data: {
        name: 'Arabic Grammar',
        code: 'ARB-01',
        type: 'THEORY',
        class_id: ulaClass.id,
        teacher_id: teacher.id,
        max_marks: 100,
        pass_marks: 40,
      },
    });
  }
  console.log('Subjects created');

  // Create Student Profile
  const student = await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      enrollment_id: 'JK-2025-001',
      user_id: studentUser.id,
      first_name: 'Aisha',
      last_name: 'Binte Umar',
      class_id: ulaClass.id,
      dob: new Date('2010-05-15'),
      guardian_name: 'Umar Farooq',
      guardian_phone: '9876543210',
      guardian_email: 'umar@example.com',
      status: 'ENROLLED',
      address: '123 Jamia Street',
    },
  });
  console.log('Created student profile:', student.enrollment_id);

  // Create a sample exam & result
  let exam = await prisma.exam.findFirst({ where: { name: 'Mid-Term 2025' } });
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        name: 'Mid-Term 2025',
        term: 'Term 1',
        academic_year_id: year.id,
      },
    });
  }

  // Create sample results
  const existingResult = await prisma.result.findFirst({
    where: { student_id: student.id, exam_id: exam.id, subject_id: quranSubject.id }
  });
  if (!existingResult) {
    await prisma.result.create({
      data: {
        exam_id: exam.id,
        student_id: student.id,
        subject_id: quranSubject.id,
        marks_obtained: 85,
        remarks: 'Excellent recitation',
      },
    });
    await prisma.result.create({
      data: {
        exam_id: exam.id,
        student_id: student.id,
        subject_id: arabicSubject.id,
        marks_obtained: 72,
        remarks: 'Good progress',
      },
    });
  }
  console.log('Sample results created');

  // Create sample fee record
  const existingFee = await prisma.feeRecord.findFirst({ where: { student_id: student.id } });
  if (!existingFee) {
    await prisma.feeRecord.create({
      data: {
        student_id: student.id,
        fee_type: 'Tuition Fee',
        total_amount: 5000,
        paid_amount: 5000,
        due_date: new Date('2025-05-31'),
        status: 'PAID',
        receipt_number: 'RCP-001',
        payment_date: new Date('2025-05-10'),
      },
    });
  }
  console.log('Sample fee record created');

  console.log('\n✅ Seeding finished successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:   admin@jamia.edu     / admin123');
  console.log('  Teacher: khadija@jamia.edu   / teacher123');
  console.log('  Student: student1@jamia.edu  / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
