import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function AdmissionPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams;
  const isSuccess = params.success === "1";

  const currentYear = await prisma.academicYear.findFirst({
    where: { is_active: true }
  });

  const isOpen = currentYear?.is_admission_open ?? false;

  async function submitApplication(formData: FormData) {
    "use server";
    
    const activeYear = await prisma.academicYear.findFirst({ where: { is_active: true } });
    if (!activeYear?.is_admission_open) return;

    await prisma.admission.create({
      data: {
        applicant_name: formData.get("applicant_name") as string,
        dob: new Date(formData.get("dob") as string),
        class_applied: formData.get("class_applied") as string,
        father_name: formData.get("father_name") as string,
        mother_name: formData.get("mother_name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        academic_year_id: activeYear.id
      }
    });

    const { redirect } = await import("next/navigation");
    redirect("/admission?success=1");
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Submitted Successfully!</h2>
        <p className="text-slate-600 mb-8 text-lg">
          Jazakallah Khair. We have received your admission application for Jamia Khadijatul Kubra. Our administration team will review it and contact you soon.
        </p>
        <a href="/admission" className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-[#0B4A2A] rounded-xl hover:bg-[#083a21] transition-colors">
          Submit Another Application
        </a>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Admissions Closed</h2>
        <p className="text-slate-600">
          We are not currently accepting new admission applications. Please check back later or contact the administration for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-[#0B4A2A] to-[#12653B] px-8 py-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Admission Application Form</h2>
          <p className="text-green-100/90 text-lg">Academic Year: {currentYear?.year_name}</p>
        </div>
        
        <form action={submitApplication} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Applicant Full Name *</label>
              <input name="applicant_name" required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all" placeholder="Enter student's name" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date of Birth *</label>
              <input name="dob" required type="date" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Class Applying For *</label>
              <select name="class_applied" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all">
                <option value="">Select a class</option>
                <option value="Aalima 1st Year">Aalima 1st Year</option>
                <option value="Aalima 2nd Year">Aalima 2nd Year</option>
                <option value="Aalima 3rd Year">Aalima 3rd Year</option>
                <option value="Hifz">Hifz</option>
                <option value="Nazra">Nazra</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Father's Name *</label>
              <input name="father_name" required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Mother's Name *</label>
              <input name="mother_name" required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
              <input name="phone" required type="tel" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all" placeholder="+91" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Complete Address *</label>
            <textarea name="address" required rows={3} className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B4A2A]/20 focus:border-[#0B4A2A] transition-all resize-none" placeholder="Enter complete residential address"></textarea>
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <button type="submit" className="w-full h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold text-lg rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98]">
              Submit Application
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">By submitting this form, you agree to the institution's terms and conditions.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
