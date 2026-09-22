import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import seedRaw from "@/data/seed-jobs.json";
import {
  type Job,
  type JobDraft,
  monthFromDate,
  newId,
  nextTicket,
} from "@/lib/jobs";

type SeedRow = {
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
};

function loadSeed(): Job[] {
  const rows = seedRaw as SeedRow[];
  const now = new Date().toISOString();
  return rows.map((row, index) => {
    const receivedAt = row.receivedAt;
    const year = receivedAt ? receivedAt.slice(0, 4) : "2026";
    return {
      id: `seed-${index + 1}-${row.serial || "x"}`,
      ticket: `SW-${year}-${String(index + 1).padStart(4, "0")}`,
      month: row.month || monthFromDate(receivedAt),
      receivedAt,
      device: row.device,
      serial: row.serial,
      report: row.report,
      action: row.action,
      engineer: row.engineer,
      deliveredAt: row.deliveredAt,
      note: row.note,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      createdAt: receivedAt ? `${receivedAt}T08:00:00.000Z` : now,
      updatedAt: now,
    };
  });
}

type JobsState = {
  jobs: Job[];
  initialized: boolean;
  ensureSeed: () => void;
  addJob: (draft: JobDraft) => Job;
  updateJob: (id: string, draft: JobDraft) => void;
  deleteJob: (id: string) => void;
  restoreSheet: () => void;
  replaceAll: (jobs: Job[]) => void;
};

export const useJobs = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: [],
      initialized: false,
      ensureSeed: () => {
        if (get().initialized) return;
        set({ jobs: loadSeed(), initialized: true });
      },
      addJob: (draft) => {
        const jobs = get().jobs;
        const now = new Date().toISOString();
        const job: Job = {
          id: newId(),
          ticket: nextTicket(jobs),
          month: monthFromDate(draft.receivedAt),
          receivedAt: draft.receivedAt,
          device: draft.device.trim(),
          serial: draft.serial.trim(),
          report: draft.report.trim(),
          action: draft.action.trim(),
          engineer: draft.engineer,
          deliveredAt: draft.deliveredAt,
          note: draft.note.trim(),
          customerName: draft.customerName.trim(),
          customerPhone: draft.customerPhone.trim(),
          createdAt: now,
          updatedAt: now,
        };
        set({ jobs: [job, ...jobs], initialized: true });
        return job;
      },
      updateJob: (id, draft) => {
        const now = new Date().toISOString();
        set({
          jobs: get().jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  month: monthFromDate(draft.receivedAt) || job.month,
                  receivedAt: draft.receivedAt,
                  device: draft.device.trim(),
                  serial: draft.serial.trim(),
                  report: draft.report.trim(),
                  action: draft.action.trim(),
                  engineer: draft.engineer,
                  deliveredAt: draft.deliveredAt,
                  note: draft.note.trim(),
                  customerName: draft.customerName.trim(),
                  customerPhone: draft.customerPhone.trim(),
                  updatedAt: now,
                }
              : job,
          ),
        });
      },
      deleteJob: (id) => {
        set({ jobs: get().jobs.filter((job) => job.id !== id) });
      },
      restoreSheet: () => {
        set({ jobs: loadSeed(), initialized: true });
      },
      replaceAll: (jobs) => {
        set({ jobs, initialized: true });
      },
    }),
    {
      name: "speed-workshop-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ jobs: state.jobs, initialized: state.initialized }),
    },
  ),
);
