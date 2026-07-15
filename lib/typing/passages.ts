/** Typing-test passages by locale, length, and optional Arabic tashkeel. */

export type TypingLocale = "en" | "ar";
export type PassageLength = "short" | "long";

export const TYPING_PASSAGES_EN_SHORT: readonly string[] = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a sunny afternoon.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "Privacy matters because people deserve control over how their personal information is used.",
  "A journey of a thousand miles begins with a single step taken with courage and purpose.",
  "Good design is as little design as possible, focused on clarity and usefulness above all.",
  "Practice daily and measure progress; accuracy first, then speed will follow naturally.",
  "Clear writing helps teams move faster because shared ideas leave less room for confusion.",
  "Small habits repeated every day create results that feel sudden only to those who were not watching.",
  "Listen carefully before you reply; understanding saves time that arguments usually waste.",
  "Simple tools win when they solve one problem well and stay out of the user's way.",
  "Curiosity turns routine work into discovery and keeps learning alive for years.",
  "Finish one clear task before starting another; focus compounds faster than haste.",
];

export const TYPING_PASSAGES_EN_LONG: readonly string[] = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a sunny afternoon while children play nearby and soft clouds drift across a wide blue sky filled with light. In moments like these, patience and attention feel easy to practice because the world itself seems calm enough to invite careful work.",
  "Programming is the art of telling another human what one wants the computer to do, then refining that message until the machine can follow it without confusion. Good code reads like careful instruction: honest about tradeoffs, respectful of time, and ready to change when the problem becomes clearer than the first draft.",
  "Privacy matters because people deserve control over how their personal information is used, stored, and shared across tools that make daily life convenient. Every product that asks for data also takes on a responsibility to collect less, explain more, and keep doors closed against misuse even when nobody is watching closely.",
  "A journey of a thousand miles begins with a single step taken with courage and purpose, yet progress continues only when those steps are repeated through ordinary days. Momentum is built less by perfect plans than by showing up again after small setbacks and choosing one useful action you can complete right now.",
  "Good design is as little design as possible, focused on clarity and usefulness above decoration, fashion, or clever novelty that ages poorly. When an interface feels quiet and obvious, it is rarely accident: someone removed friction until meaning could travel from screen to mind without asking for unpaid attention.",
  "Practice daily and measure progress; accuracy first, then speed will follow naturally as your hands learn trustworthy patterns. Typing skill grows the same way music does: slow repetition builds muscle memory, honest review reveals weak spots, and calm confidence arrives after enough patient sessions to make mistakes less frightening.",
  "Clear writing helps teams move faster because shared ideas leave less room for confusion, rework, and polite silence that hides real disagreement. When words are precise, meetings shrink, decisions stick, and people spend energy building rather than decoding vague paragraphs that could mean anything depending on who reads them.",
  "Technology should serve people first: reduce effort, respect attention, and refuse to turn every quiet moment into another demand for engagement. The best tools feel almost invisible while you work, then get out of the way completely when the job is done and your mind wants space for thinking that is not optimized by anybody else.",
  "Learning any craft takes seasons rather than weekends, especially when mastery includes judgment you cannot download or copy from a checklist. Watch experts patiently, imitate with humility, test your understanding in public, and keep notes on what failed so future practice can target the exact muscle that still needs strength.",
  "On a long afternoon of focused work, the hardest skill is often returning after interruption without anger or wasted remorse. Prepare a simple next step, leave a breadcrumb for yourself, and treat restart as part of the process instead of proof that you lack discipline or talent when life inevitably arrives mid-sentence.",
];

