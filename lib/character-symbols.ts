export type CharacterCategory =
  | "currency"
  | "arrows"
  | "math"
  | "symbols"
  | "punctuation"
  | "legal"
  | "latin"
  | "arabic"
  | "stars"
  | "checkmarks";

export interface CharacterEntry {
  char: string;
  category: CharacterCategory;
  tags: string[];
}

export const CHARACTER_ENTRIES: CharacterEntry[] = [
  { char: "$", category: "currency", tags: ["dollar", "usd", "دولار"] },
  { char: "€", category: "currency", tags: ["euro", "يورو"] },
  { char: "£", category: "currency", tags: ["pound", "gbp", "جنيه"] },
  { char: "¥", category: "currency", tags: ["yen", "yuan", "ين"] },
  { char: "₹", category: "currency", tags: ["rupee", "روبية"] },
  { char: "₽", category: "currency", tags: ["ruble", "rouble", "روبل"] },
  { char: "₩", category: "currency", tags: ["won", "وون"] },
  { char: "¢", category: "currency", tags: ["cent", "سنت"] },
  { char: "₿", category: "currency", tags: ["bitcoin", "btc", "بتكوين"] },
  { char: "₪", category: "currency", tags: ["shekel", "شيكل"] },
  { char: "₴", category: "currency", tags: ["hryvnia", "هريفنيا"] },
  { char: "₦", category: "currency", tags: ["naira", "نايرا"] },
  { char: "₫", category: "currency", tags: ["dong", "دونغ"] },
  { char: "₱", category: "currency", tags: ["peso", "بيسo"] },
  { char: "﷼", category: "currency", tags: ["riyal", "rial", "ريال"] },
  { char: "←", category: "arrows", tags: ["left", "arrow", "يسار", "سهم"] },
  { char: "→", category: "arrows", tags: ["right", "arrow", "يمين", "سهم"] },
  { char: "↑", category: "arrows", tags: ["up", "arrow", "فوق", "سهم"] },
  { char: "↓", category: "arrows", tags: ["down", "arrow", "تحت", "سهم"] },
  { char: "↔", category: "arrows", tags: ["horizontal", "both", "سهم"] },
  { char: "↕", category: "arrows", tags: ["vertical", "both", "سهم"] },
  { char: "⇐", category: "arrows", tags: ["double", "left", "سهم"] },
  { char: "⇒", category: "arrows", tags: ["double", "right", "سهم"] },
  { char: "⇑", category: "arrows", tags: ["double", "up", "سهم"] },
  { char: "⇓", category: "arrows", tags: ["double", "down", "سهم"] },
  { char: "⟵", category: "arrows", tags: ["long", "left", "سهم"] },
  { char: "⟶", category: "arrows", tags: ["long", "right", "سهم"] },
  { char: "↩", category: "arrows", tags: ["return", "back", "رجوع"] },
  { char: "↪", category: "arrows", tags: ["forward", "return"] },
  { char: "➔", category: "arrows", tags: ["arrow", "سهم"] },
  { char: "➜", category: "arrows", tags: ["arrow", "سهم"] },
  { char: "➤", category: "arrows", tags: ["arrow", "bullet", "سهم"] },
  { char: "➡", category: "arrows", tags: ["arrow", "right", "سهم"] },
  { char: "⬅", category: "arrows", tags: ["arrow", "left", "سهم"] },
  { char: "⬆", category: "arrows", tags: ["arrow", "up", "سهم"] },
  { char: "⬇", category: "arrows", tags: ["arrow", "down", "سهم"] },
  { char: "±", category: "math", tags: ["plus", "minus", "موجب", "سالب"] },
  { char: "×", category: "math", tags: ["multiply", "times", "ضرب"] },
  { char: "÷", category: "math", tags: ["divide", "division", "قسمة"] },
  { char: "≠", category: "math", tags: ["not equal", "لا يساوي"] },
  { char: "≈", category: "math", tags: ["approx", "تقريب"] },
  { char: "≤", category: "math", tags: ["less equal", "أصغر"] },
  { char: "≥", category: "math", tags: ["greater equal", "أكبر"] },
  { char: "∞", category: "math", tags: ["infinity", "لانهاية"] },
  { char: "∑", category: "math", tags: ["sum", "sigma", "مجموع"] },
  { char: "∏", category: "math", tags: ["product", "pi"] },
  { char: "√", category: "math", tags: ["root", "square", "جذر"] },
  { char: "∫", category: "math", tags: ["integral", "تكامل"] },
  { char: "π", category: "math", tags: ["pi", "باي"] },
  { char: "°", category: "math", tags: ["degree", "درجة"] },
  { char: "‰", category: "math", tags: ["per mille", "في الالف"] },
  { char: "½", category: "math", tags: ["half", "نصف"] },
  { char: "¼", category: "math", tags: ["quarter", "ربع"] },
  { char: "¾", category: "math", tags: ["three quarter"] },
  { char: "∂", category: "math", tags: ["partial", "derivative"] },
  { char: "∆", category: "math", tags: ["delta", "change", "دلتا"] },
  { char: "∇", category: "math", tags: ["nabla", "gradient"] },
  { char: "∴", category: "math", tags: ["therefore", "لذلك"] },
  { char: "∵", category: "math", tags: ["because", "لان"] },
  { char: "♥", category: "symbols", tags: ["heart", "love", "قلب", "حب"] },
  { char: "♦", category: "symbols", tags: ["diamond", "معين"] },
  { char: "♣", category: "symbols", tags: ["club", "clubs"] },
  { char: "♠", category: "symbols", tags: ["spade", "spades"] },
  { char: "☀", category: "symbols", tags: ["sun", "شمس"] },
  { char: "☁", category: "symbols", tags: ["cloud", "سحاب"] },
  { char: "☂", category: "symbols", tags: ["umbrella", "مظلة"] },
  { char: "☎", category: "symbols", tags: ["phone", "telephone", "هاتف"] },
  { char: "☯", category: "symbols", tags: ["yin yang", "tao"] },
  { char: "☮", category: "symbols", tags: ["peace", "سلام"] },
  { char: "☪", category: "symbols", tags: ["islam", "star crescent", "هلال"] },
  { char: "♀", category: "symbols", tags: ["female", "انثى"] },
  { char: "♂", category: "symbols", tags: ["male", "ذكر"] },
  { char: "⚡", category: "symbols", tags: ["lightning", "bolt", "برق"] },
  { char: "⚠", category: "symbols", tags: ["warning", "تحذير"] },
  { char: "⚙", category: "symbols", tags: ["gear", "settings", "اعدادات"] },
  { char: "♻", category: "symbols", tags: ["recycle", "اعادة"] },
  { char: "☢", category: "symbols", tags: ["radioactive", "اشعاع"] },
  { char: "☣", category: "symbols", tags: ["biohazard"] },
  { char: "♿", category: "symbols", tags: ["accessibility", "wheelchair"] },
  { char: "★", category: "stars", tags: ["star", "filled", "نجمة"] },
  { char: "☆", category: "stars", tags: ["star", "outline", "نجمة"] },
  { char: "✦", category: "stars", tags: ["star", "sparkle", "نجمة"] },
  { char: "✧", category: "stars", tags: ["star", "sparkle"] },
  { char: "✪", category: "stars", tags: ["star", "circle"] },
  { char: "✫", category: "stars", tags: ["star"] },
  { char: "✬", category: "stars", tags: ["star"] },
  { char: "✭", category: "stars", tags: ["star"] },
  { char: "✮", category: "stars", tags: ["star"] },
  { char: "✯", category: "stars", tags: ["star"] },
  { char: "❖", category: "stars", tags: ["diamond", "shape"] },
  { char: "◆", category: "stars", tags: ["diamond", "filled"] },
  { char: "◇", category: "stars", tags: ["diamond", "outline"] },
  { char: "●", category: "stars", tags: ["circle", "bullet", "نقطة"] },
  { char: "○", category: "stars", tags: ["circle", "outline"] },
  { char: "◉", category: "stars", tags: ["circle", "bullseye"] },
  { char: "◎", category: "stars", tags: ["circle", "double"] },
  { char: "✓", category: "checkmarks", tags: ["check", "tick", "yes", "صح"] },
  { char: "✔", category: "checkmarks", tags: ["check", "bold", "صح"] },
  { char: "✗", category: "checkmarks", tags: ["cross", "x", "no", "خطأ"] },
  { char: "✘", category: "checkmarks", tags: ["cross", "bold", "خطأ"] },
  { char: "☑", category: "checkmarks", tags: ["checkbox", "checked"] },
  { char: "☐", category: "checkmarks", tags: ["checkbox", "empty"] },
  { char: "☒", category: "checkmarks", tags: ["checkbox", "crossed"] },
  { char: "…", category: "punctuation", tags: ["ellipsis", "dots", "نقاط"] },
  { char: "—", category: "punctuation", tags: ["em dash", "dash", "شرطة"] },
  { char: "–", category: "punctuation", tags: ["en dash", "dash"] },
  { char: "«", category: "punctuation", tags: ["quote", "guillemet", "علامة"] },
  { char: "»", category: "punctuation", tags: ["quote", "guillemet"] },
  { char: "‹", category: "punctuation", tags: ["quote", "single"] },
  { char: "›", category: "punctuation", tags: ["quote", "single"] },
  { char: "‚", category: "punctuation", tags: ["quote", "low"] },
  { char: "„", category: "punctuation", tags: ["quote", "double"] },
  { char: "†", category: "punctuation", tags: ["dagger", "cross"] },
  { char: "‡", category: "punctuation", tags: ["double dagger"] },
  { char: "•", category: "punctuation", tags: ["bullet", "dot", "نقطة"] },
  { char: "※", category: "punctuation", tags: ["reference", "mark"] },
  { char: "§", category: "punctuation", tags: ["section", "paragraph"] },
  { char: "¶", category: "punctuation", tags: ["pilcrow", "paragraph"] },
  { char: "¿", category: "punctuation", tags: ["question", "inverted"] },
  { char: "¡", category: "punctuation", tags: ["exclamation", "inverted"] },
  { char: "©", category: "legal", tags: ["copyright", "حقوق"] },
  { char: "®", category: "legal", tags: ["registered", "trademark"] },
  { char: "™", category: "legal", tags: ["trademark", "tm", "علامة"] },
  { char: "℠", category: "legal", tags: ["service mark"] },
  { char: "℗", category: "legal", tags: ["phonogram"] },
  { char: "№", category: "legal", tags: ["numero", "number", "رقم"] },
  { char: "æ", category: "latin", tags: ["ae", "latin"] },
  { char: "œ", category: "latin", tags: ["oe", "latin"] },
  { char: "ß", category: "latin", tags: ["eszett", "german"] },
  { char: "ð", category: "latin", tags: ["eth", "icelandic"] },
  { char: "þ", category: "latin", tags: ["thorn", "icelandic"] },
  { char: "ø", category: "latin", tags: ["o slash", "nordic"] },
  { char: "å", category: "latin", tags: ["a ring", "nordic"] },
  { char: "ñ", category: "latin", tags: ["n tilde", "spanish"] },
  { char: "ç", category: "latin", tags: ["c cedilla", "french"] },
  { char: "ü", category: "latin", tags: ["u umlaut", "german"] },
  { char: "ä", category: "latin", tags: ["a umlaut"] },
  { char: "ö", category: "latin", tags: ["o umlaut"] },
  { char: "é", category: "latin", tags: ["e acute", "accent"] },
  { char: "è", category: "latin", tags: ["e grave", "accent"] },
  { char: "ê", category: "latin", tags: ["e circumflex"] },
  { char: "à", category: "latin", tags: ["a grave"] },
  { char: "â", category: "latin", tags: ["a circumflex"] },
  { char: "î", category: "latin", tags: ["i circumflex"] },
  { char: "ô", category: "latin", tags: ["o circumflex"] },
  { char: "ù", category: "latin", tags: ["u grave"] },
  { char: "،", category: "arabic", tags: ["comma", "arabic", "فاصلة"] },
  { char: "؛", category: "arabic", tags: ["semicolon", "arabic", "فاصلة"] },
  { char: "؟", category: "arabic", tags: ["question", "arabic", "استفهام"] },
  { char: "٪", category: "arabic", tags: ["percent", "arabic", "نسبة"] },
  { char: "٫", category: "arabic", tags: ["decimal", "arabic"] },
  { char: "٬", category: "arabic", tags: ["thousands", "arabic"] },
  { char: "۞", category: "arabic", tags: ["star", "arabic", "نجمة"] },
  { char: "۩", category: "arabic", tags: ["mihrab", "place", "محل"] },
  { char: "﷽", category: "arabic", tags: ["bismillah", "بسم"] },
  { char: "﴾", category: "arabic", tags: ["parenthesis", "quran", "قوس"] },
  { char: "﴿", category: "arabic", tags: ["parenthesis", "quran", "قوس"] },
];

export function filterCharacters(query: string): CharacterEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return CHARACTER_ENTRIES;
  const terms = q.split(/\s+/).filter(Boolean);
  return CHARACTER_ENTRIES.filter((entry) => {
    const haystack = [entry.char, ...entry.tags].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function groupByCategory(entries: CharacterEntry[]): Partial<Record<CharacterCategory, CharacterEntry[]>> {
  const groups: Partial<Record<CharacterCategory, CharacterEntry[]>> = {};
  for (const entry of entries) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category]!.push(entry);
  }
  return groups;
}
