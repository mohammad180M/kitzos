"use client";

import React, { useCallback, useState } from "react";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

type Unit = "paragraphs" | "sentences" | "words";
type TextLang = "latin" | "arabic";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "eu", "fugiat", "nulla", "pariatur",
];

const CANONICAL_LATIN_OPENING =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

/** Common Arabic placeholder vocabulary (design mockups). */
const ARABIC_WORDS = [
  "هذا", "النص", "مثال", "يمكن", "استبدال", "المساحة", "تم", "توليد", "مولد",
  "العربي", "حيث", "تولّد", "مثل", "العديد", "النصوص", "الأخرى", "إضافة", "زيادة",
  "عدد", "الحروف", "التي", "يولدها", "التطبيق", "تصميم", "موقع", "صفحة", "ويب",
  "تخطيط", "محتوى", "فقرة", "جملة", "كلمة", "عنوان", "مشروع", "عمل", "فريق",
  "شركة", "خدمة", "منتج", "عميل", "سوق", "تجربة", "مستخدم", "واجهة", "بيانات",
  "معلومات", "تطوير", "برمجة", "تقنية", "حلول", "ابتكار", "جودة", "أداء",
  "سرعة", "أمان", "خصوصية", "شامل", "متكامل", "فعّال", "مرن", "بسيط", "واضح",
  "دقيق", "موثوق", "مستقر", "حديث", "مبتكر", "منصة", "أدوات", "مجاني", "سريع",
  "خاص", "متصفح", "ملف", "صورة", "مستند", "نموذج", "مسودة", "عرض", "تجربة",
];

const CANONICAL_ARABIC_OPENING =
  "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربي، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التي يولدها التطبيق.";

function pickWord(lang: TextLang): string {
  const pool = lang === "arabic" ? ARABIC_WORDS : LOREM_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function capitalizeLatin(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateSentence(lang: TextLang): string {
  const len = 5 + Math.floor(Math.random() * 11);
  const words = Array.from({ length: len }, () => pickWord(lang));
  if (lang === "latin") {
    words[0] = capitalizeLatin(words[0]);
  }
  return `${words.join(lang === "arabic" ? " " : " ")}.`;
}

function canonicalOpening(lang: TextLang): string {
  return lang === "arabic" ? CANONICAL_ARABIC_OPENING : CANONICAL_LATIN_OPENING;
}

function generateParagraph(lang: TextLang, includeOpening: boolean): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4);
  const sentences: string[] = [];

  if (includeOpening) {
    sentences.push(canonicalOpening(lang));
    for (let i = 1; i < sentenceCount; i++) {
      sentences.push(generateSentence(lang));
    }
  } else {
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(lang));
    }
  }

  return sentences.join(" ");
}

function generateWords(lang: TextLang, count: number, includeOpening: boolean): string {
  const opening = canonicalOpening(lang);
  if (!includeOpening) {
    return Array.from({ length: count }, () => pickWord(lang)).join(" ");
  }

  const openingWords = opening.replace(/\.$/, "").split(/\s+/);
  if (count <= openingWords.length) {
    return openingWords.slice(0, count).join(" ");
  }

  const extra = Array.from({ length: count - openingWords.length }, () => pickWord(lang));
  return [...openingWords, ...extra].join(" ");
}

export default function LoremIpsumGenerator() {
  const { locale } = useLocale();
  const labels = useCommonLabels();
  const t = useTextToolLabels("loremIpsum");
  const [textLang, setTextLang] = useState<TextLang>(() =>
    locale === "ar" ? "arabic" : "latin"
  );
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithCanonical, setStartWithCanonical] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const unitLabels: Record<Unit, string> = {
    paragraphs: t.unitParagraphs,
    sentences: t.unitSentences,
    words: t.unitWords,
  };

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(count, unit === "words" ? 500 : 50));
    const opening = canonicalOpening(textLang);

    if (unit === "paragraphs") {
      const paragraphs = Array.from({ length: n }, (_, i) =>
        generateParagraph(textLang, startWithCanonical && i === 0)
      );
      setOutput(paragraphs.join("\n\n"));
    } else if (unit === "sentences") {
      const sentences = Array.from({ length: n }, (_, i) => {
        if (startWithCanonical && i === 0) return opening;
        return generateSentence(textLang);
      });
      setOutput(sentences.join(" "));
    } else {
      setOutput(generateWords(textLang, n, startWithCanonical));
    }
  }, [unit, count, startWithCanonical, textLang]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      textLang === "arabic" ? "arabic-placeholder.txt" : "lorem-ipsum.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const maxCount = unit === "words" ? 500 : 50;
  const isRtl = textLang === "arabic";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.textLanguage}
        </p>
        <div className="mt-2 inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(
            [
              ["latin", t.langLatin],
              ["arabic", t.langArabic],
            ] as const
          ).map(([lang, label]) => (
            <button
              key={lang}
              type="button"
              onClick={() => setTextLang(lang)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                textLang === lang
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.generateLabel}
        </p>
        <div className="mt-2 inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                unit === u
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {unitLabels[u]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="lorem-count" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.count(count)}
        </label>
        <input
          id="lorem-count"
          type="range"
          min={1}
          max={maxCount}
          value={Math.min(count, maxCount)}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={startWithCanonical}
          onChange={(e) => setStartWithCanonical(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
        />
        <span>
          {textLang === "arabic" ? t.startCanonicalArabic : t.startCanonicalLatin}
        </span>
      </label>

      <button type="button" onClick={generate} className="btn-primary">
        <RefreshCw className="h-4 w-4" />
        {labels.generate}
      </button>

      {output && (
        <div>
          <label htmlFor="lorem-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.output}
          </label>
          <textarea
            id="lorem-output"
            value={output}
            readOnly
            rows={8}
            dir={isRtl ? "rtl" : "ltr"}
            className={`input-field mt-1 resize-y bg-gray-50 text-sm dark:bg-gray-800/50 ${
              isRtl ? "text-right" : ""
            }`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn-secondary">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {labels.copied}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {labels.copy}
                </>
              )}
            </button>
            <button type="button" onClick={download} className="btn-secondary">
              <Download className="h-4 w-4" />
              {t.downloadTxt}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