/** Short Arabic samples (vocalized). */
export const TYPING_PASSAGES_AR_SHORT: readonly string[] = [
  "النَّجَاحُ يَبْدَأُ بِخُطْوَةٍ صَغِيرَةٍ كُلَّ يَوْمٍ، وَبِالتَّكْرَارِ تَتَحَوَّلُ الْمُحَاوَلَةُ إِلَى عَادَةٍ ثُمَّ إِلَى إِنْجَازٍ مَلْمُوسٍ.",
  "الْخُصُوصِيَّةُ حَقٌّ أَسَاسِيٌّ؛ يَجِبُ أَنْ تَتَحَكَّمَ بِمَعْلُومَاتِكَ وَأَنْ تَعْرِفَ كَيْفَ تُسْتَخْدَمُ وَأَيْنَ تُحْفَظُ.",
  "الْكِتَابَةُ مَهَارَةٌ تَتَحَسَّنُ بِالْمُمَارَسَةِ، وَالدِّقَّةُ أَهَمُّ مِنَ السُّرْعَةِ فِي الْبِدَايَةِ ثُمَّ تَأْتِي السُّرْعَةُ لَاحِقًا.",
  "التَّعَلُّمُ رِحْلَةٌ مُسْتَمِرَّةٌ تَتَطَلَّبُ صَبْرًا وَفُضُولًا وَرَغْبَةً صَادِقَةً فِي تَطْوِيرِ النَّفْسِ عَلَى الْمَدَى الطَّوِيلِ.",
  "التَّصْمِيمُ الْجَيِّدُ يُزِيلُ التَّعْقِيدَ وَيُعْطِي الْمُسْتَخْدِمَ تَجْرِبَةً أَوْضَحَ وَأَسْهَلَ دُونَ تَشْتِيتٍ غَيْرِ ضَرُورِيٍّ.",
  "الْبَرْمَجَةُ فَنُّ التَّوَاصُلِ مَعَ الْآلَةِ عَبْرَ مَنْطِقٍ وَاضِحٍ يُحَوِّلُ الْأَفْكَارَ إِلَى أَدَوَاتٍ مُفِيدَةٍ لِلنَّاسِ.",
  "اقْرَأْ بِتَمَعُّنٍ وَاكْتُبْ بِوُضُوحٍ؛ فَالْكَلِمَاتُ الدَّقِيقَةُ تَخْتَصِرُ الْوَقْتَ وَتُقَلِّلُ سُوءَ الْفَهْمِ بَيْنَ الْجَمِيعِ.",
  "الصَّبْرُ فِي الْعَمَلِ لَيْسَ بُطْئًا، بَلْ ثَبَاتًا يَمْنَعُكَ مِنْ تَرْكِ الطَّرِيقِ عِنْدَ أَوَّلِ عَثْرَةٍ.",
  "الرُّوتِينُ الْبَسِيطُ كُلَّ صَبَاحٍ يَصْنَعُ فَارِقًا كَبِيرًا حِينَ تَتَرَاكَمُ الْأَيَّامُ بِهُدُوءٍ.",
  "اسْتَمِعْ جَيِّدًا قَبْلَ أَنْ تُجِيبَ؛ فَالْفَهْمُ يَخْتَصِرُ جِدَالًا طَوِيلًا لَا يُفِيدُ أَحَدًا.",
  "الْأَدَاةُ النَّافِعَةُ تَحِلُّ مُشْكِلَةً وَاحِدَةً بِإِتْقَانٍ وَتَبْتَعِدُ عَنْ تَعْقِيدٍ لَا يُضِيفُ قِيمَةً.",
  "أَكْمِلْ مَهَمَّةً وَاضِحَةً قَبْلَ الِانْتِقَالِ إِلَى غَيْرِهَا؛ فَالتَّرْكِيزُ أَقْوَى مِنَ الْعَجَلَةِ.",
];

