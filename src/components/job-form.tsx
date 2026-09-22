import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import {
  ACTION_PRESETS,
  ENGINEERS,
  REPORT_PRESETS,
  emptyDraft,
  type Job,
  type JobDraft,
} from "@/lib/jobs";
import { useJobs } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarcodeScanner } from "@/components/barcode-scanner";

type Props = {
  open: boolean;
  job: Job | null;
  onOpenChange: (open: boolean) => void;
};

export function JobForm({ open, job, onOpenChange }: Props) {
  const jobs = useJobs((s) => s.jobs);
  const addJob = useJobs((s) => s.addJob);
  const updateJob = useJobs((s) => s.updateJob);
  const [draft, setDraft] = useState<JobDraft>(emptyDraft());
  const [scanOpen, setScanOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (job) {
      setDraft({
        receivedAt: job.receivedAt,
        device: job.device,
        serial: job.serial,
        report: job.report,
        action: job.action,
        engineer: job.engineer,
        deliveredAt: job.deliveredAt,
        note: job.note,
        customerName: job.customerName,
        customerPhone: job.customerPhone,
      });
    } else {
      setDraft(emptyDraft());
    }
  }, [open, job]);

  const deviceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of jobs) {
      if (item.device) set.add(item.device);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  function patch<K extends keyof JobDraft>(key: K, value: JobDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.device.trim() && !draft.serial.trim()) {
      setError("اكتب اسم الجهاز أو رقم السريال على الأقل.");
      return;
    }
    if (job) {
      updateJob(job.id, draft);
      toast.success("تم حفظ التعديل");
    } else {
      addJob(draft);
      toast.success("تم إضافة الأوردر");
    }
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>{job ? `تعديل ${job.ticket}` : "أوردر صيانة جديد"}</DialogTitle>
            <DialogDescription>
              نفس خانات شيت الورشة، بالإضافة لاسم ورقم العميل لإرسال واتساب.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="grid gap-4">
            <section className="grid gap-3 rounded-lg bg-bg p-4 sm:grid-cols-2">
              <Field label="اسم العميل" htmlFor="customerName">
                <Input
                  id="customerName"
                  value={draft.customerName}
                  onChange={(e) => patch("customerName", e.target.value)}
                  placeholder="اسم العميل"
                />
              </Field>
              <Field label="رقم العميل" htmlFor="customerPhone">
                <Input
                  id="customerPhone"
                  dir="ltr"
                  inputMode="tel"
                  className="text-start font-mono"
                  value={draft.customerPhone}
                  onChange={(e) => patch("customerPhone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                />
              </Field>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="تاريخ الاستلام" htmlFor="receivedAt">
                <Input
                  id="receivedAt"
                  type="date"
                  value={draft.receivedAt}
                  onChange={(e) => patch("receivedAt", e.target.value)}
                  required
                />
              </Field>
              <Field label="تاريخ التسليم" htmlFor="deliveredAt">
                <Input
                  id="deliveredAt"
                  type="date"
                  value={draft.deliveredAt}
                  onChange={(e) => patch("deliveredAt", e.target.value)}
                />
              </Field>
            </div>

            <Field label="اسم الجهاز" htmlFor="device">
              <Input
                id="device"
                list="device-models"
                value={draft.device}
                onChange={(e) => patch("device", e.target.value)}
                placeholder="DS-7104HGHI-M1"
              />
              <datalist id="device-models">
                {deviceOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>

            <Field label="رقم السريال" htmlFor="serial">
              <div className="flex gap-2">
                <Input
                  id="serial"
                  dir="ltr"
                  className="text-start font-mono"
                  value={draft.serial}
                  onChange={(e) => patch("serial", e.target.value)}
                  placeholder="امسح الباركود أو اكتب الرقم"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="مسح باركود"
                  onClick={() => setScanOpen(true)}
                >
                  <ScanLine />
                </Button>
              </div>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="التقرير الفني" htmlFor="report">
                <Input
                  id="report"
                  list="report-presets"
                  value={draft.report}
                  onChange={(e) => patch("report", e.target.value)}
                  placeholder="No Power / قاطع داتا"
                />
                <datalist id="report-presets">
                  {REPORT_PRESETS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>
              <Field label="الإجراء ACTION" htmlFor="action">
                <Input
                  id="action"
                  list="action-presets"
                  value={draft.action}
                  onChange={(e) => patch("action", e.target.value)}
                  placeholder="change board / test ok"
                />
                <datalist id="action-presets">
                  {ACTION_PRESETS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>
            </div>

            <Field label="المهندس المنفذ" htmlFor="engineer">
              <Select
                value={draft.engineer || "__none"}
                onValueChange={(value) => patch("engineer", value === "__none" ? "" : value)}
              >
                <SelectTrigger id="engineer">
                  <SelectValue placeholder="اختر المهندس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">غير معيّن</SelectItem>
                  {ENGINEERS.map((eng) => (
                    <SelectItem key={eng.id} value={eng.id}>
                      {eng.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="ملاحظات" htmlFor="note">
              <Textarea
                id="note"
                value={draft.note}
                onChange={(e) => patch("note", e.target.value)}
                placeholder="قطع غيار / رفض تكلفة / ملاحظات التسليم"
              />
            </Field>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit">{job ? "حفظ التعديل" : "حفظ الأوردر"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        open={scanOpen}
        onOpenChange={setScanOpen}
        onScan={(value) => {
          patch("serial", value);
          toast.success(`تم قراءة السريال ${value}`);
        }}
      />
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
