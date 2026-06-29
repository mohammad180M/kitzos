export const audioToolsEn = {
  shared: {
    unsupportedFile: "Unsupported file. Use MP3, WAV, M4A, OGG, or WebM.",
    decodeFailed: "Could not decode this audio file. Try MP3, WAV, M4A, or WebM.",
    outputFormat: "Output format",
    exportFormat: "Export format",
    startSec: "Start (sec)",
    endSec: "End (sec)",
    startTimeAria: "Start time",
    endTimeAria: "End time",
    remove: "Remove",
    totalLabel: "total",
  },
  mp3Cutter: {
    uploadHint: "Upload an audio file to cut",
    errInvalidRange: "Select a valid start and end time.",
    errExportFailed: "Export failed. Try WAV format instead.",
  },
  audioConverter: {
    convertTo: "Convert to",
    uploadHint: "Upload audio (WAV, MP3, M4A, OGG…)",
    lastConverted: (name: string) => `Last converted: ${name}`,
    errConvertFailed: "Conversion failed. Try another file or WAV output.",
    privacyNote:
      "Decodes in your browser via Web Audio API. MP3 encoding uses lamejs locally — nothing is uploaded.",
  },
  audioMerger: {
    addFiles: "Add audio files",
    errNeedAudio: "Please select audio files (MP3, WAV, M4A, OGG, WebM…).",
    errNeedTwo: "Add at least two audio files to merge.",
    errMergeFailed: "Merge failed. Try WAV output or fewer files.",
    mergeDownload: "Merge & download",
  },
  voiceRecorder: {
    startRecording: "Start recording",
    stop: "Stop",
    errMicDenied: "Microphone access denied or unavailable.",
    errExportFailed: (format: string) => `Could not export as ${format}. Try WebM instead.`,
    privacyNote:
      "Recording stays on your device. Export as WebM, MP3, or WAV — nothing is uploaded.",
  },
} as const;

export const audioToolsAr = {
  shared: {
    unsupportedFile: "ملف غير مدعوم. استخدم MP3 أو WAV أو M4A أو OGG أو WebM.",
    decodeFailed: "تعذّر فك ترميز هذا الملف. جرّب MP3 أو WAV أو M4A أو WebM.",
    outputFormat: "تنسيق المخرجات",
    exportFormat: "تنسيق التصدير",
    startSec: "البداية (ث)",
    endSec: "النهاية (ث)",
    startTimeAria: "وقت البداية",
    endTimeAria: "وقت النهاية",
    remove: "إزالة",
    totalLabel: "إجمالي",
  },
  mp3Cutter: {
    uploadHint: "ارفع ملف صوتي للقص",
    errInvalidRange: "حدّد وقت بداية ونهاية صالحين.",
    errExportFailed: "فشل التصدير. جرّب تنسيق WAV.",
  },
  audioConverter: {
    convertTo: "التحويل إلى",
    uploadHint: "ارفع صوتاً (WAV، MP3، M4A، OGG…)",
    lastConverted: (name: string) => `آخر تحويل: ${name}`,
    errConvertFailed: "فشل التحويل. جرّب ملفاً آخر أو مخرجات WAV.",
    privacyNote:
      "يُفك الترميز في متصفحك عبر Web Audio API. ترميز MP3 يستخدم lamejs محلياً — لا يُرفع شيء.",
  },
  audioMerger: {
    addFiles: "إضافة ملفات صوتية",
    errNeedAudio: "يرجى اختيار ملفات صوتية (MP3، WAV، M4A، OGG، WebM…).",
    errNeedTwo: "أضف ملفين صوتيين على الأقل للدمج.",
    errMergeFailed: "فشل الدمج. جرّب مخرجات WAV أو ملفات أقل.",
    mergeDownload: "دمج وتنزيل",
  },
  voiceRecorder: {
    startRecording: "بدء التسجيل",
    stop: "إيقاف",
    errMicDenied: "تم رفض الوصول للميكروفون أو أنه غير متاح.",
    errExportFailed: (format: string) => `تعذّر التصدير كـ ${format}. جرّب WebM.`,
    privacyNote:
      "يبقى التسجيل على جهازك. صدّر كـ WebM أو MP3 أو WAV — لا يُرفع شيء.",
  },
} as const;

export type AudioToolKey = keyof Omit<typeof audioToolsEn, "shared">;
