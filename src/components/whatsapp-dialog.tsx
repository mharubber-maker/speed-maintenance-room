import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Job } from "@/lib/jobs";
import {
  WA_TEMPLATES,
  type WaTemplateId,
  buildWhatsAppMessage,
  formatPhoneDisplay,
  toWhatsAppNumber,
  whatsappUrl,
} from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useJobs } from "@/lib/store";

type Props = {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WhatsAppDialog({ job, open, onOpenChange }: Props) {
  const updateJob = useJobs((s) => s.updateJob);
  const [template, setTemplate] = useState<WaTemplateId>("ready");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [custom, setCustom] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !job) return;
    setTemplate("ready");
    setPhone(job.customerPhone);
    setName(job.customerName);
    setCustom(null);
  }, [open, job]);

  const activeJob = job;
  const resolvedPhone = phone || activeJob?.customerPhone || "";
  const resolvedName = name || activeJob?.customerName || "";

  const message = useMemo(() => {
    if (custom !== null) return custom;
    if (!activeJob) return "";
    return buildWhatsAppMessage({
      template,
      customerName: resolvedName,
      device: activeJob.device,
      serial: activeJob.serial,
      ticket: activeJob.ticket,
    });
  }, [activeJob, custom, resolvedName, template]);

  const url = whatsappUrl(resolvedPhone, message);
  const validPhone = Boolean(toWhatsAppNumber(resolvedPhone));

  function syncJobContact() {
    if (!activeJob) return;
    if (phone || name) {
      updateJob(activeJob.id, {
        receivedAt: activeJob.receivedAt,
        device: activeJob.device,
        serial: activeJob.serial,
        report: activeJob.report,
        action: activeJob.action,
        engineer: activeJob.engineer,
        deliveredAt: activeJob.deliveredAt,
        note: activeJob.note,
        customerName: resolvedName,
        customerPhone: resolvedPhone,
      });
    }
  }

  function send() {
    if (!url) return;
    syncJobContact();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>رسالة واتساب</DialogTitle>
          <DialogDescription>
            {activeJob ? `${activeJob.ticket} · ${activeJob.device || "بدون موديل"}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="wa-name">اسم العميل</Label>
              <Input
                id="wa-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد علي"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="wa-phone">رقم العميل</Label>
              <Input
                id="wa-phone"
                inputMode="tel"
                dir="ltr"
                className="text-start font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>
          {resolvedPhone ? (
            <p className="text-xs text-muted">
              سيصل إلى {validPhone ? formatPhoneDisplay(resolvedPhone) : "رقم غير صالح"}
            </p>
          ) : (
            <p className="text-xs text-warn">سجّل رقم العميل عشان الرسالة تتبعت.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {WA_TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTemplate(item.id);
                  setCustom(null);
                }}
                className={
                  template === item.id && custom === null
                    ? "h-10 rounded-full bg-primary px-3 text-sm font-medium text-primary-fg"
                    : "h-10 rounded-full border border-border bg-elevated px-3 text-sm text-fg hover:bg-bg"
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="wa-body">نص الرسالة</Label>
            <Textarea
              id="wa-body"
              rows={8}
              value={message}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" variant="whatsapp" disabled={!url} onClick={send}>
            <MessageCircle />
            فتح واتساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
