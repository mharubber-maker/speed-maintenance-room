import {
  engineerName,
  formatDate,
  jobStatus,
  monthLabel,
  STATUS_META,
  type Job,
} from "@/lib/jobs";

function csvCell(value: string): string {
  const v = value.replaceAll('"', '""');
  return `"${v}"`;
}

export function jobsToCsv(jobs: Job[]): string {
  const header = [
    "Month",
    "تاريخ الاستلام",
    "اسم العميل",
    "رقم العميل",
    "اسم الجهاز",
    "رقم السريال",
    "التقرير الفني",
    "ACTION",
    "المهندس المنفذ",
    "تاريخ التسليم",
    "Note",
    "رقم الأوردر",
    "الحالة",
  ];
  const lines = jobs.map((job) =>
    [
      monthLabel(job.month, job.receivedAt),
      formatDate(job.receivedAt),
      job.customerName,
      job.customerPhone,
      job.device,
      job.serial,
      job.report,
      job.action,
      engineerName(job.engineer),
      formatDate(job.deliveredAt),
      job.note,
      job.ticket,
      STATUS_META[jobStatus(job)].label,
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${[header.map(csvCell).join(","), ...lines].join("\n")}`;
}

export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(jobs: Job[]) {
  downloadText("speed-workshop.csv", jobsToCsv(jobs), "text/csv;charset=utf-8");
}

export function exportJson(jobs: Job[]) {
  downloadText(
    "speed-workshop-backup.json",
    JSON.stringify(jobs, null, 2),
    "application/json",
  );
}

export function parseImportedJobs(raw: string): Job[] {
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) throw new Error("ملف غير صالح");
  return data.filter((row) => row && typeof row === "object" && "id" in row) as Job[];
}
