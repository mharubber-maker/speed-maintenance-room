import { useEffect, useId, useRef, useState } from "react";
import { ImageIcon, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (value: string) => void;
};

export function BarcodeScanner({ open, onOpenChange, onScan }: Props) {
  const hostId = useId().replace(/:/g, "");
  const fileHostId = `${hostId}-file`;
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const onScanRef = useRef(onScan);
  const onOpenChangeRef = useRef(onOpenChange);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  onScanRef.current = onScan;
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setStarting(true);

    (async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(hostId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ],
          useBarCodeDetectorIfSupported: true,
          verbose: false,
        });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 260, height: 140 } },
          (decoded) => {
            const value = decoded.trim();
            if (!value) return;
            onScanRef.current(value);
            onOpenChangeRef.current(false);
          },
          () => undefined,
        );
        if (cancelled) {
          await scanner.stop().catch(() => undefined);
        }
      } catch {
        if (cancelled) return;
        setError("الكاميرا غير متاحة هنا. التقط صورة للباركود أو اكتب الرقم يدويًا.");
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        void scanner.stop().catch(() => undefined);
      }
    };
  }, [open, hostId]);

  async function onFile(file: File) {
    setError(null);
    try {
      const live = scannerRef.current;
      if (live) {
        await live.stop().catch(() => undefined);
        scannerRef.current = null;
      }
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(fileHostId);
      const value = await scanner.scanFile(file, false);
      scanner.clear();
      if (value.trim()) {
        onScanRef.current(value.trim());
        onOpenChangeRef.current(false);
      } else {
        setError("مافيش باركود واضح في الصورة.");
      }
    } catch {
      setError("ما قدرناش نقرأ الباركود من الصورة. جرّب صورة أوضح.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] max-w-md overflow-hidden p-0 sm:p-0">
        <div className="p-5 pb-3">
          <DialogHeader>
            <DialogTitle>مسح الباركود</DialogTitle>
            <DialogDescription>
              وجّه كاميرا التليفون على سريال الجهاز، أو ارفع صورة.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="relative mx-5 overflow-hidden rounded-lg bg-fg">
          <div
            id={hostId}
            className="min-h-52 w-full overflow-hidden [&_video]:h-52 [&_video]:w-full [&_video]:object-cover"
          />
          {starting ? (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-primary-fg">
              <LoaderCircle className="size-4 animate-spin" />
              جاري فتح الكاميرا
            </div>
          ) : null}
        </div>
        <div id={fileHostId} className="hidden" />
        {error ? <p className="px-5 text-sm text-danger">{error}</p> : null}
        <div className="flex flex-col gap-2 p-5 pt-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            <ImageIcon />
            التقط / ارفع صورة
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            <X />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
