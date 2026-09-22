import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, RotateCcw, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { StatsBar } from "@/components/stats-bar";
import { JobsBoard } from "@/components/jobs-board";
import { JobForm } from "@/components/job-form";
import { WhatsAppDialog } from "@/components/whatsapp-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENGINEERS,
  jobStatus,
  monthLabel,
  searchHaystack,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import { useJobs } from "@/lib/store";
import { exportCsv, exportJson, parseImportedJobs } from "@/lib/export";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const jobs = useJobs((s) => s.jobs);
  const initialized = useJobs((s) => s.initialized);
  const deleteJob = useJobs((s) => s.deleteJob);
  const restoreSheet = useJobs((s) => s.restoreSheet);
  const replaceAll = useJobs((s) => s.replaceAll);
  const [ready, setReady] = useState(false);

  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [engineer, setEngineer] = useState("all");
  const [status, setStatus] = useState<"all" | JobStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [waJob, setWaJob] = useState<Job | null>(null);
  const [waOpen, setWaOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      useJobs.getState().ensureSeed();
      setReady(true);
    };
    const unsub = useJobs.persist.onFinishHydration(finish);
    void Promise.resolve(useJobs.persist.rehydrate()).finally(finish);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const months = useMemo(() => {
    const map = new Map<string, string>();
    for (const job of jobs) {
      const key = job.month || monthLabel("", job.receivedAt);
      map.set(key, monthLabel(job.month, job.receivedAt));
    }
    return [...map.entries()];
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (month !== "all" && (job.month || monthLabel("", job.receivedAt)) !== month) return false;
      if (engineer !== "all") {
        if (engineer === "none" && job.engineer) return false;
        if (engineer !== "none" && job.engineer !== engineer) return false;
      }
      if (status !== "all" && jobStatus(job) !== status) return false;
      if (q && !searchHaystack(job).includes(q)) return false;
      return true;
    });
  }, [jobs, query, month, engineer, status]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    setFormOpen(true);
  }

  function openWa(job: Job) {
    setWaJob(job);
    setWaOpen(true);
  }

  function confirmDelete(job: Job) {
    const ok = window.confirm(`حذف الأوردر ${job.ticket}؟`);
    if (!ok) return;
    deleteJob(job.id);
    toast.success("تم حذف الأوردر");
  }

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseImportedJobs(String(reader.result));
        replaceAll(parsed);
        toast.success(`تم استيراد ${parsed.length} أوردر`);
      } catch {
        toast.error("ملف النسخة الاحتياطية غير صالح");
      }
    };
    reader.readAsText(file);
  }

  const visibleJobs = ready && initialized ? jobs : [];
  const visibleFiltered = ready && initialized ? filtered : [];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Logo className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-base font-semibold leading-tight sm:text-lg">
              غرفة صيانة سبيد
            </h1>
            <p className="truncate text-xs text-muted">سجل الورشة · استلام · إصلاح · تسليم</p>
          </div>
          <Button type="button" size="sm" className="hidden sm:inline-flex" onClick={openNew}>
            <Plus />
            أوردر جديد
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 pb-28">
        <StatsBar jobs={visibleJobs} />

        <section className="flex flex-col gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-card)] sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث بالسريال، الجهاز، العميل، العطل..."
              className="ps-10"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger aria-label="الشهر">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الشهور</SelectItem>
                {months.map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={engineer} onValueChange={setEngineer}>
              <SelectTrigger aria-label="المهندس">
                <SelectValue placeholder="المهندس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المهندسين</SelectItem>
                <SelectItem value="none">غير معيّن</SelectItem>
                {ENGINEERS.map((eng) => (
                  <SelectItem key={eng.id} value={eng.id}>
                    {eng.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger aria-label="الحالة">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="in_progress">قيد الإصلاح</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => exportCsv(visibleFiltered)}>
              <Download />
              تصدير إكسل
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => exportJson(visibleJobs)}>
              <Download />
              نسخة احتياطية
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload />
              استيراد
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                const ok = window.confirm(
                  "ترجع الشيت الأصلي من ملف الورشة؟ التعديلات الحالية هتتشال.",
                );
                if (!ok) return;
                restoreSheet();
                toast.success("تم استرجاع شيت الورشة");
              }}
            >
              <RotateCcw />
              الشيت الأصلي
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
              }}
            />
            <p className="ms-auto self-center text-xs tabular-nums text-muted">
              {visibleFiltered.length} من {visibleJobs.length}
            </p>
          </div>
        </section>

        {!ready ? (
          <div className="rounded-xl bg-surface px-6 py-16 text-center text-sm text-muted shadow-[var(--shadow-card)]">
            جاري تحميل سجل الورشة...
          </div>
        ) : (
          <JobsBoard
            jobs={visibleFiltered}
            onEdit={openEdit}
            onWhatsApp={openWa}
            onDelete={confirmDelete}
          />
        )}
      </main>

      <button
        type="button"
        onClick={openNew}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] end-4 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-fg shadow-[var(--shadow-card)] sm:hidden"
      >
        <Plus className="size-5" />
        أوردر جديد
      </button>

      <JobForm open={formOpen} job={editing} onOpenChange={setFormOpen} />
      <WhatsAppDialog job={waJob} open={waOpen} onOpenChange={setWaOpen} />
    </div>
  );
}