/** Long Arabic samples (vocalized). */
export const TYPING_PASSAGES_AR_LONG: readonly string[] = [
  "النَّجَاحُ يَبْدَأُ بِخُطْوَةٍ صَغِيرَةٍ كُلَّ يَوْمٍ، وَبِالتَّكْرَارِ تَتَحَوَّلُ الْمُحَاوَلَةُ إِلَى عَادَةٍ ثُمَّ إِلَى إِنْجَازٍ مَلْمُوسٍ يَرَاهُ الْآخَرُونَ. لَا تَنْتَظِرْ لَحْظَةً مِثَالِيَّةً كَيْ تَبْدَأَ، فَالتَّقَدُّمُ يُبْنَى مِنْ عَمَلٍ مُتَوَاصِلٍ فِي الْأَيَّامِ الْعَادِيَّةِ حِينَ لَا يَكُونُ الْحَمَاسُ فِي أَعْلَى دَرَجَاتِهِ، وَتَبْقَى الْمُثَابَرَةُ هِيَ الْفَارِقَ الْحَقِيقِيَّ بَيْنَ النِّيَّةِ وَالنَّتِيجَةِ.",
  "الْخُصُوصِيَّةُ حَقٌّ أَسَاسِيٌّ؛ يَجِبُ أَنْ تَتَحَكَّمَ بِمَعْلُومَاتِكَ وَأَنْ تَعْرِفَ كَيْفَ تُسْتَخْدَمُ وَأَيْنَ تُحْفَظُ وَمَنْ يَصِلُ إِلَيْهَا. كُلُّ أَدَاةٍ تَطْلُبُ بَيَانَاتِكَ تَتَحَمَّلُ مَسْؤُولِيَّةَ جَمْعِ الْأَقَلِّ وَشَرْحِ الْأَكْثَرِ وَحِمَايَةِ مَا لَا يَلْزَمُ مُشَارَكَتُهُ، حَتَّى حِينَ لَا يُرَاقِبُ أَحَدٌ الطَّرِيقَةَ الَّتِي تُعَامَلُ بِهَا تِلْكَ الْمَعْلُومَاتُ فِي الْخَفَاءِ.",
  "الْكِتَابَةُ مَهَارَةٌ تَتَحَسَّنُ بِالْمُمَارَسَةِ، وَالدِّقَّةُ أَهَمُّ مِنَ السُّرْعَةِ فِي الْبِدَايَةِ ثُمَّ تَأْتِي السُّرْعَةُ لَاحِقًا حِينَ تَأْلَفُ الْيَدَانِ الْمَسَارَ الصَّحِيحَ. كَمَا فِي الْمُوسِيقَى، يَبْنِي التَّكْرَارُ الْبَطِيءُ ذَاكِرَةً عَضَلِيَّةً مَوْثُوقَةً، وَالْمُرَاجَعَةُ الصَّادِقَةُ تَكْشِفُ نِقَاطَ الضَّعْفِ، وَالثِّقَةُ الْهَادِئَةُ تَأْتِي بَعْدَ جَلَسَاتٍ كَافِيَةٍ تَجْعَلُ الْخَطَأَ أَقَلَّ إِخَافَةً مِنْ قَبْلُ.",
  "التَّعَلُّمُ رِحْلَةٌ مُسْتَمِرَّةٌ تَتَطَلَّبُ صَبْرًا وَفُضُولًا وَرَغْبَةً صَادِقَةً فِي تَطْوِيرِ النَّفْسِ عَلَى الْمَدَى الطَّوِيلِ لَا فِي عُطْلَةِ نِهَايَةِ أُسْبُوعٍ فَقَطْ. رَاقِبِ الْمُتْقِنِينَ بِتَوَاضُعٍ، وَقَلِّدْ بِفَهْمٍ، وَاخْتَبِرْ مَعْرِفَتَكَ فِي الْعَمَلِ الْحَقِيقِيِّ، وَسَجِّلْ مَا فَشِلَ حَتَّى يُصْبِحَ تَدْرِيبُكَ الْقَادِمُ مُوَجَّهًا نَحْوَ النُّقْطَةِ الَّتِي مَا زَالَتْ تَحْتَاجُ قُوَّةً.",
  "التَّصْمِيمُ الْجَيِّدُ يُزِيلُ التَّعْقِيدَ وَيُعْطِي الْمُسْتَخْدِمَ تَجْرِبَةً أَوْضَحَ وَأَسْهَلَ دُونَ تَشْتِيتٍ غَيْرِ ضَرُورِيٍّ أَوْ زِينَةٍ تَشِيخُ بِسُرْعَةٍ. حِينَ يَبْدُو التَّطْبِيقُ هَادِئًا وَوَاضِحًا، فَغَالِبًا مَا كَانَ ذَلِكَ بِقَصْدٍ: أَزَالَ شَخْصٌ مَا الِاحْتِكَاكَ حَتَّى يَصِلَ الْمَعْنَى مِنَ الشَّاشَةِ إِلَى الذِّهْنِ دُونَ أَنْ يَطْلُبَ انْتِبَاهًا إِضَافِيًّا لَا مُبَرِّرَ لَهُ.",
  "الْبَرْمَجَةُ فَنُّ التَّوَاصُلِ مَعَ الْآلَةِ عَبْرَ مَنْطِقٍ وَاضِحٍ يُحَوِّلُ الْأَفْكَارَ إِلَى أَدَوَاتٍ مُفِيدَةٍ لِلنَّاسِ. الْبَرْنَامَجُ الْجَيِّدُ يُقْرَأُ كَتَعْلِيمَاتٍ دَقِيقَةٍ: صَرِيحٌ بِشَأْنِ الْمُفَاضَلَاتِ، مُحْتَرِمٌ لِلْوَقْتِ، وَقَابِلٌ لِلتَّغْيِيرِ عِنْدَمَا يَتَّضِحُ الْمَقْصُودُ أَكْثَرَ مِمَّا كَانَ عَلَيْهِ فِي الْمُسَوَّدَةِ الْأُولَى.",
  "اقْرَأْ بِتَمَعُّنٍ وَاكْتُبْ بِوُضُوحٍ؛ فَالْكَلِمَاتُ الدَّقِيقَةُ تَخْتَصِرُ الْوَقْتَ وَتُقَلِّلُ سُوءَ الْفَهْمِ بَيْنَ الْجَمِيعِ فِي الْفَرِيقِ وَخَارِجَهُ. حِينَ تَكُونُ الْجُمَلُ مَضْبُوطَةً تَقِلُّ الِاجْتِمَاعَاتُ، وَتَثْبُتُ الْقَرَارَاتُ، وَيُنْفَقُ الْجُهْدُ فِي الْبِنَاءِ بَدَلَ تَفْسِيرِ فَقَرَاتٍ غَامِضَةٍ يُمْكِنُ أَنْ تَعْنِيَ أَيَّ شَيْءٍ حَسَبَ مَنْ يَقْرَؤُهَا.",
  "فِي يَوْمِ عَمَلٍ طَوِيلٍ، أَصْعَبُ مَهَارَةٍ غَالِبًا هِيَ الْعَوْدَةُ بَعْدَ الْمُقَاطَعَةِ دُونَ غَضَبٍ أَوْ لَوْمٍ ضَائِعٍ عَلَى النَّفْسِ. حَضِّرْ خُطْوَةً تَالِيَةً بَسِيطَةً، وَاتْرُكْ لِنَفْسِكَ عَلَامَةً تَدُلُّكَ، وَاعْتَبِرِ الْبَدْءَ مِنْ جَدِيدٍ جُزْءًا مِنَ الْعَمَلِ لَا دَلِيلًا عَلَى ضَعْفِ الِانْضِبَاطِ حِينَ يَدْخُلُ الْحَيَاةُ فِي مُنْتَصَفِ الْجُمْلَةِ.",
  "التِّقْنِيَةُ يَنْبَغِي أَنْ تَخْدُمَ النَّاسَ أَوَّلًا: تُخَفِّفَ الْجُهْدَ، وَتَحْتَرِمَ الِانْتِبَاهَ، وَتَرْفُضَ تَحْوِيلَ كُلِّ لَحْظَةٍ هَادِئَةٍ إِلَى طَلَبٍ جَدِيدٍ لِلتَّفَاعُلِ. أَفْضَلُ الْأَدَوَاتِ تَكَادُ تَخْتَفِي أَثْنَاءَ الْعَمَلِ، ثُمَّ تَنْسَحِبُ تَمَامًا عِنْدَ انْتِهَاءِ الْمَهَمَّةِ لِتَتْرُكَ لِلذِّهْنِ مَسَاحَةً لِتَفْكِيرٍ لَا يُوَجِّهُهُ أَحَدٌ مِنَ الْخَارِجِ.",
  "الرِّعَايَةُ الذَّاتِيَّةُ لَيْسَتْ تَرَفًا؛ هِيَ صِيَانَةٌ ضَرُورِيَّةٌ لِلْقُدْرَةِ عَلَى الِاسْتِمْرَارِ دُونَ احْتِرَاقٍ بَعْدَ أَسَابِيعَ مِنَ الْجُهْدِ. نَمْ كِفَايَةً، وَتَحَرَّكْ قَلِيلًا، وَافْصِلْ عَنِ الشَّاشَةِ فِي وَقْتٍ مَعْلُومٍ، ثُمَّ عُدْ إِلَى عَمَلِكَ بِذِهْنٍ أَصْفَى؛ فَالْإِنْتَاجِيَّةُ تَفْقِدُ مَعْنَاهَا إِذَا دَفَعْتَ ثَمَنَهَا بِصِحَّتِكَ وَعَلَاقَاتِكَ.",
];

