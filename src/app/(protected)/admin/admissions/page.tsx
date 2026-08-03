import { prisma } from "@/lib/prisma";
import { PageHeader, SectionCard, TableWrapper, Table, Thead, Tbody, Tr, Td, StatusBadge, EmptyState, ActionBtn } from "@/components/ui/shared";
import { Inbox, Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminAdmissionsPage() {
  const admissions = await prisma.admission.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Admission Applications" description="Review and manage new student applications." />

      <SectionCard title="All Applications">
        {admissions.length === 0 ? (
          <EmptyState icon={Inbox} title="No Applications Yet" description="When new students apply, they will appear here." />
        ) : (
          <TableWrapper>
            <Table>
              <Thead cols={["Applicant Name", "Class Applied", "Date of Birth", "Phone", "Applied On", "Status", "Actions"]} />
              <Tbody>
                {admissions.map(app => (
                  <Tr key={app.id}>
                    <Td className="font-medium">{app.applicant_name}</Td>
                    <Td>{app.class_applied}</Td>
                    <Td>{new Date(app.dob).toLocaleDateString()}</Td>
                    <Td>{app.phone}</Td>
                    <Td>{app.createdAt.toLocaleDateString()}</Td>
                    <Td>
                      <StatusBadge 
                        label={app.status} 
                        type={app.status === "APPROVED" ? "success" : app.status === "REJECTED" ? "danger" : "warning"} 
                      />
                    </Td>
                    <Td>
                      <Link href={`/admin/admissions/${app.id}`} className="p-2 inline-flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableWrapper>
        )}
      </SectionCard>
    </div>
  );
}
