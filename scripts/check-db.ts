import { PrismaClient } from '../src/generated/prisma';

const p = new PrismaClient();

async function main() {
  const fees = await p.feeRecord.findMany();
  console.log('\n=== Fee Records ===');
  fees.forEach(f => {
    const balance = f.total_amount - f.paid_amount;
    console.log(`Type: ${f.fee_type} | Total: ${f.total_amount} | Paid: ${f.paid_amount} | Balance: ${balance} | Status: ${f.status}`);
  });

  const users = await p.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log('\n=== Users ===');
  users.forEach(u => console.log(`Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`));

  const students = await p.student.findMany({ include: { class: true } });
  console.log('\n=== Students ===');
  students.forEach(s => console.log(`${s.first_name} ${s.last_name} | ${s.enrollment_id} | ${s.status} | Class: ${s.class.display_name}`));
}

main().catch(console.error).finally(async () => { await p.$disconnect(); });
