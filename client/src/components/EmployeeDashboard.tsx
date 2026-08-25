import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, LogIn, LogOut, AlertCircle, CheckCircle2, RefreshCw, ChevronLeft, Shield, Calendar, FileText, XCircle, Send, Fingerprint } from "lucide-react";
import { verifyBiometrics } from "@/lib/biometrics";
import { useLocalization } from "@/contexts/LocalizationContext";
import { cn } from "@/lib/utils";

export function EmployeeDashboard({ organizationId }: { organizationId: number | null }) {
  const [status, setStatus] = useState<{ type: "info" | "success" | "error"; message: string } | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showPermForm, setShowPermForm] = useState(false);
  
  const [leaveData, setLeaveData] = useState({
    type: "annual" as "annual" | "sick" | "emergency" | "unpaid" | "other",
    startsAt: "",
    endsAt: "",
    reason: ""
  });

  const [permData, setPermData] = useState({
    type: "late_arrival" as "late_arrival" | "early_departure" | "mid_shift_break",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
    reason: ""
  });

  const { data: myStatus, isLoading, refetch } = trpc.attendance.getMyStatus.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId, retry: false }
  );

  const { data: leaves, refetch: refetchLeaves } = trpc.hr.listLeaves.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  const submitLeave = trpc.hr.submitLeave.useMutation({
    onSuccess: () => {
      setStatus({ type: "success", message: "تم تقديم طلب الإجازة بنجاح." });
      setShowLeaveForm(false);
      void refetchLeaves();
    },
    onError: (error: any) => setStatus({ type: "error", message: error.message })
  });

  const submitPerm = trpc.hr.submitPermission.useMutation({
    onSuccess: () => {
      setStatus({ type: "success", message: "تم تقديم طلب الاستئذان بنجاح." });
      setShowPermForm(false);
    },
    onError: (error: any) => setStatus({ type: "error", message: error.message })
  });

  const checkIn = trpc.attendance.checkIn.useMutation({
    onSuccess: () => {
      setStatus({ type: "success", message: "تم تسجيل الحضور بنجاح." });
      void refetch();
    },
    onError: (error) => {
      setStatus({ type: "error", message: error.message });
    }
  });

  const checkOut = trpc.attendance.checkOut.useMutation({
    onSuccess: () => {
      setStatus({ type: "success", message: "تم تسجيل الانصراف بنجاح." });
      void refetch();
    },
    onError: (error) => {
      setStatus({ type: "error", message: error.message });
    }
  });

  const handleCheckIn = async () => {
    setStatus({ type: "info", message: "جاري التحقق من الهوية بيومترياً..." });
    const bio = await verifyBiometrics();
    
    if (!bio.success) {
      setStatus({ type: "error", message: bio.error || "فشل التحقق البيومتري. يرجى المحاولة مرة أخرى." });
      return;
    }

    checkIn.mutate({ 
      organizationId: organizationId!, 
      latitude: coords?.latitude, 
      longitude: coords?.longitude,
      biometricVerified: true,
      biometricType: bio.type
    });
  };

  const handleCheckOut = async () => {
    setStatus({ type: "info", message: "جاري التحقق من الهوية بيومترياً..." });
    const bio = await verifyBiometrics();
    
    if (!bio.success) {
      setStatus({ type: "error", message: bio.error || "فشل التحقق البيومتري. يرجى المحاولة مرة أخرى." });
      return;
    }

    checkOut.mutate({ 
      organizationId: organizationId!, 
      latitude: coords?.latitude, 
      longitude: coords?.longitude,
      biometricVerified: true,
      biometricType: bio.type
    });
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "متصفحك لا يدعم تحديد الموقع الجغرافي." });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = "تعذر الحصول على الموقع.";
        if (error.code === error.PERMISSION_DENIED) msg = "يرجى تفعيل صلاحية الموقع الجغرافي في المتصفح.";
        setStatus({ type: "error", message: msg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getGeolocation();
  }, []);

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-slate-300" />
        <p className="text-lg font-medium text-slate-600">يرجى اختيار المؤسسة أولاً للوصول إلى لوحة الموظف.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-600" />
        <p className="mt-4 text-sm text-slate-500">جارٍ تحميل بيانات الموظف…</p>
      </div>
    );
  }

  const attendance = myStatus?.attendance;
  const profile = myStatus?.profile;
  const branch = profile?.branch;

  return (
    <div className="mx-auto max-w-md space-y-6 pb-12">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-[#0d1b2a]">مرحباً، {profile?.displayName || "زميلي الموظف"}</h1>
        <p className="mt-1 text-sm text-slate-500">{branch?.nameAr || "فرع غير محدد"}</p>
      </header>

      {/* Attendance Status Card */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/60">
        <div className={cn("h-2 w-full", attendance?.checkInAt ? "bg-emerald-500" : "bg-amber-500")} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>بصمة الحضور</span>
            <Badge variant="outline" className={cn(attendance?.checkInAt ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
              {attendance?.checkInAt ? "تم الحضور" : "لم يتم التسجيل"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">وقت الحضور</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {attendance?.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">وقت الانصراف</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {attendance?.checkOutAt ? new Date(attendance.checkOutAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!attendance?.checkInAt ? (
              <Button 
                onClick={handleCheckIn}
                disabled={checkIn.isPending || isLocating}
                className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              >
                {checkIn.isPending ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Fingerprint className="mr-2 h-5 w-5" />}
                تسجيل حضور بيومتري
              </Button>
            ) : !attendance?.checkOutAt ? (
              <Button 
                onClick={handleCheckOut}
                disabled={checkOut.isPending || isLocating}
                className="h-14 w-full rounded-2xl bg-[#0d1b2a] text-lg font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800"
              >
                {checkOut.isPending ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Fingerprint className="mr-2 h-5 w-5" />}
                تسجيل انصراف بيومتري
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">تم إكمال يوم العمل بنجاح.</span>
              </div>
            )}
          </div>

          {/* Location Status */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className={cn("h-4 w-4", coords ? "text-cyan-600" : "text-slate-300")} />
              <span>{isLocating ? "جارٍ تحديد الموقع…" : coords ? "تم تحديد الموقع الجغرافي" : "الموقع غير متاح"}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-cyan-700" onClick={getGeolocation} disabled={isLocating}>
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {status && (
        <div className={cn(
          "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6",
          status.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-900" : 
          status.type === "error" ? "border-rose-100 bg-rose-50 text-rose-900" : 
          "border-slate-100 bg-slate-50 text-slate-900"
        )}>
          {status.type === "success" ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />}
          <p>{status.message}</p>
        </div>
      )}

      {/* Requests Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-slate-200 bg-white shadow-sm" onClick={() => setShowLeaveForm(true)}>
          <Calendar className="h-6 w-6 text-emerald-600" />
          <span className="text-sm font-semibold">طلب إجازة</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-slate-200 bg-white shadow-sm" onClick={() => setShowPermForm(true)}>
          <FileText className="h-6 w-6 text-amber-600" />
          <span className="text-sm font-semibold">طلب استئذان</span>
        </Button>
      </div>

      {/* Leave Requests History */}
      {leaves && leaves.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">الطلبات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {leaves.slice(0, 3).map((leave: any) => (
                <div key={leave.id} className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      {leave.leaveType === "annual" ? "إجازة سنوية" : 
                       leave.leaveType === "sick" ? "إجازة مرضية" : "إجازة أخرى"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(leave.startsAt).toLocaleDateString("ar-EG")} - {new Date(leave.endsAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "rounded-lg",
                    leave.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                    leave.status === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" :
                    "border-slate-200 bg-slate-50 text-slate-600"
                  )}>
                    {leave.status === "approved" ? "مقبول" : 
                     leave.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Form Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" dir="rtl">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
              <CardTitle className="text-lg font-bold">تقديم طلب إجازة</CardTitle>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowLeaveForm(false)}>
                <XCircle className="h-6 w-6 text-slate-400" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">نوع الإجازة</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-0"
                  value={leaveData.type}
                  onChange={(e) => setLeaveData({...leaveData, type: e.target.value as any})}
                >
                  <option value="annual">سنوية</option>
                  <option value="sick">مرضية</option>
                  <option value="emergency">طارئة</option>
                  <option value="unpaid">بدون أجر</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">من تاريخ</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 p-3 text-sm" onChange={(e) => setLeaveData({...leaveData, startsAt: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">إلى تاريخ</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 p-3 text-sm" onChange={(e) => setLeaveData({...leaveData, endsAt: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السبب</label>
                <textarea 
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm" 
                  rows={3}
                  placeholder="اذكر سبب الإجازة هنا..."
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                />
              </div>
              <Button 
                className="h-12 w-full rounded-xl bg-emerald-600 font-bold"
                disabled={submitLeave.isPending}
                onClick={() => submitLeave.mutate({
                  organizationId: organizationId!,
                  branchId: branch?.id!,
                  leaveType: leaveData.type,
                  startsAt: new Date(leaveData.startsAt),
                  endsAt: new Date(leaveData.endsAt),
                  reason: leaveData.reason
                })}
              >
                {submitLeave.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                إرسال الطلب
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branch Policy Info */}
      <div className="rounded-2xl bg-cyan-50/50 p-4 text-center">
        <p className="text-xs leading-5 text-cyan-800">
          <strong>ملاحظة أمنية:</strong> هذا الفرع يتطلب تسجيل الحضور من داخل النطاق الجغرافي المعتمد. يتم تسجيل إحداثيات الموقع عند كل بصمة.
        </p>
      </div>
    </div>
  );
}
