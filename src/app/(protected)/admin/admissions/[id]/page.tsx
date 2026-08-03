import { prisma } from "@/lib/prisma";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui/shared";
import { Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const application = await prisma.admission.findUnique({
    where: { id }
  });

  if (!application) return notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    await prisma.admission.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath(`/admin/admissions/${id}`);
    revalidatePath("/admin/admissions");
    
    // In a real app, if APPROVED, we might redirect to /admin/students/new with pre-filled data,
    // or automatically create the Student and User records here.
    if (newStatus === "APPROVED") {
       // Just update status for now.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/admissions" className="p-2 bg-card rounded-xl border border-border shadow-sm hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <PageHeader title="Application Details" description={`Reviewing application for ${application.applicant_name}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Applicant Information">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{application.applicant_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Applied For</p>
                <p className="font-medium text-foreground">{application.class_applied}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium text-foreground">{new Date(application.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Date</p>
                <p className="font-medium text-foreground">{application.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Family & Contact">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-muted-foreground">Father's Name</p>
                <p className="font-medium text-foreground">{application.father_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mother's Name</p>
                <p className="font-medium text-foreground">{application.mother_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{application.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Complete Address</p>
                <p className="font-medium text-foreground">{application.address}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status & Actions">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted-foreground">Current Status</span>
              <StatusBadge label={application.status} type={application.status === "APPROVED" ? "success" : application.status === "REJECTED" ? "danger" : "warning"} />
            </div>

            {application.status === "PENDING" && (
              <form action={updateStatus} className="flex flex-col gap-3">
                <input type="hidden" name="status" value="APPROVED" />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
                  <Check className="w-5 h-5" /> Approve Application
                </button>
              </form>
            )}

            {application.status === "PENDING" && (
              <form action={updateStatus} className="flex flex-col gap-3 mt-3">
                <input type="hidden" name="status" value="REJECTED" />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-colors">
                  <X className="w-5 h-5" /> Reject
                </button>
              </form>
            )}

            {application.status !== "PENDING" && (
              <div className="p-4 bg-muted rounded-xl text-center">
                <p className="text-sm text-muted-foreground">This application has been processed.</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
