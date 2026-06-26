import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type { ProductivitySchedule, TimeWindow } from "./types";

// ── Time window factory ───────────────────────────────────────────────────────

function tw(startHour: number, endHour: number, labelEn: string, labelAr: string): TimeWindow {
  return { startHour, endHour, labelEn, labelAr };
}

function hourLabel(h: number): string {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function twFmt(startHour: number, endHour: number, labelEn: string, labelAr: string): TimeWindow {
  return tw(startHour, endHour,
    `${hourLabel(startHour)}–${hourLabel(endHour)} · ${labelEn}`,
    `${hourLabel(startHour)}–${hourLabel(endHour)} · ${labelAr}`,
  );
}

// ── Phase schedules ───────────────────────────────────────────────────────────

const SCHEDULES: Record<CyclePhaseKey, ProductivitySchedule> = {
  menstrual: {
    deepWork:   twFmt(10, 12, "Intuitive thinking",    "التفكير الحدسي"),
    meetings:   twFmt(11, 13, "Minimise if possible",  "تقليص إن أمكن"),
    creative:   twFmt(9,  11, "Journaling & reflection","التدوين والتأمل"),
    learning:   twFmt(10, 12, "Light reading",          "القراءة الخفيفة"),
    workout:    twFmt(9,  11, "Gentle yoga or walk",   "يوغا لطيفة أو مشي"),
    meditation: twFmt(7,   8, "Grounding meditation",  "تأمل تأسيسي"),
    rest:       twFmt(13, 15, "Protect this window",   "احمي هذه النافذة"),
    reading:    twFmt(20, 22, "Calm, low-light reading","قراءة هادئة بإضاءة خافتة"),
    social:     twFmt(15, 17, "One-on-one only",       "فردي فقط"),
    shopping:   twFmt(11, 13, "Only essentials",       "الضروريات فقط"),
    familyTime: twFmt(17, 20, "Quiet home time",       "وقت هادئ في المنزل"),
  },

  power: {
    deepWork:   twFmt(9,  12, "Peak analytical window", "نافذة التحليل الأقصى"),
    meetings:   twFmt(13, 16, "High energy for consensus","طاقة عالية للتوافق"),
    creative:   twFmt(15, 18, "Brainstorming & ideation","عصف ذهني وابتكار"),
    learning:   twFmt(9,  12, "New skills absorb well", "المهارات الجديدة تُمتص جيداً"),
    workout:    twFmt(7,   9, "Strength training window","نافذة تدريب القوة"),
    meditation: twFmt(7,   8, "Energising morning practice","ممارسة صباحية منشطة"),
    rest:       twFmt(21, 23, "Wind down",              "الاسترخاء"),
    reading:    twFmt(20, 22, "Learning content",        "محتوى تعليمي"),
    social:     twFmt(16, 20, "Group events welcome",   "الفعاليات الجماعية مرحب بها"),
    shopping:   twFmt(14, 16, "Good decision energy",   "طاقة قرارات جيدة"),
    familyTime: twFmt(18, 21, "Active engagement",      "تفاعل نشط"),
  },

  manifestation: {
    deepWork:   twFmt(8,  12, "Absolute peak performance","الأداء الأقصى المطلق"),
    meetings:   twFmt(10, 14, "Maximum social intelligence","ذكاء اجتماعي أقصى"),
    creative:   twFmt(14, 18, "Creative flow state",    "حالة التدفق الإبداعي"),
    learning:   twFmt(8,  12, "Best memory encoding",   "أفضل ترميز للذاكرة"),
    workout:    twFmt(7,   9, "PR window — go hard",    "نافذة الرقم القياسي — اجتهدي"),
    meditation: twFmt(6,   7, "Brief — you don't need long","قصيرة — لا تحتاجين طولاً"),
    rest:       twFmt(22, 24, "Slightly shorter sleep ok","نوم أقصر قليلاً مقبول"),
    reading:    twFmt(20, 22, "Complex content absorbs best","المحتوى المعقد يُمتص أفضل"),
    social:     twFmt(12, 22, "Full day social energy",  "طاقة اجتماعية يوم كامل"),
    shopping:   twFmt(10, 14, "Best negotiation window", "أفضل نافذة تفاوض"),
    familyTime: twFmt(16, 21, "Deep connection energy",  "طاقة تواصل عميق"),
  },

  secondPower: {
    deepWork:   twFmt(8,  11, "Precision analytical work","عمل تحليلي دقيق"),
    meetings:   twFmt(9,  11, "Focused, task-oriented",  "مركّز وموجّه للمهام"),
    creative:   twFmt(14, 17, "Detail-driven creativity","إبداع موجّه للتفاصيل"),
    learning:   twFmt(9,  11, "Technical deep dives",    "تعمق تقني"),
    workout:    twFmt(6,   8, "Moderate session",        "جلسة معتدلة"),
    meditation: twFmt(7,   8, "GABA-activating breath",  "تنفس منشّط GABA"),
    rest:       twFmt(15, 16, "Short afternoon rest",    "راحة بعد ظهر قصيرة"),
    reading:    twFmt(20, 21, "Technical or analytical", "تقني أو تحليلي"),
    social:     twFmt(11, 13, "Small groups work well",  "المجموعات الصغيرة تعمل جيداً"),
    shopping:   twFmt(12, 14, "Focused errands only",    "مهام محددة فقط"),
    familyTime: twFmt(17, 20, "Calm quality time",       "وقت جيد هادئ"),
  },

  reset: {
    deepWork:   twFmt(10, 12, "Introspective deep work", "عمل عميق استبطاني"),
    meetings:   twFmt(11, 13, "Short and structured only","قصيرة ومنظمة فقط"),
    creative:   twFmt(9,  11, "Journaling & vision",     "التدوين والرؤية"),
    learning:   twFmt(10, 12, "Review and consolidate",  "مراجعة وتوطيد"),
    workout:    twFmt(9,  11, "Walk or Pilates",          "مشي أو بيلاتس"),
    meditation: twFmt(7,   8, "Grounding body scan",     "فحص جسمي تأسيسي"),
    rest:       twFmt(14, 16, "Non-negotiable rest",      "راحة غير قابلة للتفاوض"),
    reading:    twFmt(20, 22, "Emotional or spiritual",   "عاطفي أو روحي"),
    social:     twFmt(15, 17, "Trusted circle only",     "الدائرة الموثوقة فقط"),
    shopping:   twFmt(13, 15, "Avoid impulse triggers",  "تجنبي محفزات الشراء العشوائي"),
    familyTime: twFmt(18, 21, "Nurturing and gentle",    "حنون ولطيف"),
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export function generateProductivitySchedule(phaseKey: CyclePhaseKey): ProductivitySchedule {
  return SCHEDULES[phaseKey];
}
