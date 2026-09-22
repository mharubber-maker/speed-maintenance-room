export type Job = {
  id: string;
  ticket: string;
  month: string;
  receivedAt: string;
  device: string;
  serial: string;
  report: string;
  action: string;
  engineer: string;
  deliveredAt: string;
  note: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
};

export type JobStatus = "new" | "in_progress" | "delivered";

export type JobDraft = Omit<Job, "id" | "ticket" | "createdAt" | "updatedAt" | "month"> & {
  month?: string;
};

export const ENGINEERS = [
  { id: "hazem", name: "حازم" },
  { id: "hamed", name: "حامد" },
  { id: "mohamed", name: "محمد" },
  { id: "tito", name: "تيتو" },
] as const;

export const REPORT_PRESETS = [
  "No Power",
  "No Image",
  "POE Issue",
  "No POE",
  "Power Port Issue",
  "Power Cable Issue",
  "Network Cable Issue",
  "Network Port Issue",
  "NO BOOT",
  "Firmware Update",
  "Screen Issue",
  "HDMI Issue",
  "HDD Issue",
  "Cannot Save Configuration",
  "Stuck On Reboot",
  "Image Not Clear",
  "Password Reset",
  "Motorized Not Working",
  "SD Card Issue",
] as const;

export const ACTION_PRESETS = [
  "change board",
  "change cable",
  "change POE board",
  "change IC",
  "test ok",
  "firmware ok",
  "software ok",
  "RS ok",
  "repair POE",
  "repair power",
  "HDD issue",
  "technical support",
  "done",
] as const;

const MONTH_AR: Record<string, string> = {
  Jan: "يناير",
  January: "يناير",
  Feb: "فبراير",
  February: "فبراير",
  Mar: "مارس",
  March: "مارس",
  Apr: "أبريل",
  April: "أبريل",
  May: "مايو",
  Jun: "يونيو",
  June: "يونيو",
  Jul: "يوليو",
  July: "يوليو",
  Aug: "أغسطس",
  August: "أغسطس",
  Sep: "سبتمبر",
  Sept: "سبتمبر",
  September: "سبتمبر",
  Oct: "أكتوبر",
  October: "أكتوبر",
  Nov: "نوفمبر",
  November: "نوفمبر",
  Dec: "ديسمبر",
  December: "ديسمبر",
};

export function monthFromDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short" });
}

export function monthLabel(month: string, receivedAt?: string): string {
  if (month && MONTH_AR[month]) return MONTH_AR[month];
  const fromDate = receivedAt ? monthFromDate(receivedAt) : "";
  if (fromDate && MONTH_AR[fromDate]) return MONTH_AR[fromDate];
  return month || "—";
}

export function engineerName(id: string): string {
  if (!id) return "غير معيّن";
  return ENGINEERS.find((e) => e.id === id)?.name ?? id;
}

export function jobStatus(job: Pick<Job, "action" | "engineer" | "deliveredAt">): JobStatus {
  if (job.deliveredAt) return "delivered";
  if (job.action.trim() || job.engineer.trim()) return "in_progress";
  return "new";
}

export const STATUS_META: Record<
  JobStatus,
  { label: string; className: string }
> = {
  new: {
    label: "جديد",
    className: "bg-info-bg text-info",
  },
  in_progress: {
    label: "قيد الإصلاح",
    className: "bg-warn-bg text-warn",
  },
  delivered: {
    label: "تم التسليم",
    className: "bg-ok-bg text-ok",
  },
};

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function turnaroundDays(job: Pick<Job, "receivedAt" | "deliveredAt">): number | null {
  if (!job.receivedAt) return null;
  const end = job.deliveredAt ? new Date(`${job.deliveredAt}T12:00:00`) : new Date();
  const start = new Date(`${job.receivedAt}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function nextTicket(existing: Job[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  const re = new RegExp(`^SW-${year}-(\\d+)$`);
  for (const job of existing) {
    const m = re.exec(job.ticket);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `SW-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function emptyDraft(): JobDraft {
  return {
    receivedAt: todayIso(),
    device: "",
    serial: "",
    report: "",
    action: "",
    engineer: "",
    deliveredAt: "",
    note: "",
    customerName: "",
    customerPhone: "",
  };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function searchHaystack(job: Job): string {
  return [
    job.ticket,
    job.device,
    job.serial,
    job.report,
    job.action,
    job.note,
    job.customerName,
    job.customerPhone,
    engineerName(job.engineer),
  ]
    .join(" ")
    .toLowerCase();
}
