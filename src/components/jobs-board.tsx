import type { ReactNode } from "react";
import { MoreHorizontal, MessageCircle, Pencil, Trash2, ScanLine } from "lucide-react";
import {
  STATUS_META,
  engineerName,
  formatDate,
  jobStatus,
  monthLabel,
  turnaroundDays,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onWhatsApp: (job: Job) => void;
  onDelete: (job: Job) => void;
};

export function JobsBoard({ jobs, onEdit, onWhatsApp, onDelete }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <ScanLine className="mx-auto size-8 text-subtle" />
        <p className="mt-3 font-medium">مفيش أوردرات بالفلتر ده</p>
        <p className="mt-1 text-sm text-muted">غيّر البحث أو أضف أوردر جديد.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={onEdit}
            onWhatsApp={onWhatsApp}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="hidden rounded-xl bg-surface shadow-[var(--shadow-card)] md:block">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[1100px] text-start text-sm">
            <thead className="bg-bg text-xs font-medium text-muted">
              <tr>
                <Th>الأوردر</Th>
                <Th>الاستلام</Th>
                <Th>العميل</Th>
                <Th>الجهاز</Th>
                <Th>السريال</Th>
                <Th>التقرير الفني</Th>
                <Th>ACTION</Th>
                <Th>المهندس</Th>
                <Th>التسليم</Th>
                <Th>الحالة</Th>
                <Th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const status = jobStatus(job);
                return (
                  <tr
                    key={job.id}
                    className="cursor-pointer border-t border-border/80 hover:bg-bg/70"
                    onClick={() => onEdit(job)}
                  >
                    <Td>
                      <div className="font-mono text-xs">{job.ticket}</div>
                      <div className="text-xs text-subtle">{monthLabel(job.month, job.receivedAt)}</div>
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatDate(job.receivedAt)}</Td>
                    <Td>
                      <div>{job.customerName || "—"}</div>
                      {job.customerPhone ? (
                        <div className="font-mono text-xs text-muted" dir="ltr">
                          {job.customerPhone}
                        </div>
                      ) : null}
                    </Td>
                    <Td className="max-w-48">
                      <span className="line-clamp-2 font-medium">{job.device || "—"}</span>
                    </Td>
                    <Td className="font-mono text-xs" dir="ltr">
                      {job.serial || "—"}
                    </Td>
                    <Td className="max-w-52">
                      <span className="line-clamp-2">{job.report || "—"}</span>
                    </Td>
                    <Td className="max-w-44">
                      <span className="line-clamp-2">{job.action || "—"}</span>
                    </Td>
                    <Td>{engineerName(job.engineer)}</Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatDate(job.deliveredAt)}</Td>
                    <Td>
                      <StatusPill status={status} />
                    </Td>
                    <Td>
                      <RowMenu job={job} onEdit={onEdit} onWhatsApp={onWhatsApp} onDelete={onDelete} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-3 py-3 text-start font-medium", className)}>{children}</th>;
}

function Td({
  children,
  className,
  dir,
}: {
  children?: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <td className={cn("px-3 py-3 align-top", className)} dir={dir}>
      {children}
    </td>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}

function JobCard({
  job,
  onEdit,
  onWhatsApp,
  onDelete,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onWhatsApp: (job: Job) => void;
  onDelete: (job: Job) => void;
}) {
  const status = jobStatus(job);
  const days = turnaroundDays(job);
  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 text-start" onClick={() => onEdit(job)}>
          <p className="font-mono text-xs text-muted">{job.ticket}</p>
          <h3 className="mt-1 font-medium leading-snug">{job.device || "جهاز بدون موديل"}</h3>
          <p className="mt-1 font-mono text-xs text-muted" dir="ltr">
            {job.serial || "بدون سريال"}
          </p>
        </button>
        <StatusPill status={status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
        <div>
          <dt>الاستلام</dt>
          <dd className="text-fg">{formatDate(job.receivedAt)}</dd>
        </div>
        <div>
          <dt>المهندس</dt>
          <dd className="text-fg">{engineerName(job.engineer)}</dd>
        </div>
        <div>
          <dt>العطل</dt>
          <dd className="line-clamp-2 text-fg">{job.report || "—"}</dd>
        </div>
        <div>
          <dt>الإجراء</dt>
          <dd className="line-clamp-2 text-fg">{job.action || "—"}</dd>
        </div>
      </dl>
      {job.customerName || job.customerPhone ? (
        <p className="mt-3 text-sm">
          {job.customerName || "عميل"}{" "}
          <span className="font-mono text-xs text-muted" dir="ltr">
            {job.customerPhone}
          </span>
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(job)}>
          <Pencil />
          تعديل
        </Button>
        <Button type="button" size="sm" variant="whatsapp" onClick={() => onWhatsApp(job)}>
          <MessageCircle />
          واتساب
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="حذف"
          onClick={() => onDelete(job)}
        >
          <Trash2 />
        </Button>
        {days !== null ? (
          <span className="ms-auto text-xs tabular-nums text-subtle">{days} يوم</span>
        ) : null}
      </div>
    </article>
  );
}

function RowMenu({
  job,
  onEdit,
  onWhatsApp,
  onDelete,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onWhatsApp: (job: Job) => void;
  onDelete: (job: Job) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="المزيد"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onEdit(job)}>
          <Pencil className="size-4" />
          تعديل
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onWhatsApp(job)}>
          <MessageCircle className="size-4" />
          واتساب
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger" onSelect={() => onDelete(job)}>
          <Trash2 className="size-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
