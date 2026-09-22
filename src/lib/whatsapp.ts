export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function toWhatsAppNumber(phone: string): string | null {
  let d = digitsOnly(phone);
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("20") && d.length >= 11) return d;
  if (d.startsWith("0") && d.length >= 10) return `20${d.slice(1)}`;
  if (d.length === 10 && d.startsWith("1")) return `20${d}`;
  if (d.length >= 10) return d;
  return null;
}

export function formatPhoneDisplay(phone: string): string {
  const d = toWhatsAppNumber(phone);
  if (!d) return phone;
  if (d.startsWith("20") && d.length === 12) {
    return `+20 ${d.slice(2, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  }
  return `+${d}`;
}

export type WaTemplateId = "received" | "ready" | "delivered";

export const WA_TEMPLATES: { id: WaTemplateId; label: string }[] = [
  { id: "received", label: "استلام الجهاز" },
  { id: "ready", label: "جاهز للتسليم" },
  { id: "delivered", label: "تم التسليم" },
];

export function buildWhatsAppMessage(input: {
  template: WaTemplateId;
  customerName: string;
  device: string;
  serial: string;
  ticket: string;
}): string {
  const who = input.customerName.trim() ? ` أستاذ ${input.customerName.trim()}` : "";
  const device = input.device.trim() || "الجهاز";
  const serialLine = input.serial.trim() ? `\nرقم السريال: ${input.serial.trim()}` : "";
  const ticketLine = input.ticket ? `\nرقم الأوردر: ${input.ticket}` : "";

  if (input.template === "received") {
    return `السلام عليكم${who}
تم استلام ${device} في غرفة صيانة سبيد.${serialLine}${ticketLine}
هنبلغ حضرتك أول ما يجهز.

غرفة صيانة سبيد`;
  }
  if (input.template === "delivered") {
    return `السلام عليكم${who}
تم تسليم ${device} بنجاح.${serialLine}${ticketLine}
شكراً لتعاملك معنا.

غرفة صيانة سبيد`;
  }
  return `السلام عليكم${who}
${device} بقى جاهز للتسليم.${serialLine}${ticketLine}
منتظرين حضرتك في غرفة صيانة سبيد.

غرفة صيانة سبيد`;
}

export function whatsappUrl(phone: string, text: string): string | null {
  const num = toWhatsAppNumber(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