export function stripTashkeel(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, "");
}

export function hasTashkeel(text: string): boolean {
  return /[\u064B-\u065F\u0670]/.test(text);
}

export function getTypingPassages(
  locale: TypingLocale,
  options: { withTashkeel?: boolean; length?: PassageLength } = {}
): readonly string[] {
  const length = options.length ?? "short";
  const withTashkeel = options.withTashkeel ?? false;

  if (locale === "en") {
    return length === "long" ? TYPING_PASSAGES_EN_LONG : TYPING_PASSAGES_EN_SHORT;
  }

  const source = length === "long" ? TYPING_PASSAGES_AR_LONG : TYPING_PASSAGES_AR_SHORT;
  return withTashkeel ? source : source.map(stripTashkeel);
}

export function defaultTypingPassage(
  locale: TypingLocale,
  options: { withTashkeel?: boolean; length?: PassageLength } = {}
): string {
  return getTypingPassages(locale, options)[0] ?? "";
}

export function pickTypingPassage(
  locale: TypingLocale,
  options: {
    withTashkeel?: boolean;
    length?: PassageLength;
    exclude?: string;
  } = {}
): string {
  const list = getTypingPassages(locale, options);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0]!;

  let next = list[Math.floor(Math.random() * list.length)]!;
  if (options.exclude && list.length > 1) {
    let guard = 0;
    while (next === options.exclude && guard < 8) {
      next = list[Math.floor(Math.random() * list.length)]!;
      guard += 1;
    }
  }
  return next;
}

/** @deprecated Prefer getTypingPassages with length. */
export const TYPING_PASSAGES_EN = TYPING_PASSAGES_EN_SHORT;
/** @deprecated Prefer getTypingPassages with length. */
export const TYPING_PASSAGES_AR_VOCALIZED = TYPING_PASSAGES_AR_SHORT;
/** @deprecated Prefer getTypingPassages. */
export const TYPING_PASSAGES: Record<TypingLocale, readonly string[]> = {
  en: TYPING_PASSAGES_EN_SHORT,
  ar: TYPING_PASSAGES_AR_SHORT.map(stripTashkeel),
};
