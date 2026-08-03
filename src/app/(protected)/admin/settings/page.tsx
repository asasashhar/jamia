import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Settings, School, Shield, CheckCircle2, Building2, MapPin, Phone, Save, Lock } from "lucide-react";

export default async function AdminSettingsPage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { is_active: true }
  });

  const isAdmissionOpen = activeYear?.is_admission_open ?? false;
  const currentYearName = activeYear?.year_name ?? "Not Set";

  async function toggleAdmission() {
    "use server";
    if (activeYear) {
      await prisma.academicYear.update({
        where: { id: activeYear.id },
        data: { is_admission_open: !activeYear.is_admission_open }
      });
      revalidatePath("/admin/settings");
    }
  }

  // Placeholder action for other forms to prevent errors
  async function dummyAction() {
    "use server";
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-gray-200/50 pb-6 dark:border-gray-800/50">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            System Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your institution preferences and system configurations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Toggles & Active Year */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/20 dark:shadow-none p-6 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <School className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Status</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Academic Year</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium text-sm border border-indigo-100 dark:border-indigo-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                  {currentYearName}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Admissions Open</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow new students to enroll</p>
                  </div>
                  <form action={toggleAdmission}>
                    <button 
                      type="submit" 
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isAdmissionOpen ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isAdmissionOpen ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Institution Profile */}
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/20 dark:shadow-none p-6 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Institution Profile</h2>
            </div>
            
            <form action={dummyAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution Name</label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      defaultValue="Jamia Khadijatul Kubra Lil Banat" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea 
                      rows={2}
                      placeholder="Full Address" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/25">
                  <Save className="h-4 w-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password */}
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/20 dark:shadow-none p-6 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            
            <form action={dummyAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-rose-500/25">
                  <Save className="h-4 w-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
