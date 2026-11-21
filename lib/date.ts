// O'zbekcha sana formati. Brauzer/Node'ning uz-UZ "short" oy formati
// ba'zan "M12" kabi noqulay ko'rinadi — shuning uchun oy nomlarini o'zimiz beramiz.
const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Masalan: "25-dek, 08:00"
export function fmtDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
