# FAQ Audit Report (Phase 1 — read-only)

Generated: 2026-07-13
Tools audited: 103

Source: `getToolContent(slug, locale)` → EN `content/*.ts` + `content/extra-tools.ts`; AR `locales/content.ar.json` + `locales/extra-content.ar.json`.

### Methodology (heuristic — review before Phase 2)

- **TECH-JARGON:** regex for library/API names (`pdf-lib`, `pdf.js`, `canvas`, `wasm`, `MediaRecorder`, …) in Q or A.
- **AR-QUALITY:** Latin leftovers in AR answers, mixed EN words, collapsed length vs EN, broken `?`/`؟` mixes. Soft signal — not a native-speaker review.
- **EN-AR-MISMATCH:** FAQ count drift, differing numerals, limit/upload polarity conflicts.
- **WRONG-CLAIM:** FAQ “no limit” vs real processing caps in `tools/**` (preview-only caps ignored); strong encryption bravado; format claims missing from source.
- **DUPLICATE:** cross-tool near-identical privacy/password fillers (exemplar partners capped); or high question+answer similarity after stripping tool-name tokens.
- **PRIVACY-REDUNDANT:** >1 privacy/safety FAQ on the same tool, or verbatim PrivacyBadge phrasing.
- **ARTICLE-OVERLAP (PDF×10 only):** tool FAQ vs article “Common questions / أسئلة شائعة” — wording similarity or matching primary topic (privacy/limit/quality/password/…).

Flags: `TECH-JARGON` · `AR-QUALITY` · `EN-AR-MISMATCH` · `WRONG-CLAIM` · `DUPLICATE` · `PRIVACY-REDUNDANT` · `ARTICLE-OVERLAP`

---

## merge-pdf

### Q1

**EN Q:** Does my data leave my device?

**EN A:** No. The PDFs you combine stay on your device and are merged inside the browser — nothing is uploaded to any server.

**AR Q:** هل تغادر بياناتي جهازي؟

**AR A:** لا. ملفات PDF التي تدمجها تبقى على جهازك وتُدمَج داخل المتصفح — لا يُرفع شيء إلى أي خادم.

### Q2

**EN Q:** How many PDFs can I combine in one go?

**EN A:** There is no fixed cap. Very large files or dozens of documents may slow your browser depending on available memory.

**AR Q:** كم ملف PDF يمكنني دمجه دفعة واحدة؟

**AR A:** لا يوجد سقف ثابت. الملفات الضخمة جداً أو العشرات من المستندات قد تبطئ متصفحك حسب الذاكرة المتاحة.

### Q3

**EN Q:** Do images and text look the same after merging?

**EN A:** Yes. Pages are copied as-is into the new file without re-compressing images, so quality matches your sources.

**AR Q:** هل تبدو الصور والنصوص كما هي بعد الدمج؟

**AR A:** نعم. تُنسخ الصفحات كما هي إلى الملف الجديد دون إعادة ضغط الصور، فتطابق الجودة مصادرك.

### Q4

**EN Q:** Can I merge password-protected PDFs?

**EN A:** Unlock them first. This tool cannot open encrypted PDFs.

**AR Q:** هل يمكنني دمج ملفات PDF محمية بكلمة مرور؟

**AR A:** ألغِ الحماية أولاً. هذه الأداة لا تستطيع فتح ملفات PDF المشفّرة.

**FLAGS:** DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE privacy filler EN Q1 ≈ split-pdf Q1
- DUPLICATE privacy filler EN Q1 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q1 ≈ organize-pdf Q3
- DUPLICATE password filler EN Q4 ≈ split-pdf Q3
- DUPLICATE password filler EN Q4 ≈ rotate-pdf Q4
- DUPLICATE password filler EN Q4 ≈ pdf-protect Q4
- EN Q1 topic-overlaps article (“Do my files ever leave my computer?”) on [privacy]
- EN Q2 topic-overlaps article (“Is there a file size or count limit?”) on [limit]
- EN Q3 topic-overlaps article (“Does merging reduce quality?”) on [quality]
- AR Q1 topic-overlaps article (“هل تغادر ملفاتي جهازي؟”) on [privacy]
- AR Q2 topic-overlaps article (“هل هناك حد لحجم أو عدد الملفات؟”) on [limit]
- AR Q3 topic-overlaps article (“هل يقلل الدمج من الجودة؟”) on [quality]

---

## split-pdf

### Q1

**EN Q:** Is my file uploaded?

**EN A:** No. Your PDF is split on your own device inside the browser — the document never goes to a server.

**AR Q:** هل يُرفع ملفي؟

**AR A:** لا. يُقسَّم ملف PDF على جهازك داخل المتصفح — المستند لا يذهب إلى أي خادم.

### Q2

**EN Q:** How do page ranges work?

**EN A:** Use commas to separate groups. For example, 1-3, 5 creates two PDFs: pages 1–3 and page 5 alone.

**AR Q:** كيف تعمل نطاقات الصفحات؟

**AR A:** استخدم الفواصل لفصل المجموعات. مثلاً، 1-3، 5 ينشئ ملفي PDF: الصفحات 1–3 والصفحة 5 وحدها.

### Q3

**EN Q:** What if my PDF is password-protected?

**EN A:** Unlock it first. Encrypted files cannot be split here.

**AR Q:** ماذا لو كان ملفي محمياً بكلمة مرور؟

**AR A:** ألغِ القفل أولاً. لا يمكن تقسيم الملفات المشفّرة هنا.

### Q4

**EN Q:** What happens when I split into individual pages?

**EN A:** Each page is saved as a separate PDF inside a ZIP archive named after your original file.

**AR Q:** ماذا يحدث عند التقسيم إلى صفحات فردية؟

**AR A:** تُحفَظ كل صفحة كملف PDF منفصل داخل أرشيف ZIP يحمل اسم ملفك الأصلي.

**FLAGS:** DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE privacy filler EN Q1 ≈ merge-pdf Q1
- DUPLICATE password filler EN Q3 ≈ merge-pdf Q4
- DUPLICATE privacy filler EN Q1 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q1 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ extract-pages Q3
- DUPLICATE password filler EN Q3 ≈ rotate-pdf Q4
- DUPLICATE password filler EN Q3 ≈ pdf-protect Q4
- EN Q3 topic-overlaps article (“Can I split password-protected PDFs?”) on [password]
- AR Q3 topic-overlaps article (“هل يمكن تقسيم ملف محمي بكلمة مرور؟”) on [password]

---

## pdf-to-jpg

### Q1

**EN Q:** What image quality are the JPGs?

**EN A:** PDF pages are rendered at 2× scale with 92% JPEG quality, producing sharp images suitable for sharing or printing.

**AR Q:** ما جودة صور JPG الناتجة؟

**AR A:** تُعرَض صفحات PDF بمقياس 2× بجودة JPEG 92%، ما ينتج صوراً حادة مناسبة للمشاركة أو الطباعة.

### Q2

**EN Q:** Which image formats can I turn into a PDF?

**EN A:** JPG, PNG, and WebP are supported. WebP images are converted locally before embedding in the PDF.

**AR Q:** ما صيغ الصور التي يمكن تحويلها إلى PDF؟

**AR A:** يدعم JPG وPNG وWebP. تُحوَّل صور WebP محلياً قبل تضمينها في PDF.

### Q3

**EN Q:** Can I mix portrait and landscape images in one PDF?

**EN A:** Yes. Use Auto orientation to match each image, or force portrait or landscape for every page.

**AR Q:** هل يمكنني خلط صور عمودية وأفقية في PDF واحد؟

**AR A:** نعم. استخدم الاتجاه التلقائي لكل صورة، أو فرض عمودي أو أفقي لجميع الصفحات.

### Q4

**EN Q:** Is it private?

**EN A:** Yes. Your PDF and images are converted on your device — neither direction uploads files to a server.

**AR Q:** هل الأداة خاصة؟

**AR A:** نعم. يُحوَّل ملف PDF وصورك على جهازك — ولا يرفع أيٌّ من الاتجاهين ملفات إلى خادم.

**FLAGS:** TECH-JARGON, PRIVACY-REDUNDANT, ARTICLE-OVERLAP

Notes:
- EN Q1: mentions `sharp`
- AR has 2 privacy/safety FAQs (Q2, Q4)
- EN Q1 topic-overlaps article (“Which direction preserves quality better?”) on [quality]
- AR Q1 topic-overlaps article (“أي اتجاه يحافظ على الجودة أكثر؟”) on [quality]

---

## compress-pdf

### Q1

**EN Q:** What is the difference between Optimize and Strong?

**EN A:** Optimize adjusts PDF structure without changing page content. Strong renders each page as a JPEG image, which shrinks scans but removes selectable text.

**AR Q:** ما الفرق بين التحسين والقوي؟

**AR A:** التحسين يعدّل بنية PDF دون تغيير محتوى الصفحات. القوي يعرض كل صفحة كصورة JPEG، ما يصغّر المسح لكن يزيل النص القابل للتحديد.

### Q2

**EN Q:** Why is my compressed file sometimes larger?

**EN A:** Text-only or already-optimized PDFs may grow when rasterized. The tool warns you and lets you keep the original.

**AR Q:** لماذا يكون الملف المضغوط أحياناً أكبر؟

**AR A:** ملفات PDF النصية أو المحسّنة مسبقاً قد تكبر عند التحويل لصور. تحذّرك الأداة وتتيح الاحتفاظ بالأصلي.

### Q3

**EN Q:** Does my PDF leave my device?

**EN A:** No. Compression runs on your own device inside the browser — the file you shrink never leaves your machine.

**AR Q:** هل يغادر ملف PDF جهازي؟

**AR A:** لا. يعمل الضغط على جهازك داخل المتصفح — الملف الذي تصغّره لا يغادر جهازك.

### Q4

**EN Q:** Which mode should I use for scanned documents?

**EN A:** Strong mode with Medium or Low quality usually gives the biggest size reduction on image-heavy PDFs.

**AR Q:** أي وضع أنسب للمستندات الممسوحة ضوئياً؟

**AR A:** الوضع القوي بجودة متوسطة أو منخفضة يعطي عادة أكبر تقليل للحجم في PDF الغني بالصور.

**FLAGS:** DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE privacy filler EN Q3 ≈ merge-pdf Q1
- DUPLICATE privacy filler EN Q3 ≈ split-pdf Q1
- DUPLICATE privacy filler EN Q3 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q3 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q3 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-sign Q1
- EN Q4 topic-overlaps article (“Will text stay sharp?”) on [quality]

---

## rotate-pdf

### Q1

**EN Q:** Does turning pages reduce quality?

**EN A:** No. Only the page orientation changes; text and images are not re-drawn, so they stay sharp.

**AR Q:** هل يقلل تدوير الصفحات من الجودة؟

**AR A:** لا. يتغير اتجاه الصفحة فقط؛ النص والصور لا يُعاد رسمهما، فيبقيان حادين.

### Q2

**EN Q:** Is it private?

**EN A:** Yes. Your PDF is rotated on your device inside the browser — pages never upload.

**AR Q:** هل الأداة خاصة؟

**AR A:** نعم. يُدوَّر ملف PDF على جهازك داخل المتصفح — الصفحات لا تُرفع أبداً.

### Q3

**EN Q:** What if a page was already rotated?

**EN A:** The tool reads the existing rotation and adds your turns on top, so the final angle is always correct.

**AR Q:** ماذا لو كانت الصفحة مدوّرة مسبقاً؟

**AR A:** تقرأ الأداة التدوير الحالي وتضيف تدويراتك فوقه، فتكون الزاوية النهائية صحيحة دائماً.

### Q4

**EN Q:** What if my PDF is password-protected?

**EN A:** Unlock it first. Encrypted files cannot be rotated here.

**AR Q:** ماذا لو كان ملفي محمياً بكلمة مرور؟

**AR A:** ألغِ الحماية أولاً. لا يمكن تدوير الملفات المشفّرة هنا.

**FLAGS:** TECH-JARGON, DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE privacy filler EN Q2 ≈ merge-pdf Q1
- DUPLICATE password filler EN Q4 ≈ merge-pdf Q4
- DUPLICATE privacy filler EN Q2 ≈ split-pdf Q1
- DUPLICATE password filler EN Q4 ≈ split-pdf Q3
- DUPLICATE privacy filler EN Q2 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q2 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q2 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q2 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q2 ≈ pdf-watermark Q3
- DUPLICATE password filler EN Q4 ≈ pdf-protect Q4
- EN Q1: mentions `sharp`
- EN Q1 topic-overlaps article (“Does rotating reduce quality?”) on [quality]
- EN Q3 topic-overlaps article (“Can I rotate just one page in a large file?”) on [rotate]
- EN Q3 topic-overlaps article (“Will the rotation stick in every viewer?”) on [rotate]
- AR Q1 topic-overlaps article (“هل يقلل التدوير من الجودة؟”) on [quality]
- AR Q3 topic-overlaps article (“هل يمكن تدوير صفحة واحدة في ملف كبير؟”) on [rotate]
- AR Q3 topic-overlaps article (“هل سيثبت التدوير في كل العارضات؟”) on [rotate]

---

## organize-pdf

### Q1

**EN Q:** Is the original PDF modified?

**EN A:** No. A new PDF is created with your chosen pages and order. Your original file is untouched.

**AR Q:** هل يُعدَّل PDF الأصلي؟

**AR A:** لا. يُنشأ PDF جديد بصفحاتك وترتيبك المختار. ملفك الأصلي يبقى دون تغيير.

### Q2

**EN Q:** Can I undo a deleted page?

**EN A:** Yes. Each deleted page shows an Undo button until you export or clear the file.

**AR Q:** هل يمكنني التراجع عن حذف صفحة؟

**AR A:** نعم. كل صفحة محذوفة تعرض زر تراجع حتى التصدير أو مسح الملف.

### Q3

**EN Q:** Does my document leave my device?

**EN A:** No. Reordering and deletions happen on your device inside the browser — the PDF stays local until you download the new file.

**AR Q:** هل يغادر مستندي جهازي؟

**AR A:** لا. إعادة الترتيب والحذف تجريان على جهازك داخل المتصفح — يبقى PDF محلياً حتى تنزّل الملف الجديد.

### Q4

**EN Q:** What happens if I delete every page?

**EN A:** Export is blocked until at least one page remains in the document.

**AR Q:** ماذا يحدث إذا حذفت كل الصفحات؟

**AR A:** يُمنع التصدير حتى تبقى صفحة واحدة على الأقل في المستند.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q3 ≈ merge-pdf Q1
- DUPLICATE privacy filler EN Q3 ≈ split-pdf Q1
- DUPLICATE privacy filler EN Q3 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q3 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q3 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q3 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-protect Q1

---

## extract-pages

### Q1

**EN Q:** How is this different from Split PDF?

**EN A:** Split PDF cuts a document into parts by ranges (e.g. pages 1–3 as one file, 4–6 as another). Extract pages lets you cherry-pick any specific pages — like 2, 4, and 7 — into a new PDF or separate files.

**AR Q:** ما الفرق عن تقسيم PDF؟

**AR A:** تقسيم PDF يقطع المستند إلى أجزاء حسب النطاقات (مثلاً 1-3 ملف و4-6 ملف آخر). استخراج الصفحات يتيح اختيار صفحات محددة — مثل 2 و4 و7 — في PDF جديد أو ملفات منفصلة.

### Q2

**EN Q:** Is the original PDF modified?

**EN A:** No. A new PDF (or ZIP of PDFs) is created. Your original file stays unchanged.

**AR Q:** هل يُعدَّل PDF الأصلي؟

**AR A:** لا. يُنشأ PDF جديد (أو ZIP من ملفات PDF). ملفك الأصلي يبقى دون تغيير.

### Q3

**EN Q:** Is my file uploaded?

**EN A:** No. Selected pages are copied into a new PDF on your device — the source file never leaves your browser.

**AR Q:** هل يُرفع ملفي؟

**AR A:** لا. تُنسخ الصفحات المحددة إلى PDF جديد على جهازك — ملف المصدر لا يغادر متصفحك.

### Q4

**EN Q:** What order are extracted pages saved in?

**EN A:** Pages are always exported in their original document order, regardless of selection order.

**AR Q:** بأي ترتيب تُحفَظ الصفحات المستخرجة؟

**AR A:** دائماً بترتيب المستند الأصلي، بغض النظر عن ترتيب التحديد.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q3 ≈ split-pdf Q1
- DUPLICATE privacy filler EN Q3 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q3 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q3 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q3 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-protect Q1
- DUPLICATE privacy filler EN Q3 ≈ compress-image Q3

---

## pdf-sign

### Q1

**EN Q:** Is the PDF uploaded?

**EN A:** No. Your signature and the document stay on your device — signing happens inside the browser with nothing uploaded.

**AR Q:** هل يُرفع PDF؟

**AR A:** لا. توقيعك والمستند يبقيان على جهازك — يتم التوقيع داخل المتصفح دون رفع أي شيء.

### Q2

**EN Q:** What image types can I upload as a signature?

**EN A:** Any image your browser can decode: PNG, JPG, WebP, GIF (first frame), SVG, and AVIF. Files are normalized to PNG before embedding.

**AR Q:** ما أنواع الصور المدعومة للتوقيع؟

**AR A:** أي صورة يفك ترميزها متصفحك: PNG وJPG وWebP وGIF (الإطار الأول) وSVG وAVIF. تُحوَّل الملفات إلى PNG قبل التضمين.

### Q3

**EN Q:** Will transparency be preserved?

**EN A:** Yes for PNG and images with transparency. JPEG uploads keep their white background unless you enable “Remove white background.” Drawn signatures export with a transparent background.

**AR Q:** هل تُحفَظ الشفافية؟

**AR A:** نعم لـ PNG والصور الشفافة. ملفات JPEG تحتفظ بخلفيتها البيضاء ما لم تفعّل «إزالة الخلفية البيضاء». التوقيعات المرسومة تُصدَّر بخلفية شفافة.

### Q4

**EN Q:** How do I place one signature on several pages?

**EN A:** Choose all pages, a page range, or the current page. The signature is applied at the same relative position on each selected page.

**AR Q:** كيف أضع توقيعاً واحداً على عدة صفحات؟

**AR A:** اختر كل الصفحات أو نطاقاً أو الصفحة الحالية. يُطبَّق التوقيع بنفس الموضع النسبي على كل صفحة محددة.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q1 ≈ compress-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q1 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q1 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q1 ≈ pdf-protect Q1
- DUPLICATE privacy filler EN Q1 ≈ compress-image Q3
- DUPLICATE privacy filler EN Q1 ≈ image-resizer Q4
- EN has 2 privacy/safety FAQs (Q1, Q2)

---

## pdf-watermark

### Q1

**EN Q:** Can I use an image watermark?

**EN A:** This version supports text watermarks only.

**AR Q:** هل تدعم صورة كعلامة؟

**AR A:** هذه النسخة تدعم النص فقط.

### Q2

**EN Q:** Does the watermark become part of the page?

**EN A:** Yes. When you export, the text is drawn onto every page of the downloaded PDF.

**AR Q:** هل تصبح العلامة جزءاً من الصفحة؟

**AR A:** نعم. عند التصدير يُرسَم النص على كل صفحة من ملف PDF المنزَّل.

### Q3

**EN Q:** Is it private?

**EN A:** Yes. Your PDF and watermark text stay on your device — nothing is uploaded while you stamp pages.

**AR Q:** هل الأداة خاصة؟

**AR A:** نعم. ملف PDF ونص العلامة يبقيان على جهازك — لا يُرفع شيء أثناء ختم الصفحات.

### Q4

**EN Q:** What is the difference between Single and Tiled?

**EN A:** Single places one diagonal watermark near the center. Tiled (repeat) repeats the text across the page. Adjust size and opacity before exporting.

**AR Q:** ما الفرق بين «واحدة» و«متكرّرة (بلاط)»؟

**AR A:** «واحدة» تضع علامة مائلة واحدة قرب الوسط. «متكرّرة (بلاط)» تكرّر النص عبر الصفحة. اضبط الحجم والشفافية قبل التصدير.

**FLAGS:** DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE privacy filler EN Q3 ≈ rotate-pdf Q2
- DUPLICATE privacy filler EN Q3 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q3 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q3 ≈ pdf-protect Q1
- DUPLICATE privacy filler EN Q3 ≈ compress-image Q3
- DUPLICATE privacy filler EN Q3 ≈ image-resizer Q4
- DUPLICATE privacy filler EN Q3 ≈ crop-image Q4
- EN Q1 topic-overlaps article (“Can the watermark be removed later?”) on [watermark]
- EN Q1 topic-overlaps article (“Different watermarks on different pages?”) on [watermark]
- EN Q2 topic-overlaps article (“Can the watermark be removed later?”) on [watermark]
- EN Q2 topic-overlaps article (“Different watermarks on different pages?”) on [watermark]
- EN Q3 topic-overlaps article (“Can the watermark be removed later?”) on [watermark]
- EN Q3 topic-overlaps article (“Different watermarks on different pages?”) on [watermark]
- EN Q4 topic-overlaps article (“Can the watermark be removed later?”) on [watermark]
- EN Q4 topic-overlaps article (“Different watermarks on different pages?”) on [watermark]

---

## pdf-protect

### Q1

**EN Q:** Is encryption done on my device?

**EN A:** Yes. Your PDF and password stay in the browser — the locked file is created locally and never uploaded.

**AR Q:** هل يتم التشفير على جهازي؟

**AR A:** نعم. ملف PDF وكلمة المرور يبقيان في المتصفح — يُنشأ الملف المقفل محلياً ولا يُرفع أبداً.

### Q2

**EN Q:** Can I remove a password here?

**EN A:** This tool only adds protection. To unlock a file, open it in a PDF reader with the password and save an unprotected copy.

**AR Q:** هل يمكن إزالة كلمة المرور هنا؟

**AR A:** هذه الأداة تضيف الحماية فقط. لفتح ملف مقفل، افتحه في قارئ PDF بكلمة المرور واحفظ نسخة غير محمية.

### Q3

**EN Q:** How strong is the protection?

**EN A:** The tool applies modern 256-bit PDF encryption. Strength still depends on a long, hard-to-guess password and sending it on a different channel than the file.

**AR Q:** ما مدى قوة الحماية؟

**AR A:** تطبّق الأداة تشفير PDF حديثاً بـ 256 بت. تبقى القوة معتمدة على كلمة مرور طويلة صعبة التخمين، وعلى إرسالها عبر قناة مختلفة عن الملف.

### Q4

**EN Q:** What if the PDF is already password-protected?

**EN A:** Unlock it first, then protect it again here. This tool expects an unprotected PDF as input.

**AR Q:** ماذا لو كان PDF محمياً مسبقاً بكلمة مرور؟

**AR A:** ألغِ الحماية أولاً ثم احمه هنا من جديد. هذه الأداة تتوقع ملف PDF غير محمي كمدخل.

**FLAGS:** DUPLICATE, ARTICLE-OVERLAP

Notes:
- DUPLICATE password filler EN Q4 ≈ merge-pdf Q4
- DUPLICATE password filler EN Q4 ≈ split-pdf Q3
- DUPLICATE password filler EN Q4 ≈ rotate-pdf Q4
- DUPLICATE privacy filler EN Q1 ≈ organize-pdf Q3
- DUPLICATE privacy filler EN Q1 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q1 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q1 ≈ pdf-watermark Q3
- EN Q2 overlaps article FAQ wording: “Can I remove the password later?”
- EN Q3 overlaps article FAQ wording: “How strong is the encryption?”
- AR Q1 topic-overlaps article (“ما مدى قوة التشفير؟”) on [password]
- AR Q2 topic-overlaps article (“ما مدى قوة التشفير؟”) on [password]
- AR Q2 overlaps article FAQ wording: “هل يمكن إزالة كلمة المرور لاحقاً؟”
- AR Q3 overlaps article FAQ wording: “ما مدى قوة التشفير؟”
- AR Q4 topic-overlaps article (“ما مدى قوة التشفير؟”) on [password]

---

## compress-image

### Q1

**EN Q:** What image formats can I compress?

**EN A:** JPEG and PNG only. Transparent PNGs stay PNG; opaque PNGs can optionally convert to JPEG for smaller files.

**AR Q:** ما صيغ الصور التي يمكن ضغطها؟

**AR A:** JPEG وPNG فقط. ملفات PNG الشفافة تبقى PNG، ويمكن تحويل PNG غير الشفافة اختيارياً إلى JPEG لتصغير الحجم.

### Q2

**EN Q:** How much smaller will my file get?

**EN A:** It depends on the photo. Use the quality slider (10–100, default 80) — high-resolution photos often shrink a lot around 70–80%, while already-compressed images may gain less.

**AR Q:** كم يتقلص حجم الملف؟

**AR A:** يعتمد على الصورة. استخدم شريط الجودة (10–100، الافتراضي 80) — الصور عالية الدقة غالباً تتقلص كثيراً حول 70–80%، بينما الصور المضغوطة مسبقاً قد تحقق مكاسب أقل.

### Q3

**EN Q:** Do my photos leave my device?

**EN A:** No. Compression runs in your browser and the download stays on your device — nothing is uploaded.

**AR Q:** هل تغادر صوري جهازي؟

**AR A:** لا. يتم الضغط داخل متصفحك ويبقى التنزيل على جهازك — دون رفع أي شيء.

### Q4

**EN Q:** Does compression change the image dimensions?

**EN A:** No. Width and height stay the same; only file size/quality change. If the result is not smaller, the tool offers the original as already optimized. Use Image Resizer to change dimensions.

**AR Q:** هل يغيّر الضغط أبعاد الصورة؟

**AR A:** لا. العرض والارتفاع يبقيان كما هما؛ يتغير حجم الملف والجودة فقط. إن لم يصغر الناتج، تعرض الأداة الأصل على أنه محسّن مسبقاً. لتغيير الأبعاد استخدم أداة تغيير حجم الصور.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q3 ≈ extract-pages Q3
- DUPLICATE privacy filler EN Q3 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q3 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q3 ≈ image-resizer Q4
- DUPLICATE privacy filler EN Q3 ≈ crop-image Q4
- DUPLICATE privacy filler EN Q3 ≈ image-converter Q4
- DUPLICATE privacy filler EN Q3 ≈ heic-to-jpg Q1

---

## image-resizer

### Q1

**EN Q:** Can I resize without distorting the image?

**EN A:** Yes. Keep aspect-ratio lock on (it is on by default) so changing width or height updates the other dimension proportionally.

**AR Q:** هل يمكنني تغيير الحجم دون تشويه الصورة؟

**AR A:** نعم. أبقِ قفل نسبة العرض إلى الارتفاع مفعّلاً (وهو مفعّل افتراضياً) ليُحدَّث البُعد الآخر تلقائياً عند تغيير العرض أو الارتفاع.

### Q2

**EN Q:** Is there a maximum image size?

**EN A:** There is no fixed pixel limit in the tool. Very large images (for example above 8000px on a side) may feel slow depending on your device and browser.

**AR Q:** هل يوجد حد أقصى لحجم الصورة؟

**AR A:** لا يوجد حد ثابت بالبكسل داخل الأداة. الصور الضخمة جداً (مثلاً فوق 8000 بكسل في أحد الجانبين) قد تبطئ حسب جهازك ومتصفحك.

### Q3

**EN Q:** Does resizing lower image quality?

**EN A:** Shrinking usually stays sharp. Enlarging past the original size can look soft because new pixels are invented. Export uses the same format as your source.

**AR Q:** هل يخفض تغيير الحجم جودة الصورة؟

**AR A:** التصغير يبدو عادةً حاداً. التكبير فوق الحجم الأصلي قد يبدو ناعماً لأن بكسلات جديدة تُستحدث. التصدير بنفس صيغة المصدر.

### Q4

**EN Q:** Are my photos uploaded when I resize?

**EN A:** No. Resizing happens locally in your browser — your photos never leave your device.

**AR Q:** هل تُرفع صوري عند تغيير الحجم؟

**AR A:** لا. يتم تغيير الحجم محلياً في متصفحك — صورك لا تغادر جهازك.

**FLAGS:** TECH-JARGON, EN-AR-MISMATCH, DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ pdf-sign Q1
- DUPLICATE privacy filler EN Q4 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q4 ≈ compress-image Q3
- EN Q3: mentions `sharp`
- Q2: numeric mismatch EN[] vs AR[8000]

---

## crop-image

### Q1

**EN Q:** What crop shapes and ratios are available?

**EN A:** Rectangle, circle, or rounded square. Rectangle presets include Free, 1:1, 4:3, 16:9, 3:4, and 9:16. Zoom (100–400%) and pan to frame the crop.

**AR Q:** ما أشكال القص والنسب المتاحة؟

**AR A:** مستطيل أو دائرة أو مربع مستدير. إعدادات المستطيل تشمل حر و1:1 و4:3 و16:9 و3:4 و9:16. قرّب (100–400%) واسحب لتأطير القص.

### Q2

**EN Q:** Do circle and rounded crops keep transparency?

**EN A:** Yes. Those modes export PNG with transparent pixels outside the shape — useful for profile photos and stickers. Corner radius for rounded square is adjustable (0–48%).

**AR Q:** هل يحافظ قص الدائرة أو المستدير على الشفافية؟

**AR A:** نعم. هذان الوضعان يصدّران PNG ببكسلات شفافة خارج الشكل — مناسب للصور الشخصية والملصقات. نصف قطر زوايا المربع المستدير قابل للضبط (0–48%).

### Q3

**EN Q:** What format does a rectangle crop download as?

**EN A:** JPEG if the source is JPEG; otherwise PNG, so transparency from PNG sources can be kept.

**AR Q:** بأي صيغة يُنزَّل القص المستطيل؟

**AR A:** JPEG إذا كان المصدر JPEG؛ وإلا PNG حتى تُحفظ شفافية مصادر PNG عند توفرها.

### Q4

**EN Q:** Is cropping done on a server?

**EN A:** No. Your photo is cropped in the browser and downloaded from your device — nothing is uploaded.

**AR Q:** هل يتم القص على خادم؟

**AR A:** لا. تُقص صورتك داخل المتصفح وتُنزَّل من جهازك — دون رفع أي شيء.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ pdf-watermark Q3
- DUPLICATE privacy filler EN Q4 ≈ compress-image Q3

---

## image-converter

### Q1

**EN Q:** Which output formats can I choose?

**EN A:** PNG, JPG, and WebP. You can select one or more; multiple formats download together as a ZIP.

**AR Q:** ما صيغ الإخراج المتاحة؟

**AR A:** PNG وJPG وWebP. يمكنك اختيار واحدة أو أكثر؛ عند اختيار عدة صيغ تُنزَّل معاً كملف ZIP.

### Q2

**EN Q:** What happens to transparency when converting to JPG?

**EN A:** JPG has no transparency, so transparent areas are filled with white before export. Prefer PNG or WebP to keep alpha.

**AR Q:** ماذا يحدث للشفافية عند التحويل إلى JPG؟

**AR A:** JPG لا يدعم الشفافية، فتُملأ المناطق الشفافة بالأبيض قبل التصدير. اختر PNG أو WebP للحفاظ على الشفافية.

### Q3

**EN Q:** Can I control compression quality?

**EN A:** Yes. When JPG or WebP is selected, a quality slider (50–100, default 92) applies. PNG is lossless and ignores that slider.

**AR Q:** هل يمكن التحكم بجودة الضغط؟

**AR A:** نعم. عند اختيار JPG أو WebP يظهر شريط جودة (50–100، الافتراضي 92). PNG بدون فقد ولا يستخدم ذلك الشريط.

### Q4

**EN Q:** Are images uploaded during conversion?

**EN A:** No. Format conversion runs entirely in your browser on your device.

**AR Q:** هل تُرفع الصور أثناء التحويل؟

**AR A:** لا. تحويل الصيغة يتم بالكامل داخل متصفحك على جهازك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ compress-image Q3

---

## heic-to-jpg

### Q1

**EN Q:** Do my iPhone HEIC photos get uploaded?

**EN A:** No. HEIC/HEIF conversion runs in your browser — your photos stay on your device.

**AR Q:** هل تُرفع صور HEIC من جهاز iPhone؟

**AR A:** لا. تحويل HEIC/HEIF يعمل داخل متصفحك — صورك تبقى على جهازك.

### Q2

**EN Q:** Can I convert several photos at once?

**EN A:** Yes. Upload multiple HEIC or HEIF files, then download each JPG or one ZIP of all results.

**AR Q:** هل يمكن تحويل عدة صور دفعة واحدة؟

**AR A:** نعم. ارفع عدة ملفات HEIC أو HEIF، ثم نزّل كل JPG على حدة أو ملفاً واحداً ZIP لكل النتائج.

### Q3

**EN Q:** How do I balance file size and quality?

**EN A:** Use the JPEG quality slider from 10 to 100 (default 90). Lower values make smaller files; changing quality reconverts the loaded batch.

**AR Q:** كيف أوازن بين حجم الملف والجودة؟

**AR A:** استخدم شريط جودة JPEG من 10 إلى 100 (الافتراضي 90). القيم الأقل تصغّر الملف؛ تغيير الجودة يعيد تحويل الدفعة المحمّلة.

### Q4

**EN Q:** What do I get after conversion?

**EN A:** Each photo becomes a JPG with the same base name. There is no on-page image preview — you see file names and sizes in the list.

**AR Q:** ماذا أحصل عليه بعد التحويل؟

**AR A:** تصبح كل صورة ملفاً JPG بنفس الاسم الأساسي. لا توجد معاينة للصورة في الصفحة — تظهر أسماء الملفات وأحجامها في القائمة.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q1 ≈ compress-image Q3
- EN has 2 privacy/safety FAQs (Q1, Q2)
- AR has 2 privacy/safety FAQs (Q1, Q2)

---

## flip-image

### Q1

**EN Q:** Which flip directions are supported?

**EN A:** Horizontal, vertical, or both at once. Toggles update the preview immediately.

**AR Q:** ما اتجاهات القلب المدعومة؟

**AR A:** أفقي أو عمودي أو كلاهما معاً. تتحدّث المعاينة فوراً عند التبديل.

### Q2

**EN Q:** Does flipping reduce quality?

**EN A:** Mirroring does not soften the image. JPEG sources export as JPEG; other types export as PNG at full resolution.

**AR Q:** هل يقلل القلب من الجودة؟

**AR A:** الانعكاس لا يُنعّم الصورة. مصادر JPEG تُصدَّر JPEG؛ الأنواع الأخرى تُصدَّر PNG بالدقة الكاملة.

### Q3

**EN Q:** Need rotation instead of a mirror?

**EN A:** Use the Image Rotator link on the page for 90°, 180°, or 270° turns.

**AR Q:** أحتاج تدويراً بدل المرآة؟

**AR A:** استخدم رابط أداة تدوير الصور في الصفحة لدورات 90° أو 180° أو 270°.

### Q4

**EN Q:** Does my photo leave the browser when I flip it?

**EN A:** No. The flip is applied locally and you download the result from your device.

**AR Q:** هل تغادر صورتي المتصفح عند قلبها؟

**AR A:** لا. يُطبَّق القلب محلياً وتنزّل النتيجة من جهازك.

**FLAGS:** (none)

---

## image-rotator

### Q1

**EN Q:** By how many degrees can I rotate?

**EN A:** In 90° steps only: buttons add 90°, 180°, or 270° (cumulative, wrapping at 360°). Free-angle rotation is not available.

**AR Q:** بكم درجة يمكنني التدوير؟

**AR A:** بخطوات 90° فقط: الأزرار تضيف 90° أو 180° أو 270° (تراكمياً حتى 360°). لا يتوفر تدوير بزاوية حرة.

### Q2

**EN Q:** What format is exported?

**EN A:** Always PNG at the image’s full pixel size. Width and height swap on 90° and 270° turns.

**AR Q:** ما صيغة التصدير؟

**AR A:** دائماً PNG بالحجم الكامل بالبكسل. يتبادل العرض والارتفاع عند 90° و270°.

### Q3

**EN Q:** Need to flip or mirror instead?

**EN A:** Use the Flip Image tool linked on the page for horizontal or vertical mirroring.

**AR Q:** أحتاج قلباً أو مرآة بدل التدوير؟

**AR A:** استخدم أداة قلب الصورة المرتبطة في الصفحة للقلب الأفقي أو العمودي.

### Q4

**EN Q:** Is my image sent anywhere to rotate it?

**EN A:** No. Rotation stays in your browser and the PNG downloads to your device.

**AR Q:** هل تُرسل صورتي إلى مكان ما لتدويرها؟

**AR A:** لا. يبقى التدوير في متصفحك ويُنزَّل ملف PNG إلى جهازك.

**FLAGS:** (none)

---

## blur-image

### Q1

**EN Q:** Can I redact more than one area?

**EN A:** Yes. Draw as many rectangles as you need; each region is listed with its size in image pixels so you can delete or refine it.

**AR Q:** هل يمكن إخفاء أكثر من منطقة؟

**AR A:** نعم. ارسم أي عدد من المستطيلات؛ تظهر كل منطقة في القائمة بأبعادها ببكسل الصورة الأصلية لحذفها أو تعديلها.

### Q2

**EN Q:** Should I use blur or pixelate?

**EN A:** Prefer pixelate at high strength for secure redaction (default mode). Light blur can sometimes still be recoverable.

**AR Q:** أيهما أفضل: التمويه أم البكسلة؟

**AR A:** فضّل البكسلة بقوة عالية للإخفاء الآمن (الوضع الافتراضي). التمويه الخفيف قد يبقى قابلاً للاسترجاع أحياناً.

### Q3

**EN Q:** What strength ranges can I set?

**EN A:** Pixelate intensity runs from 8 to 64 (default 16). Blur runs from 2 to 40. Export is JPEG for JPEG sources, otherwise PNG.

**AR Q:** ما نطاقات الشدة المتاحة؟

**AR A:** شدة البكسلة من 8 إلى 64 (الافتراضي 16). التمويه من 2 إلى 40. التصدير JPEG لمصادر JPEG وإلا PNG.

### Q4

**EN Q:** Does my photo leave my device while redacting?

**EN A:** No. Regions are applied in your browser so you can hide faces, plates, or text before sharing — nothing is uploaded.

**AR Q:** هل تغادر صورتي جهازي أثناء الإخفاء؟

**AR A:** لا. تُطبَّق المناطق داخل متصفحك لإخفاء الوجوه أو اللوحات أو النصوص قبل المشاركة — دون رفع أي شيء.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q4 ≈ image-watermark Q4
- DUPLICATE privacy filler EN Q4 ≈ add-text-to-image Q4
- DUPLICATE privacy filler EN Q4 ≈ image-collage Q4
- DUPLICATE privacy filler EN Q4 ≈ passport-photo Q4
- EN has 2 privacy/safety FAQs (Q2, Q4)
- AR has 2 privacy/safety FAQs (Q2, Q4)

---

## image-watermark

### Q1

**EN Q:** Can I move the watermark?

**EN A:** Yes, in single mode: drag the text on the live preview. Default text is CONFIDENTIAL; empty text draws nothing.

**AR Q:** هل يمكن تحريك العلامة المائية؟

**AR A:** نعم في الوضع المفرد: اسحب النص على المعاينة الحية. النص الافتراضي CONFIDENTIAL؛ النص الفارغ لا يرسم شيئاً.

### Q2

**EN Q:** What does tile mode do?

**EN A:** It repeats your watermark in a diagonal pattern across the whole image. Positioning by drag is for single mode only.

**AR Q:** ماذا يفعل وضع التكرار؟

**AR A:** يكرّر علامتك بنمط مائل عبر الصورة بالكامل. السحب للموضع متاح في الوضع المفرد فقط.

### Q3

**EN Q:** What styling options are available?

**EN A:** Font size 12–120, color, opacity 0.1–1, and rotation from −90° to 90° (default about −35°).

**AR Q:** ما خيارات التنسيق المتاحة؟

**AR A:** حجم الخط 12–120، واللون، والشفافية 0.1–1، والتدوير من −90° إلى 90° (الافتراضي حوالي −35°).

### Q4

**EN Q:** Are my photos uploaded to add a watermark?

**EN A:** No. The overlay is drawn in your browser and exported as JPEG or the source format on your device.

**AR Q:** هل تُرفع صوري لإضافة علامة مائية؟

**AR A:** لا. تُرسم الطبقة في متصفحك وتُصدَّر JPEG أو بصيغة المصدر على جهازك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ blur-image Q4

---

## add-text-to-image

### Q1

**EN Q:** Can I add more than one caption?

**EN A:** Yes. Add up to 10 text layers. Select a layer to edit its message, font, size (12–120), color, and outline.

**AR Q:** هل يمكن إضافة أكثر من تعليق؟

**AR A:** نعم. أضف حتى 10 طبقات نص. اختر طبقة لتعديل الرسالة والخط والحجم (12–120) واللون والحد الخارجي.

### Q2

**EN Q:** How do I position text?

**EN A:** Drag any layer on the preview, or nudge the selected layer with the arrow keys. Export is always a full-resolution PNG.

**AR Q:** كيف أحدد موضع النص؟

**AR A:** اسحب أي طبقة على المعاينة، أو حرّك الطبقة المحددة بمفاتيح الأسهم. التصدير دائماً PNG بالدقة الكاملة.

### Q3

**EN Q:** Does curved text work with Arabic?

**EN A:** Curvature (−100 to 100) is for Latin-script text. When a layer contains Arabic, curvature is disabled and forced flat.

**AR Q:** هل يعمل انحناء النص مع العربية؟

**AR A:** الانحناء (−100 إلى 100) للنص اللاتيني. عند وجود عربي في الطبقة يُعطَّل الانحناء ويُفرَض نصاً مستقيماً.

### Q4

**EN Q:** Do my photos stay private while I add text?

**EN A:** Yes. Text is composited in your browser — your image is not uploaded.

**AR Q:** هل تبقى صوري خاصة أثناء إضافة النص؟

**AR A:** نعم. يُركَّب النص داخل متصفحك — صورتك لا تُرفع.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ blur-image Q4

---

## image-collage

### Q1

**EN Q:** How many images can I use?

**EN A:** Between 2 and 4 photos. Layout options change with the count (for example 2-cols, 2-rows, 3-cols, or 2×2).

**AR Q:** كم صورة يمكن استخدامها؟

**AR A:** بين صورتين و4 صور. خيارات التخطيط تتغير حسب العدد (مثل عمودين أو صفين أو 3 أعمدة أو شبكة 2×2).

### Q2

**EN Q:** Can I adjust spacing and framing inside each cell?

**EN A:** Yes. Set the gap from 0 to 32px (default 8). Select a cell to zoom 0.5–2.5× and drag to pan within that cell.

**AR Q:** هل يمكن ضبط المسافات والإطار داخل كل خلية؟

**AR A:** نعم. اضبط الفجوة من 0 إلى 32 بكسل (الافتراضي 8). اختر خلية للتكبير 0.5–2.5× واسحب للتحريك داخلها.

### Q3

**EN Q:** What size is the exported collage?

**EN A:** A single 800×800 PNG on a white background.

**AR Q:** ما حجم الكولاج المُصدَّر؟

**AR A:** ملف PNG واحد بمقاس 800×800 على خلفية بيضاء.

### Q4

**EN Q:** Are my collage photos uploaded?

**EN A:** No. The grid is built and exported in your browser on your device.

**AR Q:** هل تُرفع صور الكولاج؟

**AR A:** لا. تُبنى الشبكة وتُصدَّر داخل متصفحك على جهازك.

**FLAGS:** EN-AR-MISMATCH, DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ blur-image Q4
- Q2: numeric mismatch EN[0,8,0,5,2,5] vs AR[0,32,8,0,5,2,5]

---

## passport-photo

### Q1

**EN Q:** Which official sizes are supported?

**EN A:** Presets for US 2×2 in, Schengen 35×45 mm, and 40×60 mm, plus custom width/height. Zoom and pan under the fixed frame to crop.

**AR Q:** ما المقاسات الرسمية المدعومة؟

**AR A:** إعدادات جاهزة: 2×2 بوصة (أمريكي)، و35×45 مم (شنغن)، و40×60 مم، إضافةً إلى عرض وارتفاع مخصصين. قرّب واسحب تحت الإطار الثابت للقص.

### Q2

**EN Q:** What print resolution is used?

**EN A:** Exports default to 300 DPI. You can set DPI from 72 to 600; pixel size follows inches (or mm) × DPI.

**AR Q:** ما دقة الطباعة المستخدمة؟

**AR A:** التصدير افتراضياً بدقة 300 DPI. يمكنك ضبط الدقة من 72 إلى 600؛ حجم البكسل يتبع البوصات (أو المليمترات) × DPI.

### Q3

**EN Q:** Can I print multiple copies on one sheet?

**EN A:** Yes. Download a single photo or a tiled sheet on 4×6 in or A6 paper. Output is JPEG.

**AR Q:** هل يمكن طباعة عدة نسخ على ورقة واحدة؟

**AR A:** نعم. نزّل صورة واحدة أو ورقة مبلّطة بمقاس 4×6 بوصة أو A6. الإخراج JPEG.

### Q4

**EN Q:** Do my photos leave my device?

**EN A:** No. Cropping and sheet layout run in your browser — your portrait stays on your device.

**AR Q:** هل تغادر صوري جهازي؟

**AR A:** لا. القص وتخطيط الورقة يجريان داخل متصفحك — صورتك تبقى على جهازك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ blur-image Q4
- DUPLICATE privacy filler EN Q4 ≈ gif-maker Q4
- DUPLICATE privacy filler EN Q4 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q4 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4

---

## gif-maker

### Q1

**EN Q:** How many frames can I add?

**EN A:** Up to 50 images. You need at least 2 frames to encode. Reorder with the up/down controls.

**AR Q:** كم إطاراً يمكن إضافته؟

**AR A:** حتى 50 صورة. تحتاج إطارين على الأقل للتشفير. أعد الترتيب بأزرار الأعلى/الأسفل.

### Q2

**EN Q:** How do I control speed and looping?

**EN A:** Set frame delay from 50 to 2000 ms (default 200, step 10) and toggle loop on or off (loop defaults on).

**AR Q:** كيف أتحكم بالسرعة والتكرار؟

**AR A:** اضبط تأخير الإطار من 50 إلى 2000 مللي ثانية (الافتراضي 200، بخطوة 10) وفعّل أو أوقف التكرار (مفعّل افتراضياً).

### Q3

**EN Q:** What output size options exist?

**EN A:** Cap the longest side at 480px (default) or 720px. Frames are centered on a white background, so source transparency is not kept.

**AR Q:** ما خيارات حجم الإخراج؟

**AR A:** حدّ أقصى الضلع الأطول عند 480 بكسل (افتراضي) أو 720 بكسل. تُوسَّط الإطارات على خلفية بيضاء، فلا تُحفظ شفافية المصدر.

### Q4

**EN Q:** Do my frames leave my device?

**EN A:** No. GIF encoding runs in your browser — your images stay on your device until you download animation.gif.

**AR Q:** هل تغادر إطاراتي جهازي؟

**AR A:** لا. تشفير GIF يعمل داخل متصفحك — صورك تبقى على جهازك حتى تنزّل animation.gif.

**FLAGS:** EN-AR-MISMATCH, DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ passport-photo Q4
- DUPLICATE privacy filler EN Q4 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q4 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q2
- Q1: numeric mismatch EN[50,2] vs AR[50]
- Q3: numeric mismatch EN[] vs AR[480,720]

---

## image-color-picker

### Q1

**EN Q:** How do I read a color from my image?

**EN A:** Upload a photo or screenshot, then click the preview. The color under the click is shown as HEX, RGB, and HSL with one-click copy.

**AR Q:** كيف أقرأ لوناً من صورتي؟

**AR A:** ارفع صورة أو لقطة شاشة ثم انقر على المعاينة. يظهر اللون تحت النقرة بصيغ HEX وRGB وHSL مع نسخ بنقرة واحدة.

### Q2

**EN Q:** How accurate is the sampled color?

**EN A:** It reads the pixel under your click on the on-screen preview. Very large images are scaled down for display, so the sample matches what you see, not necessarily a full-resolution source pixel.

**AR Q:** ما دقة اللون الملتقط؟

**AR A:** تُقرأ البكسلة تحت نقرتك على معاينة الشاشة. الصور الكبيرة جداً تُصغَّر للعرض، فالعينة تطابق ما تراه وليس بالضرورة بكسل المصدر بالدقة الكاملة.

### Q3

**EN Q:** Is there a history of recent picks?

**EN A:** Yes. Up to 12 recent colors stay in the session history until you load a new image.

**AR Q:** هل يوجد سجل للألوان الأخيرة؟

**AR A:** نعم. يبقى حتى 12 لوناً أخيراً في سجل الجلسة حتى تحمّل صورة جديدة.

### Q4

**EN Q:** Does my image leave my device?

**EN A:** No. Color sampling happens in your browser — the photo is never uploaded.

**AR Q:** هل تغادر صورتي جهازي؟

**AR A:** لا. التقاط اللون يتم داخل متصفحك — الصورة لا تُرفع أبداً.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q4 ≈ passport-photo Q4
- DUPLICATE privacy filler EN Q4 ≈ gif-maker Q4
- DUPLICATE privacy filler EN Q4 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q2
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- EN has 2 privacy/safety FAQs (Q1, Q4)
- AR has 2 privacy/safety FAQs (Q1, Q4)

---

## exif-remover

### Q1

**EN Q:** What metadata can be removed?

**EN A:** Fields such as GPS, camera model, timestamps, and other EXIF/IPTC tags embedded in the file. Sensitive fields are pre-selected; you can select or deselect tags before cleaning.

**AR Q:** ما البيانات الوصفية التي يمكن إزالتها؟

**AR A:** حقول مثل GPS وطراز الكاميرا والطوابع الزمنية وغيرها من وسوم EXIF/IPTC المضمّنة في الملف. الحقول الحساسة محدّدة مسبقاً؛ يمكنك تحديد الوسوم أو إلغاء تحديدها قبل التنظيف.

### Q2

**EN Q:** Which formats are supported?

**EN A:** JPEG, PNG, and WebP, including multiple files at once (individual download or a ZIP). WebP cleaned via full re-encode is saved as JPEG.

**AR Q:** ما الصيغ المدعومة؟

**AR A:** JPEG وPNG وWebP، مع دعم عدة ملفات دفعة واحدة (تنزيل فردي أو ZIP). WebP عند إعادة الترميز الكامل يُحفظ كـ JPEG.

### Q3

**EN Q:** Will cleaning reduce image quality?

**EN A:** When the tool re-encodes (typical for PNG/WebP, or JPEG when stripping everything), JPEG output uses about 92% quality — usually close visually, without the hidden metadata. Selective JPEG tag removal can keep the original pixels.

**AR Q:** هل يقلل التنظيف من جودة الصورة؟

**AR A:** عند إعادة الترميز (شائع لـ PNG/WebP، أو JPEG عند إزالة كل شيء) يكون إخراج JPEG بجودة تقارب 92% — قريب بصرياً عادةً دون البيانات المخفية. الإزالة الانتقائية لوسم JPEG قد تبقي البكسلات الأصلية.

### Q4

**EN Q:** Do my photos leave my device when stripping EXIF?

**EN A:** No. Metadata removal runs in your browser so location and camera details stay on your device until you download the cleaned files.

**AR Q:** هل تغادر صوري جهازي عند إزالة EXIF؟

**AR A:** لا. تُزال البيانات الوصفية داخل متصفحك فتبقى الموقع وتفاصيل الكاميرا على جهازك حتى تنزّل الملفات المنظّفة.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ passport-photo Q4
- DUPLICATE privacy filler EN Q4 ≈ gif-maker Q4
- DUPLICATE privacy filler EN Q4 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q2
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2

---

## word-counter

### Q1

**EN Q:** How is the word count calculated?

**EN A:** Words are counted by splitting on whitespace. Numbers and hyphenated words each count as a single word.

**AR Q:** كيف يُحسب عدد الكلمات؟

**AR A:** تُعدّ الكلمات بتقسيم النص عند المسافات البيضاء. الأرقام والكلمات المركبة بشرطة تُحسب كلٌّ منها ككلمة واحدة.

### Q2

**EN Q:** How is reading time estimated?

**EN A:** Reading time assumes an average speed of 200 words per minute, which is typical for adult readers of English prose.

**AR Q:** كيف يُقدَّر وقت القراءة؟

**AR A:** يفترض وقت القراءة سرعة متوسطة 200 كلمة في الدقيقة، وهو نموذجي لقرّاء النثر الإنجليزي البالغين.

### Q3

**EN Q:** Does this count characters with spaces?

**EN A:** Yes. We show both total characters and characters excluding spaces, so you can match any platform's requirements.

**AR Q:** هل يُحسب الأحرف مع المسافات؟

**AR A:** نعم. نعرض إجمالي الأحرف والأحرف باستثناء المسافات، لتطابق متطلبات أي منصة.

### Q4

**EN Q:** Is there a character or word limit?

**EN A:** No. You can paste very long documents. Performance depends on your browser, but most texts process instantly.

**AR Q:** هل يوجد حد للأحرف أو الكلمات؟

**AR A:** لا. يمكنك لصق مستندات طويلة جداً. الأداء يعتمد على متصفحك، لكن معظم النصوص تُعالَج فوراً.

**FLAGS:** (none)

---

## case-converter

### Q1

**EN Q:** What is Title Case?

**EN A:** Title Case capitalizes the first letter of each word, which is common for headlines and titles.

**AR Q:** ما هي حالة العنوان؟

**AR A:** حالة العنوان تكبّر الحرف الأول من كل كلمة، وهو شائع للعناوين والرؤوس.

### Q2

**EN Q:** How does Sentence case work?

**EN A:** Sentence case lowercases the entire text, then capitalizes only the first letter of each sentence.

**AR Q:** كيف تعمل حالة الجملة؟

**AR A:** حالة الجملة تصغّر النص بالكامل، ثم تكبّر الحرف الأول فقط من كل جملة.

### Q3

**EN Q:** Can I convert to camelCase or snake_case?

**EN A:** Yes. camelCase joins words without spaces and capitalizes subsequent words. snake_case uses lowercase words separated by underscores.

**AR Q:** هل يمكنني التحويل إلى camelCase أو snake_case؟

**AR A:** نعم. camelCase يجمع الكلمات دون مسافات ويكبّر الكلمات التالية. snake_case يستخدم كلمات صغيرة مفصولة بشرطات سفلية.

### Q4

**EN Q:** Does this work with special characters?

**EN A:** Yes. Accented letters and unicode characters are preserved. Only casing rules are applied.

**AR Q:** هل يعمل مع الأحرف الخاصة؟

**AR A:** نعم. الأحرف المشكّلة ومحارف Unicode تُحفَظ. تُطبَّق قواعد الحالة فقط.

**FLAGS:** (none)

---

## password-generator

### Q1

**EN Q:** What password length can I choose?

**EN A:** Use the slider to pick 8–64 characters. The strength meter updates with your length and character-type choices.

**AR Q:** ما طول كلمة المرور الذي يمكنني اختياره؟

**AR A:** استخدم الشريط لاختيار 8–64 حرفاً. يتحدّث مؤشر القوة مع الطول وأنواع الأحرف التي تفعّلها.

### Q2

**EN Q:** What makes a strong password?

**EN A:** A strong password is at least 12 characters long and mixes uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal information.

**AR Q:** ما الذي يجعل كلمة المرور قوية؟

**AR A:** كلمة المرور القوية بطول 12 حرفاً على الأقل وتخلط بين الأحرف الكبيرة والصغيرة والأرقام والرموز. تجنّب كلمات القاموس والمعلومات الشخصية.

### Q3

**EN Q:** Are generated passwords stored anywhere?

**EN A:** No. Each password exists only in your browser session until you copy it — nothing is logged or sent online.

**AR Q:** هل تُخزَّن كلمات المرور المُنشأة في أي مكان؟

**AR A:** لا. كل كلمة مرور تبقى في جلسة متصفحك حتى تنسخها — لا يُسجَّل شيء ولا يُرسل عبر الإنترنت.

### Q4

**EN Q:** Can I regenerate a new password?

**EN A:** Yes. Click Generate as many times as you like until you get a password you are happy with.

**AR Q:** هل يمكنني إنشاء كلمة مرور جديدة؟

**AR A:** نعم. انقر على إنشاء بقدر ما تشاء حتى تحصل على كلمة مرور تناسبك.

**FLAGS:** (none)

---

## find-and-replace

### Q1

**EN Q:** Does pattern mode use regular expressions?

**EN A:** Yes. Enable the regex checkbox for pattern-based find and replace with global matching.

**AR Q:** هل وضع النمط يستخدم التعابير النمطية؟

**AR A:** نعم. فعّل خانة التعابير النمطية للبحث والاستبدال بالأنماط مع مطابقة شاملة.

### Q2

**EN Q:** Can I undo a replace?

**EN A:** Use your browser undo in the textarea or re-paste the original text.

**AR Q:** هل يمكن التراجع عن الاستبدال؟

**AR A:** استخدم تراجع المتصفح في مربع النص أو أعد لصق النص الأصلي.

### Q3

**EN Q:** Is replacement live or on a button?

**EN A:** A live preview and match count appear below. Click Replace all to write the result back into the input field.

**AR Q:** هل الاستبدال فوري أم بزر؟

**AR A:** تظهر معاينة مباشرة وعدد التطابقات. انقر «استبدال الكل» لكتابة النتيجة في حقل الإدخال.

### Q4

**EN Q:** What if my pattern is invalid?

**EN A:** An error message appears and no replacements run until you fix the pattern.

**AR Q:** ماذا يحدث إذا كان النمط غير صالح؟

**AR A:** تظهر رسالة خطأ ولا يُنفَّذ استبدال حتى تصحّح النمط.

**FLAGS:** (none)

---

## remove-line-breaks

### Q1

**EN Q:** What does each toggle do?

**EN A:** Remove line breaks joins lines into one block (optionally with a space between them). Collapse multiple spaces turns runs of spaces and tabs into a single space. Remove blank lines drops empty lines. Trim line edges removes leading and trailing whitespace on each line.

**AR Q:** ماذا يفعل كل خيار؟

**AR A:** إزالة فواصل الأسطر تدمج الأسطر في كتلة واحدة (مع خيار إدراج مسافة بينها). ضغط المسافات المتعددة يحوّل سلاسل المسافات وTab إلى مسافة واحدة. إزالة الأسطر الفارغة تحذف الأسطر الفارغة. قصّ أطراف الأسطر يزيل المسافات الزائدة في بداية ونهاية كل سطر.

### Q2

**EN Q:** Should I join lines directly or replace breaks with a space?

**EN A:** Join directly when you want one continuous string (e.g. text copied from a PDF). Replace breaks with a space when words on separate lines should stay separated — like turning hard-wrapped paragraphs into normal sentences.

**AR Q:** هل أدمج الأسطر مباشرة أم أستبدل الفواصل بمسافة؟

**AR A:** ادمج مباشرة عندما تريد نصاً متصلاً واحداً (مثل نص منسوخ من PDF). استبدل الفواصل بمسافة عندما يجب أن تبقى الكلمات مفصولة — مثل تحويل التفاف الأسطر الصلب إلى جمل عادية.

### Q3

**EN Q:** Can I combine several options at once?

**EN A:** Yes. All toggles apply together in one pass — for example remove blank lines, trim edges, then join remaining lines with a space.

**AR Q:** هل يمكنني الجمع بين عدة خيارات معاً؟

**AR A:** نعم. تُطبَّق كل الخيارات دفعة واحدة — مثلاً حذف الأسطر الفارغة، قصّ الأطراف، ثم دمج الباقي بمسافة.

### Q4

**EN Q:** Does my pasted text leave my device?

**EN A:** No. Whitespace cleanup runs entirely in your browser; nothing is saved or uploaded.

**AR Q:** هل يغادر النص الذي ألصقه جهازي؟

**AR A:** لا. تنظيف المسافات يتم بالكامل داخل متصفحك؛ لا يُحفَظ أو يُرفع شيء.

**FLAGS:** EN-AR-MISMATCH, DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ passport-photo Q4
- DUPLICATE privacy filler EN Q4 ≈ gif-maker Q4
- DUPLICATE privacy filler EN Q4 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q4 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q2
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2
- DUPLICATE privacy filler EN Q4 ≈ xml-formatter Q4
- Q4: EN says no upload, AR may imply upload

---

## markdown-to-html

### Q1

**EN Q:** Is the HTML preview safe to use?

**EN A:** Yes. Scripts and unsafe tags are stripped from the rendered output before preview and before you copy the HTML.

**AR Q:** هل معاينة HTML آمنة للاستخدام؟

**AR A:** نعم. تُزال السكربتات والوسوم غير الآمنة من المخرجات قبل المعاينة وقبل نسخ HTML.

### Q2

**EN Q:** What Markdown features are supported?

**EN A:** Common web-style Markdown: headings, bold, italic, lists, links, code blocks, and single line breaks (GitHub-style).

**AR Q:** ما ميزات Markdown المدعومة؟

**AR A:** Markdown شائع على الويب: العناوين، الغامق، المائل، القوائم، الروابط، كتل الكود، وفواصل الأسطر المفردة (بأسلوب GitHub).

### Q3

**EN Q:** Can I paste HTML back into the Markdown field?

**EN A:** No. This tool converts Markdown to HTML only. Paste Markdown source, not HTML.

**AR Q:** هل يمكنني لصق HTML في حقل Markdown؟

**AR A:** لا. هذه الأداة تحوّل Markdown إلى HTML فقط. الصق مصدر Markdown وليس HTML.

### Q4

**EN Q:** Does this work offline?

**EN A:** Yes. After the page loads, conversion runs locally in your browser with no server calls.

**AR Q:** هل يعمل هذا دون اتصال؟

**AR A:** نعم. بعد تحميل الصفحة يعمل التحويل محلياً في متصفحك دون طلبات خادم.

**FLAGS:** PRIVACY-REDUNDANT

Notes:
- AR has 2 privacy/safety FAQs (Q1, Q4)

---

## lorem-ipsum-generator

### Q1

**EN Q:** What is lorem ipsum used for?

**EN A:** Placeholder text fills mockups and drafts so you can judge layout without real content. This tool supports Latin Lorem Ipsum and Arabic filler text.

**AR Q:** لماذا يُستخدم النص الوهمي؟

**AR A:** النص الوهمي يملأ النماذج والمسودات لتقييم التخطيط دون محتوى حقيقي. تدعم الأداة لوريم إيبسوم اللاتيني ونصاً عربياً وهمياً.

### Q2

**EN Q:** Can I generate Arabic placeholder text?

**EN A:** Yes. Switch the text language to Arabic to generate RTL paragraphs, sentences, or words using common Arabic filler vocabulary.

**AR Q:** هل يمكن توليد نص عربي وهمي؟

**AR A:** نعم. اختر لغة النص «عربي» لتوليد فقرات أو جمل أو كلمات باتجاه RTL من مفردات عربية شائعة للنماذج.

### Q3

**EN Q:** Is the text random each time?

**EN A:** Yes. Each click generates new randomized sentences built from classic placeholder vocabulary in the selected language.

**AR Q:** هل النص عشوائي في كل مرة؟

**AR A:** نعم. كل نقرة تُنشئ جملاً عشوائية جديدة من مفردات النص الوهمي الكلاسيكية باللغة المختارة.

### Q4

**EN Q:** What is the maximum count?

**EN A:** Up to 50 paragraphs or sentences, or up to 500 words per generation.

**AR Q:** ما الحد الأقصى للعدد؟

**AR A:** حتى 50 فقرة أو جملة، أو حتى 500 كلمة لكل عملية إنشاء.

**FLAGS:** (none)

---

## text-diff-checker

### Q1

**EN Q:** Does it show word-level changes inside a line?

**EN A:** Yes. When the same line number changes on both sides, added and removed words are highlighted within that line — not just the whole line.

**AR Q:** هل يعرض تغييرات على مستوى الكلمة داخل السطر؟

**AR A:** نعم. عندما يتغيّر نفس رقم السطر في الجانبين، تُبرز الكلمات المُضافة والمحذوفة داخل ذلك السطر — وليس السطر بأكمله فقط.

### Q2

**EN Q:** Does it compare word by word?

**EN A:** It compares line by line first, which suits code, configs, and multi-line documents. Changed lines also get word-level highlights.

**AR Q:** هل يقارن كلمة بكلمة؟

**AR A:** يبدأ بالمقارنة سطراً بسطر، وهو مناسب للكود والإعدادات والمستندات متعددة الأسطر. الأسطر المتغيّرة تحصل أيضاً على تمييز على مستوى الكلمات.

### Q3

**EN Q:** Can I diff very large files?

**EN A:** Large texts may slow the browser slightly, but there is no file size limit beyond your device memory.

**AR Q:** هل يمكنني مقارنة ملفات كبيرة جداً؟

**AR A:** النصوص الكبيرة قد تبطئ المتصفح قليلاً، لكن لا يوجد حد لحجم الملف سوى ذاكرة جهازك.

### Q4

**EN Q:** What do the colors mean?

**EN A:** Red with strikethrough means removed content. Green means added content. Amber means a line changed with mixed word-level edits.

**AR Q:** ماذا تعني الألوان؟

**AR A:** الأحمر مع خط في الوسط يعني محتوىً أُزيل. الأخضر يعني محتوىً أُضيف. الكهرماني يعني سطراً تغيّر مع تعديلات مختلطة على مستوى الكلمات.

**FLAGS:** (none)

---

## slug-generator

### Q1

**EN Q:** Are Arabic titles supported?

**EN A:** Yes. Arabic letters are kept in the slug. Latin accented letters are normalized; other symbols become hyphens or are removed.

**AR Q:** هل تدعم العناوين العربية؟

**AR A:** نعم. تُحفَظ الحروف العربية في الرابط المختصر. أحرف اللاتينية المشكّلة تُطبَّع؛ الرموز الأخرى تصبح شرطات أو تُزال.

### Q2

**EN Q:** What characters are removed?

**EN A:** Punctuation and symbols are stripped; spaces and underscores become single hyphens.

**AR Q:** ما الأحرف التي تُزال؟

**AR A:** علامات الترقيم والرموز تُحذف؛ المسافات والشرطات السفلية تصبح شرطة واحدة.

### Q3

**EN Q:** Does the slug update automatically?

**EN A:** Yes. The slug updates as you type — no separate generate button.

**AR Q:** هل يتحدّث الرابط تلقائياً؟

**AR A:** نعم. يتحدّث أثناء الكتابة — دون زر إنشاء منفصل.

### Q4

**EN Q:** What if my title has only symbols?

**EN A:** You may get an empty slug. Add letters or words first, then copy the result.

**AR Q:** ماذا لو كان العنوان رموزاً فقط؟

**AR A:** قد تحصل على رابط فارغ. أضف حروفاً أو كلمات أولاً ثم انسخ النتيجة.

**FLAGS:** (none)

---

## arabic-diacritics-remover

### Q1

**EN Q:** What is removed?

**EN A:** Arabic harakat such as fatha, damma, kasra, sukun, shadda, and tanween marks.

**AR Q:** ما الذي يُزال؟

**AR A:** الحركات العربية مثل الفتحة والضمة والكسرة والسكون والشدة والتنوين.

### Q2

**EN Q:** Are letters changed?

**EN A:** Only diacritics are removed. Base Arabic letters and spacing stay the same.

**AR Q:** هل تتغير الأحرف؟

**AR A:** تُزال التشكيل فقط. الأحرف العربية الأساسية والمسافات تبقى.

### Q3

**EN Q:** Does output update as I paste?

**EN A:** Yes. Stripping happens instantly while you type or paste in the input area.

**AR Q:** هل تتحدّث النتيجة أثناء اللصق؟

**AR A:** نعم. يحدث الحذف فوراً أثناء الكتابة أو اللصق في حقل الإدخال.

### Q4

**EN Q:** Is processing local?

**EN A:** Yes. Nothing is sent to kitzos servers.

**AR Q:** هل المعالجة محلية؟

**AR A:** نعم. لا يُرسل شيء إلى خوادم kitzos.

**FLAGS:** (none)

---

## line-sorter

### Q1

**EN Q:** Is sorting case-sensitive?

**EN A:** Alphabetical sort uses locale-aware comparison, which handles mixed case naturally.

**AR Q:** هل الترتيب حساس لحالة الأحرف؟

**AR A:** الفرز الأبجدي يستخدم مقارنة حساسة للغة، فتتعامل مع الأحرف الكبيرة والصغيرة طبيعياً.

### Q2

**EN Q:** Does random shuffle repeat?

**EN A:** Each shuffle produces a new random order using in-browser randomness.

**AR Q:** هل الخلط العشوائي يتكرر؟

**AR A:** كل خلط ينتج ترتيباً عشوائياً جديداً داخل المتصفح.

### Q3

**EN Q:** Can I remove duplicate lines?

**EN A:** Yes. Turn on Remove duplicates before sorting or shuffling to keep one copy of each line.

**AR Q:** هل يمكن حذف الأسطر المكررة؟

**AR A:** نعم. فعّل «إزالة المكرر» قبل الفرز أو الخلط للإبقاء على نسخة واحدة من كل سطر.

### Q4

**EN Q:** What sort orders are available?

**EN A:** A–Z ascending, Z–A descending, or random shuffle.

**AR Q:** ما أوامر الترتيب المتاحة؟

**AR A:** أ–ي تصاعدياً، ي–أ تنازلياً، أو خلط عشوائي.

**FLAGS:** (none)

---

## word-frequency-counter

### Q1

**EN Q:** Are words case-sensitive?

**EN A:** No. Words are lowercased before counting. Punctuation at word edges is stripped.

**AR Q:** هل الكلمات حساسة لحالة الأحرف؟

**AR A:** لا. تُحوَّل الكلمات إلى أحرف صغيرة قبل العد. تُزال علامات الترقيم عند حواف الكلمة.

### Q2

**EN Q:** Does it support Arabic?

**EN A:** Yes. Arabic and Latin letters are counted after splitting on whitespace and trimming edge punctuation.

**AR Q:** هل يدعم العربية؟

**AR A:** نعم. تُعدّ الأحرف العربية واللاتينية بعد التقسيم عند المسافات وقصّ علامات الترقيم من الأطراف.

### Q3

**EN Q:** How are results sorted?

**EN A:** Highest count first. When two words tie, they sort alphabetically.

**AR Q:** كيف تُرتَّب النتائج؟

**AR A:** الأعلى تكراراً أولاً. عند التعادل تُرتَّب أبجدياً.

### Q4

**EN Q:** Where does counting happen?

**EN A:** Entirely in your browser as you paste or type — your text is not uploaded for analysis.

**AR Q:** أين يتم العد؟

**AR A:** بالكامل داخل متصفحك أثناء اللصق أو الكتابة — لا يُرفع نصك للتحليل.

**FLAGS:** (none)

---

## online-notepad

### Q1

**EN Q:** How does auto-save work?

**EN A:** After you pause typing for a moment, your notes save automatically in this browser on this device. A Saving indicator appears briefly, then Saved. Live word and character counts show above the editor.

**AR Q:** كيف يعمل الحفظ التلقائي؟

**AR A:** بعد توقفك عن الكتابة لبرهة قصيرة، تُحفظ ملاحظاتك تلقائياً في هذا المتصفح على هذا الجهاز. يظهر مؤشر «جاري الحفظ» ثم «تم الحفظ». يظهر عدد الكلمات والأحرف أعلى المحرر.

### Q2

**EN Q:** Can I open my notes on another device?

**EN A:** No. Notes stay in this browser on this device and do not sync across browsers or phones. Copy the text if you need it elsewhere.

**AR Q:** هل يمكنني فتح ملاحظاتي على جهاز آخر؟

**AR A:** لا. تبقى الملاحظات في هذا المتصفح على هذا الجهاز ولا تتزامن عبر المتصفحات أو الهواتف. انسخ النص إن احتجته في مكان آخر.

### Q3

**EN Q:** Will Clear or clearing browser data erase my notes?

**EN A:** Yes. Clear asks for confirmation, then wipes the notepad and deletes the saved copy in this browser. Clearing site data for this site also removes them.

**AR Q:** هل يمحو «مسح» أو مسح بيانات المتصفح ملاحظاتي؟

**AR A:** نعم. يطلب «مسح» تأكيداً ثم يفرّغ المفكرة ويحذف النسخة المحفوظة في هذا المتصفح. مسح بيانات الموقع لهذا الموقع يزيلها أيضاً.

### Q4

**EN Q:** Do my notes leave my device?

**EN A:** No. Your notes are never uploaded — they remain only in this browser on your device until you clear them or remove site data.

**AR Q:** هل تغادر ملاحظاتي جهازي؟

**AR A:** لا. لا تُرفع ملاحظاتك أبداً — تبقى فقط في هذا المتصفح على جهازك حتى تمسحها أو تزيل بيانات الموقع.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q2 ≈ gif-maker Q4
- DUPLICATE privacy filler EN Q2 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q4 ≈ image-color-picker Q4
- DUPLICATE privacy filler EN Q2 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q4 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q2 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2
- DUPLICATE privacy filler EN Q4 ≈ xml-formatter Q4
- DUPLICATE privacy filler EN Q4 ≈ cooking-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ data-unit-converter Q4

---

## text-reverser

### Q1

**EN Q:** Does it work with Arabic?

**EN A:** Yes. Character and word reversal respect Unicode text direction.

**AR Q:** هل يعمل مع العربية؟

**AR A:** نعم. عكس الأحرف والكلمات يحترم اتجاه النص في Unicode.

### Q2

**EN Q:** Are line breaks preserved?

**EN A:** Line-based modes keep newline structure; full reverse flips the entire string.

**AR Q:** هل تُحفظ فواصل الأسطر؟

**AR A:** أوضاع السطر تحافظ على بنية الأسطر؛ العكس الكامل يقلب السلسلة بأكملها.

### Q3

**EN Q:** What reverse modes exist?

**EN A:** Reverse the whole string, reverse line order, or reverse word order while keeping spacing.

**AR Q:** ما أوضاع العكس المتاحة؟

**AR A:** عكس السلسلة كاملة، أو ترتيب الأسطر، أو ترتيب الكلمات مع الإبقاء على المسافات.

### Q4

**EN Q:** Does output update live?

**EN A:** Yes. The reversed text updates as you type or paste.

**AR Q:** هل تتحدّث النتيجة مباشرة؟

**AR A:** نعم. يتحدّث النص المعكوس أثناء الكتابة أو اللصق.

**FLAGS:** (none)

---

## text-to-ascii-art

### Q1

**EN Q:** Does Arabic work?

**EN A:** Pure Arabic input cannot render as ASCII art — the tool explains why and asks for Latin letters. Mixed Arabic/Latin input converts the Latin parts only.

**AR Q:** هل يعمل مع العربية؟

**AR A:** الإدخال العربي الخالص لا يُعرض كفن ASCII — توضّح الأداة السبب وتطلب حروفاً لاتينية. الإدخال المختلط يحوّل الأجزاء اللاتينية فقط.

### Q2

**EN Q:** Which banner styles can I pick?

**EN A:** For Latin text choose Standard, Big, Slant, Banner, or Block styles from the font list.

**AR Q:** ما أنماط اللافتات المتاحة؟

**AR A:** للنص اللاتيني اختر Standard أو Big أو Slant أو Banner أو Block من قائمة الخطوط.

### Q3

**EN Q:** Does it work offline?

**EN A:** After the page loads, generation runs locally without network calls.

**AR Q:** هل يعمل دون اتصال؟

**AR A:** بعد تحميل الصفحة يعمل التوليد محلياً دون طلبات شبكة.

### Q4

**EN Q:** Can I copy or save the result?

**EN A:** Yes. Copy the banner text or download it as a .txt file.

**AR Q:** هل يمكنني نسخ النتيجة أو حفظها؟

**AR A:** نعم. انسخ نص اللافتة أو نزّله كملف .txt.

**FLAGS:** AR-QUALITY

Notes:
- AR Q2: many Latin leftovers (Standard, Slant, Banner, Block…)

---

## character-map

### Q1

**EN Q:** How many symbols are included?

**EN A:** Hundreds of symbols organized in categories including emoji and keyboard key labels for common platforms.

**AR Q:** كم رمزاً مضمناً؟

**AR A:** مئات الرموز في فئات منظّمة تشمل الإيموجي وتسميات مفاتيح لوحات شائعة.

### Q2

**EN Q:** Does copy work on mobile?

**EN A:** Yes. Tap a symbol to copy it when your browser allows clipboard access.

**AR Q:** هل النسخ يعمل على الجوال؟

**AR A:** نعم. انقر الرمز للنسخ عندما يسمح متصفحك بالوصول إلى الحافظة.

### Q3

**EN Q:** Can I search in Arabic?

**EN A:** Yes. Search accepts English and Arabic tags such as heart, arrow, سهم, قلب, or نجمة.

**AR Q:** هل يمكنني البحث بالعربية؟

**AR A:** نعم. البحث يقبل وسوماً بالإنجليزية والعربية مثل heart أو سهم أو قلب أو نجمة.

### Q4

**EN Q:** What categories can I browse?

**EN A:** Arrows, math, currency, emoji, keyboard keys, shapes, Arabic letters, legal marks, and more — or view all at once.

**AR Q:** ما الفئات المتاحة للتصفح؟

**AR A:** أسهم، رياضيات، عملات، إيموجي، مفاتيح لوحة، أشكال، حروف عربية، علامات قانونية، وغيرها — أو اعرض الكل دفعة واحدة.

**FLAGS:** (none)

---

## qr-code-generator

### Q1

**EN Q:** What can I encode in a QR code?

**EN A:** You can encode URLs, plain text, email addresses, phone numbers, and Wi-Fi network details. Keep text reasonably short for reliable scanning.

**AR Q:** ماذا يمكنني ترميزه في رمز QR؟

**AR A:** يمكنك ترميز روابط URL ونصاً عادياً وعناوين بريد إلكتروني وأرقام هواتف وتفاصيل شبكة Wi-Fi. اجعل النص معقول الطول لمسح موثوق.

### Q2

**EN Q:** What is the difference between PNG and SVG?

**EN A:** PNG is a raster image ideal for web and social media. SVG is a vector format that scales to any size without losing quality — great for print.

**AR Q:** ما الفرق بين PNG وSVG؟

**AR A:** PNG صورة نقطية مثالية للويب ووسائل التواصل. SVG صيغة متجهة تتوسع لأي حجم دون فقدان الجودة — ممتازة للطباعة.

### Q3

**EN Q:** Do QR codes expire?

**EN A:** Static QR codes like those generated here never expire. The encoded data is permanent unless you change the destination URL.

**AR Q:** هل تنتهي صلاحية رموز QR؟

**AR A:** رموز QR الثابتة كالتي تُنشأ هنا لا تنتهي أبداً. البيانات المرمّزة دائمة ما لم تغيّر رابط الوجهة.

### Q4

**EN Q:** Is there a size or length limit?

**EN A:** QR codes can hold up to roughly 4,000 characters, but shorter content scans more reliably. Output size is adjustable from 128px to 512px.

**AR Q:** هل يوجد حد للحجم أو الطول؟

**AR A:** يمكن لرموز QR حمل نحو 4,000 حرف، لكن المحتوى الأقصر يُمسَح بموثوقية أكبر. حجم الإخراج قابل للضبط من 128 إلى 512 بكسل.

**FLAGS:** EN-AR-MISMATCH

Notes:
- Q4: numeric mismatch EN[4,000] vs AR[4,000,128,512]

---

## barcode-generator

### Q1

**EN Q:** Which formats need fixed lengths?

**EN A:** EAN13 requires 12 digits; UPC requires 11 digits. CODE128 and CODE39 are more flexible.

**AR Q:** أي الصيغ تحتاج طولاً ثابتاً؟

**AR A:** EAN13 يحتاج 12 رقماً؛ UPC يحتاج 11. CODE128 وCODE39 أكثر مرونة.

### Q2

**EN Q:** Can I download the barcode as PNG?

**EN A:** Yes. Preview as SVG or canvas, then use Download PNG to save a white-background image.

**AR Q:** هل يمكنني تنزيل الرمز كـ PNG؟

**AR A:** نعم. اعرضه كـ SVG أو لوحة رسم، ثم استخدم «تنزيل PNG» لحفظ صورة بخلفية بيضاء.

### Q3

**EN Q:** What happens if the value is invalid for the format?

**EN A:** An error message appears and the preview clears until you enter a valid value for the selected format.

**AR Q:** ماذا يحدث إذا كانت القيمة غير صالحة للصيغة؟

**AR A:** تظهر رسالة خطأ ويُمسح المعاينة حتى تدخل قيمة صالحة للصيغة المختارة.

### Q4

**EN Q:** Is generation local?

**EN A:** Yes. Barcodes render in your browser; your text is never uploaded.

**AR Q:** هل التوليد محلي؟

**AR A:** نعم. يُرسم الرمز في متصفحك؛ لا يُرفع النص أبداً.

**FLAGS:** TECH-JARGON

Notes:
- EN Q2: mentions `canvas`

---

## json-formatter

### Q1

**EN Q:** How does JSON validation work?

**EN A:** The tool parses your input with JSON.parse(). If syntax is invalid, you see an error message with the approximate line where the problem occurs.

**AR Q:** كيف يعمل التحقق من JSON؟

**AR A:** تحلل الأداة مدخلاتك بـ JSON.parse(). إذا كان التركيب غير صالح، ترى رسالة خطأ مع السطر التقريبي للمشكلة.

### Q2

**EN Q:** Can I format large JSON files?

**EN A:** Yes, though very large files (several megabytes) may take a moment to process depending on your browser.

**AR Q:** هل يمكنني تنسيق ملفات JSON كبيرة؟

**AR A:** نعم، رغم أن الملفات الضخمة جداً (عدة ميغابايت) قد تستغرق لحظة حسب متصفحك.

### Q3

**EN Q:** Does this support JSON with comments?

**EN A:** Standard JSON does not allow comments. If your input contains comments or trailing commas, the validator will report an error.

**AR Q:** هل يدعم JSON مع تعليقات؟

**AR A:** JSON القياسي لا يسمح بالتعليقات. إذا احتوى مدخلك على تعليقات أو فواصل زائدة، سيُبلّغ المُحقّق عن خطأ.

### Q4

**EN Q:** Is my JSON data sent anywhere?

**EN A:** No. All parsing and formatting happens locally in your browser. Your data never leaves your device.

**AR Q:** هل تُرسل بيانات JSON إلى أي مكان؟

**AR A:** لا. يتم التحليل والتنسيق محلياً في متصفحك. بياناتك لا تغادر جهازك.

**FLAGS:** (none)

---

## base64

### Q1

**EN Q:** What is Base64 encoding used for?

**EN A:** Base64 converts binary data into ASCII text. It is commonly used to embed images in HTML/CSS, send binary data in JSON APIs, and encode credentials.

**AR Q:** لماذا يُستخدم ترميز Base64؟

**AR A:** Base64 يحوّل البيانات الثنائية إلى نص ASCII. يُستخدم شائعاً لتضمين الصور في HTML/CSS وإرسال بيانات ثنائية في واجهات JSON وترميز بيانات الاعتماد.

### Q2

**EN Q:** Can I decode an image from Base64?

**EN A:** This tool decodes Base64 text to plain text. For image data URIs (data:image/...), the decoded output is binary — use the encode direction to create them from files.

**AR Q:** هل يمكنني فك تشفير صورة من Base64؟

**AR A:** هذه الأداة تفك تشفير نص Base64 إلى نص عادي. لعناوين بيانات الصور (data:image/...)، المخرج المفكوك ثنائي — استخدم اتجاه التشفير لإنشائها من الملفات.

### Q3

**EN Q:** Does Base64 encryption make data secure?

**EN A:** No. Base64 is encoding, not encryption. Anyone can decode it. Do not use it as a security measure.

**AR Q:** هل يجعل Base64 البيانات آمناً؟

**AR A:** لا. Base64 ترميز وليس تشفيراً. يمكن لأي شخص فكّه. لا تستخدمه كإجراء أمني.

### Q4

**EN Q:** What character encoding is used?

**EN A:** Text is encoded using UTF-8 before Base64 conversion, which correctly handles international characters and emoji.

**AR Q:** ما ترميز الأحرف المستخدم؟

**AR A:** يُشفَّر النص باستخدام UTF-8 قبل تحويل Base64، ما يتعامل بشكل صحيح مع الأحرف الدولية والرموز التعبيرية.

**FLAGS:** (none)

---

## hash-generator

### Q1

**EN Q:** Are hashes computed locally?

**EN A:** Yes. All hashes are computed locally in your browser. Nothing is sent online.

**AR Q:** هل تُحسب التجزئات محلياً؟

**AR A:** نعم. تُحسب جميع التجزئات محلياً في متصفحك. لا يُرسل شيء عبر الإنترنت.

### Q2

**EN Q:** Which hash should I use?

**EN A:** SHA-256 is the modern default for integrity checks. MD5 and SHA-1 are legacy and not recommended for security.

**AR Q:** أي تجزئة يجب أن أستخدم؟

**AR A:** SHA-256 هو الافتراضي الحديث لفحوص السلامة. MD5 وSHA-1 قديمة ولا يُنصح بها للأمان.

### Q3

**EN Q:** Does an empty input produce hashes?

**EN A:** Hashes appear only when text is entered. Clearing the input clears all results.

**AR Q:** هل يُنتج الإدخال الفارغ تجزئات؟

**AR A:** تظهر التجزئات فقط عند إدخال نص. مسح الإدخال يمسح جميع النتائج.

### Q4

**EN Q:** Can I hash files?

**EN A:** This tool hashes text input only. Paste file contents as text, or use a dedicated file checksum tool for binaries.

**AR Q:** هل يمكنني تجزئة الملفات؟

**AR A:** هذه الأداة تجزّئ إدخال النص فقط. الصق محتوى الملف كنص، أو استخدم أداة مجموع تحقق مخصصة للملفات الثنائية.

**FLAGS:** (none)

---

## uuid-generator

### Q1

**EN Q:** Which UUID version?

**EN A:** Version 4 (random) IDs from your browser's built-in secure random generator.

**AR Q:** أي إصدار UUID؟

**AR A:** معرفات الإصدار 4 (عشوائية) من مولّد الأرقام العشوائية الآمن المدمج في متصفحك.

### Q2

**EN Q:** Are UUIDs unique?

**EN A:** Collision probability is negligible for practical use.

**AR Q:** هل المعرفات فريدة؟

**AR A:** احتمال التصادم ضئيل جداً للاستخدام العملي.

### Q3

**EN Q:** How many can I generate at once?

**EN A:** Choose 1–20 from the count dropdown, then click Generate.

**AR Q:** كم يمكنني توليد دفعة واحدة؟

**AR A:** اختر من 1 إلى 20 من القائمة، ثم انقر إنشاء.

### Q4

**EN Q:** Can I copy all results?

**EN A:** Yes. Copy all puts every UUID on its own line.

**AR Q:** هل يمكنني نسخ كل النتائج؟

**AR A:** نعم. نسخ الكل يضع كل معرف في سطر منفصل.

**FLAGS:** (none)

---

## color-picker

### Q1

**EN Q:** What is the difference between HEX, RGB, and HSL?

**EN A:** HEX uses a six-digit hexadecimal code (#RRGGBB). RGB defines red, green, and blue channels from 0–255. HSL uses hue, saturation, and lightness, which many designers find more intuitive for adjustments.

**AR Q:** ما الفرق بين HEX وRGB وHSL؟

**AR A:** HEX يستخدم رمزاً سداسياً عشرياً من ستة أرقام (#RRGGBB). RGB يحدد قنوات الأحمر والأخضر والأزرق من 0–255. HSL يستخدم التدرج والتشبع والإضاءة، وهو أكثر بديهية للعديد من المصممين عند التعديل.

### Q2

**EN Q:** Can I enter a HEX code directly?

**EN A:** Yes. Type or paste any valid HEX code (with or without the #) and the picker, RGB, and HSL values update automatically.

**AR Q:** هل يمكنني إدخال رمز HEX مباشرة؟

**AR A:** نعم. اكتب أو الصق أي رمز HEX صالح (مع أو بدون #) وتتحدّث قيم المنتقي وRGB وHSL تلقائياً.

### Q3

**EN Q:** Are the conversions accurate?

**EN A:** Yes. Conversions use standard color space math. RGB and HSL values are rounded to whole numbers for practical use in CSS.

**AR Q:** هل التحويلات دقيقة؟

**AR A:** نعم. تستخدم التحويلات رياضيات فضاء الألوان القياسية. قيم RGB وHSL تُقرَّب لأعداد صحيحة للاستخدام العملي في CSS.

### Q4

**EN Q:** Can I use these values in CSS?

**EN A:** Absolutely. Copy HEX as #rrggbb, RGB as rgb(r, g, b), or HSL as hsl(h, s%, l%) — all are valid CSS color formats.

**AR Q:** هل يمكنني استخدام هذه القيم في CSS؟

**AR A:** بالتأكيد. انسخ HEX كـ #rrggbb أو RGB كـ rgb(r, g, b) أو HSL كـ hsl(h, s%, l%) — جميعها صيغ ألوان CSS صالحة.

**FLAGS:** (none)

---

## color-code-converter

### Q1

**EN Q:** Supported inputs?

**EN A:** HEX (#RRGGBB), rgb(), and hsl() strings.

**AR Q:** ما المدخلات المدعومة؟

**AR A:** HEX (#RRGGBB) وrgb() وhsl().

### Q2

**EN Q:** Different from color picker?

**EN A:** This tool converts typed values; the picker is for visual selection.

**AR Q:** يختلف عن منتقي الألوان؟

**AR A:** هذه الأداة تحوّل قيماً مكتوبة؛ المنتقي للاختيار البصري.

### Q3

**EN Q:** What outputs do I get?

**EN A:** Matching HEX, RGB, HSL, and HSV values with copy buttons for each.

**AR Q:** ما المخرجات التي أحصل عليها؟

**AR A:** قيم HEX وRGB وHSL وHSV مطابقة مع أزرار نسخ لكل منها.

### Q4

**EN Q:** Does conversion update live?

**EN A:** Yes. Valid typed colors update all formats as you edit.

**AR Q:** هل يتحدّث التحويل مباشرة؟

**AR A:** نعم. الألوان الصالحة المكتوبة تُحدّث كل الصيغ أثناء التعديل.

**FLAGS:** (none)

---

## color-palette-generator

### Q1

**EN Q:** How is this different from the color picker?

**EN A:** This tool generates full harmonious palettes, not just a single color.

**AR Q:** ما الفرق عن منتقي الألوان؟

**AR A:** هنا تُولَّد لوحات متناسقة كاملة وليس لوناً واحداً.

### Q2

**EN Q:** Are colors accessible?

**EN A:** Check contrast manually before using text/background pairs in production UI.

**AR Q:** هل الألوان مناسبة لإمكانية الوصول؟

**AR A:** تحقق من التباين يدوياً قبل استخدام أزواج نص/خلفية في واجهات الإنتاج.

### Q3

**EN Q:** Which harmony modes exist?

**EN A:** Complementary, analogous, or triadic schemes from one base color.

**AR Q:** ما أوضاع التناسق المتاحة؟

**AR A:** تكاملي، متجاور، أو ثلاثي من لون أساس واحد.

### Q4

**EN Q:** How do I copy a swatch?

**EN A:** Click any palette square to copy its HEX code.

**AR Q:** كيف أنسخ لوناً من اللوحة؟

**AR A:** انقر أي مربع في اللوحة لنسخ رمز HEX.

**FLAGS:** (none)

---

## regex-tester

### Q1

**EN Q:** Which regex flags are supported?

**EN A:** g, i, m, s, u, and y — toggle them below the pattern field to change matching behavior.

**AR Q:** ما أعلام regex المدعومة؟

**AR A:** g وi وm وs وu وy — بدّلها أسفل حقل النمط لتغيير سلوك المطابقة.

### Q2

**EN Q:** What if my pattern is invalid?

**EN A:** Invalid syntax shows a clear error message without breaking the page. Fix the pattern and testing resumes automatically.

**AR Q:** ماذا لو كان النمط غير صالح؟

**AR A:** تظهر رسالة خطأ واضحة دون تعطيل الصفحة. صحّح النمط ويستأنف الاختبار تلقائياً.

### Q3

**EN Q:** How are global (g) matches handled?

**EN A:** With the g flag, all non-overlapping matches are found. Empty matches advance the search index to avoid infinite loops.

**AR Q:** كيف تُعالَج التطابقات مع علم g؟

**AR A:** مع g تُجمع كل التطابقات غير المتداخلة. التطابقات الفارغة تُقدِّم مؤشر البحث لتجنب حلقات لا نهائية.

### Q4

**EN Q:** Can I try quick examples?

**EN A:** Yes. Use the example buttons for email, phone, and URL patterns to fill the pattern and test text instantly.

**AR Q:** هل توجد أمثلة جاهزة؟

**AR A:** نعم. أزرار البريد والهاتف والرابط تملأ النمط والنص للتجربة السريعة.

**FLAGS:** (none)

---

## jwt-decoder

### Q1

**EN Q:** Does this verify the JWT signature?

**EN A:** No. It only decodes the header and payload locally in your browser. Your token is never sent to a server.

**AR Q:** هل تتحقق الأداة من توقيع JWT؟

**AR A:** لا. تفكّ الرأس والحمولة محلياً في متصفحك فقط. لا يُرسل التوكن إلى أي خادم.

### Q2

**EN Q:** Which time claims are highlighted?

**EN A:** exp, iat, and nbf show human-readable dates. Past exp values get an expired badge — that reflects the timestamp only, not signature verification.

**AR Q:** ما مطالبات الوقت التي تُبرز؟

**AR A:** exp وiat وnbf تظهر بتواريخ مقروءة. قيم exp في الماضي تحصل على شارة «منتهي» — ذلك يعكس الطابع الزمني فقط وليس التحقق من التوقيع.

### Q3

**EN Q:** What is Base64URL?

**EN A:** JWTs use Base64URL encoding (not standard Base64). Dashes and underscores replace plus and slash, and padding may be omitted.

**AR Q:** ما هو Base64URL؟

**AR A:** JWT يستخدم ترميز Base64URL وليس Base64 العادي — شرطات وشرطات سفلية بدل + و / وقد يُحذف الحشو.

### Q4

**EN Q:** Why does my token show as expired?

**EN A:** If the exp (expiration) claim is in the past, the tool labels it expired. That does not mean the token was verified — only that the timestamp has passed.

**AR Q:** لماذا يظهر التوكن منتهياً؟

**AR A:** إذا كان exp في الماضي تُعرض شارة منتهي. هذا لا يعني تحققاً من التوقيع — فقط أن الطابع الزمني انقضى.

**FLAGS:** (none)

---

## csv-json-converter

### Q1

**EN Q:** Can I change the CSV delimiter?

**EN A:** Yes. Pick comma, semicolon, or tab before converting CSV to JSON.

**AR Q:** هل يمكنني تغيير فاصل CSV؟

**AR A:** نعم. اختر فاصلة أو فاصلة منقوطة أو Tab قبل تحويل CSV إلى JSON.

### Q2

**EN Q:** How are CSV headers handled?

**EN A:** The first row of CSV is treated as column headers. Each following row becomes a JSON object with those keys.

**AR Q:** كيف تُعالَج رؤوس CSV؟

**AR A:** السطر الأول يُعتبر رؤوس أعمدة. كل سطر لاحق يصبح كائناً JSON بمفاتيح تلك الرؤوس.

### Q3

**EN Q:** What JSON format is required for CSV output?

**EN A:** JSON to CSV expects an array of objects. Each object's keys become column headers.

**AR Q:** ما صيغة JSON المطلوبة لإخراج CSV؟

**AR A:** يتوقع JSON مصفوفة من كائنات. مفاتيح كل كائن تصبح أعمدة CSV.

### Q4

**EN Q:** Are quoted fields supported?

**EN A:** Yes. Fields wrapped in double quotes can contain delimiters and line breaks. Escaped quotes ("") are supported.

**AR Q:** هل تدعم الحقول بين علامات اقتباس؟

**AR A:** نعم. الحقول بين " " يمكن أن تحتوي فواصل وأسطراً جديدة، مع دعم "" للاقتباس المزدوج.

**FLAGS:** (none)

---

## json-to-typescript

### Q1

**EN Q:** Nested objects?

**EN A:** Each nested object becomes a named interface derived from its key.

**AR Q:** كائنات متداخلة؟

**AR A:** كل كائن متداخل يصبح واجهة مسماة من مفتاحه.

### Q2

**EN Q:** Arrays?

**EN A:** Homogeneous arrays use element types; object arrays get dedicated interfaces.

**AR Q:** المصفوفات؟

**AR A:** المصفوفات المتجانسة تستخدم نوع العنصر؛ مصفوفات الكائنات تحصل على واجهات مخصصة.

### Q3

**EN Q:** Can I name the root interface?

**EN A:** Yes. Set the root name field before clicking Convert.

**AR Q:** هل يمكنني تسمية الواجهة الجذرية؟

**AR A:** نعم. عيّن حقل الاسم الجذري قبل النقر على تحويل.

### Q4

**EN Q:** What if JSON is invalid?

**EN A:** An error message appears and no TypeScript is generated until the JSON parses.

**AR Q:** ماذا يحدث إذا كان JSON غير صالح؟

**AR A:** تظهر رسالة خطأ ولا يُولَّد TypeScript حتى يُحلَّل JSON بنجاح.

**FLAGS:** (none)

---

## url-encoder-decoder

### Q1

**EN Q:** Which encoding is used?

**EN A:** Standard percent-encoding for URL components — the same rules browsers use for encodeURIComponent.

**AR Q:** أي ترميز يُستخدم؟

**AR A:** ترميز نسبي قياسي لمكوّنات URL — نفس قواعد encodeURIComponent في المتصفح.

### Q2

**EN Q:** Spaces in URLs?

**EN A:** Encoded as %20 when encoding text for URL components.

**AR Q:** المسافات في الروابط؟

**AR A:** تُرمَّز %20 عند ترميز النص لمكوّنات URL.

### Q3

**EN Q:** Can I switch encode and decode?

**EN A:** Yes. Toggle modes at the top; switching clears the input so you start fresh.

**AR Q:** هل يمكن التبديل بين الترميز وفك الترميز؟

**AR A:** نعم. بدّل الوضع في الأعلى؛ التبديل يمسح الإدخال لتبدأ من جديد.

### Q4

**EN Q:** What if decoding fails?

**EN A:** Invalid percent-sequences show an error instead of partial output.

**AR Q:** ماذا يحدث إذا فشل فك الترميز؟

**AR A:** تسلسلات النسبة غير الصالحة تعرض خطأ بدلاً من مخرجات جزئية.

**FLAGS:** (none)

---

## css-minifier

### Q1

**EN Q:** Is minification lossless?

**EN A:** Yes. Comments and whitespace are removed; rules stay functionally the same.

**AR Q:** هل الضغط بدون فقد؟

**AR A:** نعم. تُزال التعليقات والمسافات وتبقى القواعد كما هي وظيفياً.

### Q2

**EN Q:** Does it run locally?

**EN A:** All processing happens in your browser.

**AR Q:** هل يعمل محلياً؟

**AR A:** كل المعالجة في متصفحك.

### Q3

**EN Q:** Can I beautify as well as minify?

**EN A:** Yes. Switch between Format (readable) and Minify modes before copying output.

**AR Q:** هل يمكن التنسيق والضغط معاً؟

**AR A:** نعم. بدّل بين وضع التنسيق (مقروء) والضغط قبل نسخ المخرجات.

### Q4

**EN Q:** Is my stylesheet uploaded?

**EN A:** No. Paste stays on your device for the whole session.

**AR Q:** هل تُرفع stylesheet؟

**AR A:** لا. يبقى ما تلصقه على جهازك طوال الجلسة.

**FLAGS:** PRIVACY-REDUNDANT

Notes:
- AR has 2 privacy/safety FAQs (Q2, Q4)

---

## js-minifier

### Q1

**EN Q:** What does minify do to my script?

**EN A:** It removes whitespace and shortens names where safe, then shows the compressed output to copy.

**AR Q:** ماذا يفعل الضغط بسكربتي؟

**AR A:** يزيل المسافات ويختصر الأسماء حيث أمكن، ثم يعرض المخرجات المضغوطة للنسخ.

### Q2

**EN Q:** Is my code uploaded?

**EN A:** No. Minification runs entirely in your browser after you click Minify.

**AR Q:** هل يُرفع كودي؟

**AR A:** لا. يعمل الضغط بالكامل في متصفحك بعد النقر على ضغط.

### Q3

**EN Q:** When does minification start?

**EN A:** After you paste code and click Minify — there is no automatic run on every keystroke.

**AR Q:** متى يبدأ الضغط؟

**AR A:** بعد لصق الكود والنقر على ضغط — لا يعمل تلقائياً مع كل حرف.

### Q4

**EN Q:** What if minification fails?

**EN A:** A syntax error message appears; fix the script and try Minify again.

**AR Q:** ماذا يحدث إذا فشل الضغط؟

**AR A:** تظهر رسالة خطأ في الصياغة؛ صحّح السكربت وحاول الضغط مجدداً.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q2 ≈ exif-remover Q4
- DUPLICATE privacy filler EN Q2 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q2 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q2 ≈ xml-formatter Q4
- DUPLICATE privacy filler EN Q2 ≈ cooking-converter Q4
- DUPLICATE privacy filler EN Q2 ≈ data-unit-converter Q4
- DUPLICATE privacy filler EN Q2 ≈ file-size-converter Q4
- EN has 2 privacy/safety FAQs (Q1, Q2)

---

## xml-formatter

### Q1

**EN Q:** Does it validate XML?

**EN A:** It formats structure visually but does not perform full schema validation.

**AR Q:** هل يتحقق من صحة XML؟

**AR A:** ينسّق البنية بصرياً دون تحقق schema كامل.

### Q2

**EN Q:** Can I minify for APIs?

**EN A:** Yes. Minify removes extra whitespace between tags.

**AR Q:** هل يمكن الضغط للـ APIs؟

**AR A:** نعم. الضغط يزيل المسافات الزائدة بين الوسوم.

### Q3

**EN Q:** Can I beautify and minify?

**EN A:** Yes. Choose Format for indented output or Minify for a compact single-line style.

**AR Q:** هل يمكن التنسيق والضغط؟

**AR A:** نعم. اختر تنسيقاً بمسافات بادئة أو ضغطاً بسطر واحد مدمج.

### Q4

**EN Q:** Is my XML sent to a server?

**EN A:** No. Formatting and minify run locally in your browser.

**AR Q:** هل يُرسل XML إلى خادم؟

**AR A:** لا. التنسيق والضغط يعملان محلياً في متصفحك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ remove-line-breaks Q4
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2

---

## sql-formatter

### Q1

**EN Q:** Which SQL dialect is supported?

**EN A:** Standard SQL formatting that works well for common read and write statements such as SELECT, INSERT, and UPDATE.

**AR Q:** أي لهجة SQL مدعومة؟

**AR A:** تنسيق SQL قياسي يناسب عبارات القراءة والكتابة الشائعة مثل SELECT وINSERT وUPDATE.

### Q2

**EN Q:** Do I need to click Format?

**EN A:** Yes. Paste your query, click Format, then copy the indented output.

**AR Q:** هل أحتاج للنقر على تنسيق؟

**AR A:** نعم. الصق الاستعلام، انقر تنسيق، ثم انسخ المخرجات بمسافات بادئة.

### Q3

**EN Q:** What if formatting fails?

**EN A:** An error message appears. Fix the query syntax and try Format again.

**AR Q:** ماذا يحدث إذا فشل التنسيق؟

**AR A:** تظهر رسالة خطأ. صحّح صياغة الاستعلام وحاول التنسيق مجدداً.

### Q4

**EN Q:** Is my query logged anywhere?

**EN A:** No. Formatting runs locally in your browser after you click Format.

**AR Q:** هل يُسجَّل استعلامي في أي مكان؟

**AR A:** لا. يعمل التنسيق محلياً في متصفحك بعد النقر على تنسيق.

**FLAGS:** AR-QUALITY

Notes:
- AR Q1: many Latin leftovers (SELECT, INSERT, UPDATE…)

---

## gradient-generator

### Q1

**EN Q:** What CSS does this gradient generator output?

**EN A:** It produces a complete background declaration — either linear-gradient(angle, colors) or radial-gradient(circle, colors) — ready to paste into your CSS.

**AR Q:** ما CSS الذي يُخرجه مولّد التدرجات؟

**AR A:** ينتج إعلان خلفية كاملاً — إما تدرجاً خطياً (زاوية، ألوان) أو تدرجاً دائرياً (دائرة، ألوان) — جاهزاً للصق في CSS.

### Q2

**EN Q:** How many color stops can I use?

**EN A:** You can use between two and six colors. Add stops with the plus button and remove extras with the trash icon (minimum two colors).

**AR Q:** كم نقطة لون يمكنني استخدامها؟

**AR A:** يمكنك استخدام بين لونين وستة ألوان. أضف نقاطاً بزر الزائد وأزل الزائد بأيقونة سلة المهملات (حد أدنى لونان).

### Q3

**EN Q:** What does the angle setting do?

**EN A:** For linear gradients, the angle in degrees controls direction — 0° points upward, 90° to the right, and 180° downward. Radial gradients ignore the angle.

**AR Q:** ماذا يفعل إعداد الزاوية؟

**AR A:** للتدرجات الخطية، الزاوية بالدرجات تتحكم بالاتجاه — 0° للأعلى، 90° لليمين، و180° للأسفل. التدرجات الدائرية تتجاهل الزاوية.

### Q4

**EN Q:** Can I use the CSS in Tailwind or React?

**EN A:** Yes. Paste the background value into your CSS file, use it as an inline style in React, or wrap it in Tailwind's arbitrary value syntax.

**AR Q:** هل يمكنني استخدام CSS في Tailwind أو React؟

**AR A:** نعم. الصق قيمة الخلفية في ملف CSS أو استخدمها كنمط مضمن في React أو ضمّنها في صيغة القيمة التعسفية في Tailwind.

**FLAGS:** (none)

---

## box-shadow-generator

### Q1

**EN Q:** Does it support multiple shadows?

**EN A:** This tool generates a single shadow layer. Duplicate the rule for stacked shadows.

**AR Q:** هل يدعم ظلالاً متعددة؟

**AR A:** هذه الأداة تولّد طبقة ظل واحدة. كرّر القاعدة للتكديس.

### Q2

**EN Q:** What color format works?

**EN A:** Any valid CSS color, including hex with alpha like #00000040.

**AR Q:** ما صيغ الألوان المدعومة؟

**AR A:** أي لون CSS صالح، بما فيها hex مع شفافية مثل #00000040.

### Q3

**EN Q:** Can I make an inset shadow?

**EN A:** Yes. Toggle Inset to draw the shadow inside the preview card.

**AR Q:** هل يمكنني ظل داخلي؟

**AR A:** نعم. فعّل Inset لرسم الظل داخل بطاقة المعاينة.

### Q4

**EN Q:** What does the preview show?

**EN A:** A live card with adjustable offset, blur, spread, shadow color/opacity, and optional inset.

**AR Q:** ماذا تعرض المعاينة؟

**AR A:** بطاقة حية مع إزاحة وضبابية وانتشار ولون/شفافية الظل وخيار inset.

**FLAGS:** (none)

---

## glassmorphism-generator

### Q1

**EN Q:** Which browsers support the glass effect?

**EN A:** Frosted-glass blur works in current Chromium, Safari, and Firefox versions.

**AR Q:** أي المتصفحات تدعم تأثير الزجاج؟

**AR A:** تأثير الزجاج المعتم يعمل في إصدارات Chromium وSafari وFirefox الحديثة.

### Q2

**EN Q:** Can I use it on any element?

**EN A:** Yes. Apply the copied CSS to cards, modals, or nav bars over colorful backgrounds.

**AR Q:** هل يمكنني استخدامه على أي عنصر؟

**AR A:** نعم. طبّق CSS المنسوخ على بطاقات أو نوافذ أو شريط تنقل فوق خلفيات ملونة.

### Q3

**EN Q:** What can I adjust?

**EN A:** Blur (4–40px), panel opacity, border width, and the backdrop gradient color behind the preview.

**AR Q:** ما الذي يمكن ضبطه؟

**AR A:** الضبابية (4–40 بكسل)، شفافية اللوحة، عرض الحد، ولون التدرج الخلفي خلف المعاينة.

### Q4

**EN Q:** What CSS is copied?

**EN A:** Background, backdrop-filter, border, and border-radius rules ready to paste.

**AR Q:** ما CSS الذي يُنسخ؟

**AR A:** قواعد الخلفية ومرشّح الخلفية والحد ونصف قطر الزوايا جاهزة للصق.

**FLAGS:** AR-QUALITY, EN-AR-MISMATCH

Notes:
- AR Q1: many Latin leftovers (Chromium, Safari, Firefox…)
- Q3: numeric mismatch EN[4] vs AR[4,40]

---

## svg-pattern-generator

### Q1

**EN Q:** Is the pattern an SVG?

**EN A:** Yes. It is embedded as a data-URI SVG in the CSS background.

**AR Q:** هل النمط SVG؟

**AR A:** نعم، مضمّن كـ data-URI في خلفية CSS.

### Q2

**EN Q:** Can I use it commercially?

**EN A:** Patterns you generate are yours to use freely.

**AR Q:** هل يمكن الاستخدام التجاري؟

**AR A:** الأنماط التي تولّدها ملكك للاستخدام بحرية.

### Q3

**EN Q:** Which pattern styles exist?

**EN A:** Dots, lines, or grid — each tiles as a CSS background.

**AR Q:** ما أنماط النمط المتاحة؟

**AR A:** نقاط أو خطوط أو شبكة — كل منها يتكرر كخلفية CSS.

### Q4

**EN Q:** Can I adjust tile size and colors?

**EN A:** Yes. Change pattern color, background color, and tile size before copying the CSS.

**AR Q:** هل يمكن ضبط حجم البلاطة والألوان؟

**AR A:** نعم. غيّر لون النمط ولون الخلفية وحجم البلاطة قبل نسخ CSS.

**FLAGS:** (none)

---

## og-image-generator

### Q1

**EN Q:** What size is OG standard?

**EN A:** 1200×630 pixels is the recommended Open Graph image size.

**AR Q:** ما الحجم القياسي؟

**AR A:** 1200×630 بكسل لصور Open Graph.

### Q2

**EN Q:** Can I use custom fonts?

**EN A:** Latin text uses system UI fonts. Arabic titles automatically use Noto Sans Arabic when Arabic characters are detected — you cannot upload your own font files.

**AR Q:** هل يمكنني استخدام خطوط مخصصة؟

**AR A:** النص اللاتيني يستخدم خطوط النظام. العناوين العربية تستخدم Noto Sans Arabic تلقائياً عند وجود حروف عربية — لا يمكن رفع ملفات خطوط خاصة.

### Q3

**EN Q:** What can I customize?

**EN A:** Title, subtitle, background color, and text colors with a live preview.

**AR Q:** ما الذي يمكن تخصيصه؟

**AR A:** العنوان والعنوان الفرعي ولون الخلفية وألوان النص مع معاينة مباشرة.

### Q4

**EN Q:** What format downloads?

**EN A:** PNG at 1200×630 matching the preview.

**AR Q:** بأي صيغة يُنزَّل الملف؟

**AR A:** PNG بحجم 1200×630 مطابق للمعاينة.

**FLAGS:** AR-QUALITY

Notes:
- AR Q2: many Latin leftovers (Noto, Sans, Arabic…)

---

## favicon-generator

### Q1

**EN Q:** Which sizes are included?

**EN A:** 16, 32, 48, 192, and 512 pixel PNG files.

**AR Q:** ما الأحجام المضمنة؟

**AR A:** 16 و32 و48 و192 و512 بكسل PNG.

### Q2

**EN Q:** Do I need a square image?

**EN A:** Square sources work best; non-square images are scaled to fit.

**AR Q:** هل يلزم صورة مربعة؟

**AR A:** مربعة أفضل؛ غير المربع يُقصّ ليناسب.

### Q3

**EN Q:** How do I get all sizes?

**EN A:** Upload once and download a ZIP containing every PNG size.

**AR Q:** كيف أحصل على كل الأحجام؟

**AR A:** ارفع مرة واحدة ونزّل ZIP يحتوي كل مقاس PNG.

### Q4

**EN Q:** Which source formats work?

**EN A:** Common image types your browser can read, such as PNG or JPG.

**AR Q:** ما صيغ المصدر المدعومة؟

**AR A:** صيغ شائعة يقرأها متصفحك مثل PNG أو JPG.

**FLAGS:** (none)

---

## meta-tag-generator

### Q1

**EN Q:** Which tags are included?

**EN A:** Page title, meta description, canonical link, Open Graph tags (og:*), and Twitter Card tags (twitter:*).

**AR Q:** ما الوسوم المضمنة؟

**AR A:** عنوان الصفحة، الوصف، الرابط الأساسي، وسوم Open Graph (og:*)، ووسوم Twitter Card (twitter:*).

### Q2

**EN Q:** Do I need all fields?

**EN A:** Fill what you have; empty fields are omitted from output.

**AR Q:** هل أحتاج كل الحقول؟

**AR A:** املأ ما لديك؛ الحقول الفارغة تُستثنى من المخرجات.

### Q3

**EN Q:** Is a Twitter card set automatically?

**EN A:** When you add an image URL, twitter:card is set to summary_large_image in the output.

**AR Q:** هل يُضبط بطاقة Twitter تلقائياً؟

**AR A:** عند إضافة رابط صورة، يُضبط twitter:card على summary_large_image في المخرجات.

### Q4

**EN Q:** Where do I paste the output?

**EN A:** Inside the <head> section of your HTML page.

**AR Q:** أين ألصق المخرجات؟

**AR A:** داخل قسم <head> في صفحة HTML.

**FLAGS:** AR-QUALITY

Notes:
- AR Q1: many Latin leftovers (Open, Graph, Twitter, Card, twitter…)

---

## interaction-fx

### Q1

**EN Q:** Does exported code work on touch screens?

**EN A:** Yes. The press-effect snippet responds to both taps and mouse clicks.

**AR Q:** هل يعمل الكود المُصدَّر على الشاشات اللمسية؟

**AR A:** نعم. مقطع تأثير الضغط يستجيب للنقر باللمس والفأرة معاً.

### Q2

**EN Q:** Can I attach the press effect to my own button?

**EN A:** Yes. Call attachPressEffect on the element you want from the exported snippet.

**AR Q:** هل يمكن ربط تأثير الضغط بزرّي؟

**AR A:** نعم. استدعِ attachPressEffect على العنصر المطلوب من المقطع المُصدَّر.

### Q3

**EN Q:** Which press effect patterns are available?

**EN A:** Ripple, burst, shockwave, ring pulse, and ink spread — each with adjustable color, duration, and size.

**AR Q:** ما أنماط تأثير الضغط المتاحة؟

**AR A:** تموج، انفجار، موجة صدمية، نبض حلقي، وانتشار حبر — لكل منها لون ومدة وحجم قابلان للضبط.

### Q4

**EN Q:** Can I customize cursor motion too?

**EN A:** Yes. Pick dot, trail, glow, or ring presets and tune color and size, then copy or download both effects together.

**AR Q:** هل يمكن تخصيص حركة المؤشر أيضاً؟

**AR A:** نعم. اختر إعداداً مسبقاً (نقطة، أثر، توهج، أو حلقة) واضبط اللون والحجم، ثم انسخ أو نزّل التأثيرين معاً.

**FLAGS:** (none)

---

## htaccess-redirect-generator

### Q1

**EN Q:** Does this work on Nginx?

**EN A:** These are Apache mod_rewrite rules. Nginx uses a different syntax.

**AR Q:** هل يعمل على Nginx؟

**AR A:** هذه قواعد Apache mod_rewrite. Nginx يستخدم صيغة مختلفة.

### Q2

**EN Q:** Paths with trailing slash?

**EN A:** Rules match optional trailing slashes on the source path.

**AR Q:** المسارات مع شرطة مائلة؟

**AR A:** القواعد تطابق شرطة مائلة اختيارية في نهاية المسار المصدر.

### Q3

**EN Q:** 301 or 302?

**EN A:** Pick permanent (301) or temporary (302) before copying the rule.

**AR Q:** 301 أم 302؟

**AR A:** اختر دائم (301) أو مؤقت (302) قبل نسخ القاعدة.

### Q4

**EN Q:** What do I enter for paths?

**EN A:** Old and new URL paths — the tool outputs ready-to-paste .htaccess lines.

**AR Q:** ماذا أدخل للمسارات؟

**AR A:** المسار القديم والجديد — تُخرج الأداة أسطر .htaccess جاهزة للصق.

**FLAGS:** (none)

---

## cron-expression-parser

### Q1

**EN Q:** How many fields?

**EN A:** Five: minute, hour, day-of-month, month, day-of-week.

**AR Q:** كم عدد الحقول؟

**AR A:** خمسة: الدقيقة، الساعة، يوم الشهر، الشهر، يوم الأسبوع.

### Q2

**EN Q:** Example: 0 9 * * 1?

**EN A:** Runs at 9:00 AM every Monday.

**AR Q:** مثال: 0 9 * * 1؟

**AR A:** يعمل الساعة 9:00 صباحاً كل يوم اثنين.

### Q3

**EN Q:** Does description update live?

**EN A:** Yes. The plain-English summary changes as you edit the expression.

**AR Q:** هل يتحدّث الوصف مباشرة؟

**AR A:** نعم. يتغيّر الملخص بلغة واضحة أثناء تعديل التعبير.

### Q4

**EN Q:** What if the expression is invalid?

**EN A:** The description area shows an invalid message until the five fields parse correctly.

**AR Q:** ماذا يحدث إذا كان التعبير غير صالح؟

**AR A:** تعرض منطقة الوصف رسالة عدم صلاحية حتى تُحلَّل الحقول الخمسة بشكل صحيح.

**FLAGS:** (none)

---

## lorem-picsum-placeholder

### Q1

**EN Q:** Does this call an external image service?

**EN A:** No. The placeholder is drawn locally in your browser and downloads as PNG.

**AR Q:** هل يستدعي خدمة صور خارجية؟

**AR A:** لا. تُرسم الصورة النائبة محلياً في متصفحك وتُنزَّل كـ PNG.

### Q2

**EN Q:** What is the maximum size?

**EN A:** Width and height each accept 1–4,000 pixels.

**AR Q:** ما الحد الأقصى للحجم؟

**AR A:** العرض والارتفاع يقبلان من 1 إلى 4,000 بكسل لكل منهما.

### Q3

**EN Q:** What appears on the image?

**EN A:** A solid background color with centered width × height label text.

**AR Q:** ماذا يظهر على الصورة؟

**AR A:** لون خلفية موحّد مع نص في الوسط يعرض العرض × الارتفاع.

### Q4

**EN Q:** Can I pick the background color?

**EN A:** Yes. Use the color picker; label text automatically switches to light or dark for contrast.

**AR Q:** هل يمكنني اختيار لون الخلفية؟

**AR A:** نعم. استخدم منتقي اللون؛ يتبدّل لون النص تلقائياً للتباين.

**FLAGS:** (none)

---

## percentage-calculator

### Q1

**EN Q:** How do I calculate a percentage of a number?

**EN A:** Select the X% of Y mode, enter the percentage in the first field and the number in the second. The result is (percentage ÷ 100) × number.

**AR Q:** كيف أحسب نسبة مئوية من رقم؟

**AR A:** اختر وضع X% من Y، أدخل النسبة في الحقل الأول والرقم في الثاني. النتيجة هي (النسبة ÷ 100) × الرقم.

### Q2

**EN Q:** How is percentage change calculated?

**EN A:** Percentage change is ((new value − original value) ÷ original value) × 100. A positive result is an increase; a negative result is a decrease.

**AR Q:** كيف يُحسب التغيّر المئوي؟

**AR A:** التغيّر المئوي هو ((القيمة الجديدة − القيمة الأصلية) ÷ القيمة الأصلية) × 100. النتيجة الموجبة زيادة؛ السالبة نقصان.

### Q3

**EN Q:** Can I use decimals?

**EN A:** Yes. Enter whole numbers or decimals in either field. Results are shown with up to four decimal places when needed.

**AR Q:** هل يمكنني استخدام الكسور العشرية؟

**AR A:** نعم. أدخل أعداداً صحيحة أو عشرية في أي حقل. تُعرَض النتائج حتى أربع منازل عشرية عند الحاجة.

### Q4

**EN Q:** What if I divide by zero?

**EN A:** If the divisor is zero — for example, finding what percent X is of 0 — the calculator cannot produce a valid result and will show no answer.

**AR Q:** ماذا يحدث عند القسمة على صفر؟

**AR A:** إذا كان المقسوم عليه صفراً — مثلاً إيجاد أي نسبة يمثلها X من 0 — لا يمكن للحاسبة إنتاج نتيجة صالحة ولن تعرض إجابة.

**FLAGS:** (none)

---

## tip-calculator

### Q1

**EN Q:** Can I split tips between people?

**EN A:** Yes. Enter the number of diners and the tool divides the total evenly.

**AR Q:** هل يمكن تقسيم البقشيش بين الأشخاص؟

**AR A:** نعم. أدخل عدد الأشخاص ويقسّم الأداة الإجمالي بالتساوي.

### Q2

**EN Q:** Does this work offline?

**EN A:** Yes. It is a pure client-side calculator with no network requests.

**AR Q:** هل يعمل بدون إنترنت؟

**AR A:** نعم. حاسبة محلية بالكامل دون طلبات شبكة.

### Q3

**EN Q:** What totals are shown?

**EN A:** Tip amount, bill plus tip grand total, and each person's share.

**AR Q:** ما الإجماليات المعروضة؟

**AR A:** مبلغ البقشيش، والإجمالي مع الفاتورة، وحصة كل شخص.

### Q4

**EN Q:** Can I use any tip percentage?

**EN A:** Yes. Enter any non-negative tip rate; results update instantly.

**AR Q:** هل يمكنني استخدام أي نسبة بقشيش؟

**AR A:** نعم. أدخل أي نسبة غير سالبة؛ تتحدّث النتائج فوراً.

**FLAGS:** (none)

---

## discount-calculator

### Q1

**EN Q:** Can discount exceed 100%?

**EN A:** No. Valid discounts are 0–100%.

**AR Q:** هل يمكن خصم أكثر من 100%؟

**AR A:** لا. الخصومات الصالحة من 0 إلى 100%.

### Q2

**EN Q:** Does this stack multiple discounts?

**EN A:** This tool applies a single discount percentage. For stacked discounts, calculate step by step.

**AR Q:** هل تدعم خصومات متعددة؟

**AR A:** تطبّق هذه الأداة خصماً واحداً. للخصومات المتتابعة احسب خطوة بخطوة.

### Q3

**EN Q:** What results are shown?

**EN A:** Final sale price and the amount you save, updated as you type.

**AR Q:** ما النتائج المعروضة؟

**AR A:** سعر البيع النهائي ومقدار التوفير، يتحدّثان أثناء الكتابة.

### Q4

**EN Q:** Are prices I enter stored anywhere?

**EN A:** No. Calculations run in your browser; your amounts are not saved or uploaded.

**AR Q:** هل تُخزَّن الأسعار التي أدخلها؟

**AR A:** لا. الحسابات في متصفحك؛ مبالغك لا تُحفَظ ولا تُرفع.

**FLAGS:** (none)

---

## bmi-calculator

### Q1

**EN Q:** How is BMI calculated?

**EN A:** BMI is weight in kilograms divided by height in meters squared (kg/m²). For imperial units, height and weight are converted to metric first, then the same formula is applied.

**AR Q:** كيف يُحسب مؤشر كتلة الجسم؟

**AR A:** مؤشر كتلة الجسم هو الوزن بالكيلوغرام مقسوماً على مربع الطول بالمتر (كغ/م²). للوحدات الإمبراطورية، يُحوَّل الطول والوزن إلى متري أولاً ثم تُطبَّق نفس المعادلة.

### Q2

**EN Q:** What is a healthy BMI range?

**EN A:** For most adults, a BMI between 18.5 and 24.9 is considered normal. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is obese.

**AR Q:** ما نطاق مؤشر كتلة الجسم الصحي؟

**AR A:** لمعظم البالغين، مؤشر كتلة الجسم بين 18.5 و24.9 يُعتبر طبيعياً. أقل من 18.5 نقص وزن، 25–29.9 زيادة وزن، و30 فأكثر سمنة.

### Q3

**EN Q:** Is BMI accurate for everyone?

**EN A:** BMI does not distinguish muscle from fat, so athletes and very muscular people may score high despite low body fat. It is less reliable for children, elderly adults, and pregnant women.

**AR Q:** هل مؤشر كتلة الجسم دقيق للجميع؟

**AR A:** مؤشر كتلة الجسم لا يميّز العضلات من الدهون، فالرياضيون وأصحاب الأجسام العضلية قد يحصلون على درجة عالية رغم انخفاض دهون الجسم. أقل موثوقية للأطفال وكبار السن والحوامل.

### Q4

**EN Q:** Does this store my height or weight?

**EN A:** No. All calculations run in your browser. Your measurements are never sent to a server.

**AR Q:** هل تُخزَّن قياساتي؟

**AR A:** لا. تتم جميع الحسابات في متصفحك. قياساتك لا تُرسل إلى أي خادم.

**FLAGS:** (none)

---

## calorie-calculator

### Q1

**EN Q:** What formula does this calorie calculator use?

**EN A:** BMR is calculated with the Mifflin-St Jeor equation, which uses sex, weight, height, and age. TDEE multiplies BMR by your selected activity factor.

**AR Q:** ما المعادلة التي تستخدمها حاسبة السعرات؟

**AR A:** يُحسب معدل الأيض الأساسي بمعادلة Mifflin-St Jeor التي تستخدم الجنس والوزن والطول والعمر. معدل الإنفاق اليومي الإجمالي يضرب معدل الأيض الأساسي بعامل النشاط المختار.

### Q2

**EN Q:** What is the difference between BMR and TDEE?

**EN A:** BMR is the calories your body needs at complete rest. TDEE adds calories burned through daily activity and exercise, giving a more realistic daily target.

**AR Q:** ما الفرق بين معدل الأيض الأساسي والإجمالي؟

**AR A:** معدل الأيض الأساسي هو السعرات التي يحتاجها جسمك في راحة تامة. معدل الإنفاق اليومي الإجمالي يضيف السعرات المحروقة عبر النشاط اليومي والتمارين، فيعطي هدفاً يومياً أكثر واقعية.

### Q3

**EN Q:** How many calories should I eat to lose weight?

**EN A:** A deficit of about 500 calories per day typically leads to roughly one pound of weight loss per week. This tool shows a lose target based on that guideline.

**AR Q:** كم سعرة يجب أن آكل لإنقاص الوزن؟

**AR A:** عجز نحو 500 سعرة يومياً يؤدي عادةً إلى فقدان نحو رطل واحد أسبوعياً. تعرض هذه الأداة هدف خسارة مبني على هذا الإرشاد.

### Q4

**EN Q:** Are these calorie estimates exact?

**EN A:** They are estimates, not medical advice. Individual metabolism, health conditions, and body composition vary. Adjust based on progress and consult a professional if needed.

**AR Q:** هل تقديرات السعرات دقيقة؟

**AR A:** هي تقديرات وليست نصيحة طبية. الأيض الفردي والحالات الصحية وتركيب الجسم تختلف. عدّل بناءً على التقدم واستشر مختصاً عند الحاجة.

**FLAGS:** (none)

---

## loan-calculator

### Q1

**EN Q:** How is the monthly payment calculated?

**EN A:** This calculator uses the standard amortization formula for fixed-rate loans. It spreads principal and interest evenly across equal monthly payments.

**AR Q:** كيف تُحسب الدفعة الشهرية؟

**AR A:** تستخدم هذه الحاسبة صيغة السداد القياسية للقروض ذات الفائدة الثابتة. توزع أصل الدين والفائدة بالتساوي على دفعات شهرية متساوية.

### Q2

**EN Q:** Does this include taxes and insurance?

**EN A:** No. The monthly payment shown covers principal and interest only. Property taxes, homeowners insurance, PMI, and HOA fees are not included.

**AR Q:** هل يشمل هذا الضرائب والتأمين؟

**AR A:** لا. الدفعة الشهرية المعروضة تغطي أصل الدين والفائدة فقط. ضرائب العقار وتأمين المنزل وPMI ورسوم الجمعية غير مشمولة.

### Q3

**EN Q:** Can I calculate a mortgage or car loan?

**EN A:** Yes. Enter any fixed-rate loan amount, APR, and term. The same formula applies to mortgages, auto loans, and personal loans.

**AR Q:** هل يمكنني حساب رهن عقاري أو قرض سيارة؟

**AR A:** نعم. أدخل أي مبلغ قرض بفائدة ثابتة وAPR ومدة. نفس الصيغة تنطبق على الرهون العقارية وقروض السيارات والقروض الشخصية.

### Q4

**EN Q:** What happens if the interest rate is 0%?

**EN A:** At 0% interest, the monthly payment is simply the loan amount divided by the number of months — no interest is added.

**AR Q:** ماذا يحدث إذا كان معدل الفائدة 0%؟

**AR A:** عند فائدة 0%، الدفعة الشهرية هي ببساطة مبلغ القرض مقسوماً على عدد الأشهر — دون إضافة فائدة.

**FLAGS:** (none)

---

## mortgage-calculator

### Q1

**EN Q:** Does this include taxes and insurance?

**EN A:** No. It calculates principal and interest (P&I) only, unlike full escrow estimates.

**AR Q:** هل يشمل الضرائب والتأمين؟

**AR A:** لا. يحسب أصل الدين والفائدة فقط (P&I)، بخلاف تقديرات الضمان الكاملة.

### Q2

**EN Q:** How is this different from the loan calculator?

**EN A:** This tool uses home price and down payment and shows an amortization schedule for mortgages.

**AR Q:** كيف يختلف عن حاسبة القرض؟

**AR A:** تستخدم هذه الأداة سعر المنزل والدفعة المقدمة وتعرض جدول إطفاء للرهن العقاري.

### Q3

**EN Q:** Does it show an amortization schedule?

**EN A:** Yes. A table lists monthly payment, principal, interest, and remaining balance for the first 24 months.

**AR Q:** هل يعرض جدول إطفاء؟

**AR A:** نعم. جدول يعرض الدفعة الشهرية وأصل الدين والفائدة والرصيد المتبقي لأول 24 شهراً.

### Q4

**EN Q:** What summary figures are shown?

**EN A:** Loan amount after down payment, monthly P&I payment, total interest, and total amount paid over the term.

**AR Q:** ما الأرقام الملخّصة المعروضة؟

**AR A:** مبلغ القرض بعد الدفعة المقدمة، والدفعة الشهرية P&I، وإجمالي الفائدة، وإجمالي المدفوع على مدى المدة.

**FLAGS:** (none)

---

## compound-interest

### Q1

**EN Q:** What formula is used?

**EN A:** A = P × (1 + r/n)^(nt) where n is compounding periods per year.

**AR Q:** ما المعادلة المستخدمة؟

**AR A:** A = P × (1 + r/n)^(nt) حيث n هو عدد مرات التركيب في السنة.

### Q2

**EN Q:** Is tax included?

**EN A:** No. This shows gross compound growth before taxes or fees.

**AR Q:** هل يشمل الضريبة؟

**AR A:** لا. يعرض النمو المركّب الإجمالي قبل الضرائب والرسوم.

### Q3

**EN Q:** Which compounding frequencies are available?

**EN A:** Annual, semiannual, quarterly, monthly, and daily — pick how often interest is added.

**AR Q:** ما تكرارات التركيب المتاحة؟

**AR A:** سنوي، نصف سنوي، ربع سنوي، شهري، ويومي — اختر عدد مرات إضافة الفائدة.

### Q4

**EN Q:** What results are shown?

**EN A:** Final balance and total interest earned, formatted in USD based on your principal, rate, and years.

**AR Q:** ما النتائج المعروضة؟

**AR A:** الرصيد النهائي وإجمالي الفائدة المكتسبة، بصيغة USD وفق رأس المال والمعدل وعدد السنوات.

**FLAGS:** (none)

---

## age-calculator

### Q1

**EN Q:** How is age calculated?

**EN A:** The tool counts full years, months, and days between your birth date and the reference date, accounting for varying month lengths.

**AR Q:** كيف يُحسب العمر؟

**AR A:** تعدّ الأداة السنوات والأشهر والأيام الكاملة بين تاريخ الميلاد وتاريخ المرجع، مع مراعاة اختلاف أطوال الأشهر.

### Q2

**EN Q:** Can I calculate age as of a specific date?

**EN A:** Yes. Pick any reference date or tap Use today to measure age as of the current day.

**AR Q:** هل يمكنني حساب العمر في تاريخ محدد؟

**AR A:** نعم. اختر أي تاريخ مرجعي أو اضغط «استخدم اليوم» لقياس العمر حتى اليوم الحالي.

### Q3

**EN Q:** What else does the result show?

**EN A:** Besides years, months, and days, you also see total days lived and how many days remain until your next birthday.

**AR Q:** ماذا يعرض الناتج أيضاً؟

**AR A:** إلى جانب السنوات والأشهر والأيام، ترى إجمالي الأيام التي عشتها وعدد الأيام المتبقية حتى عيد ميلادك القادم.

### Q4

**EN Q:** Is my birth date stored?

**EN A:** No. Your birth and reference dates stay on your device — nothing is uploaded.

**AR Q:** هل يُخزَّن تاريخ ميلادي؟

**AR A:** لا. تاريخ الميلاد وتاريخ المرجع يبقيان على جهازك — لا يُرفع شيء.

**FLAGS:** (none)

---

## date-difference

### Q1

**EN Q:** How are days between dates counted?

**EN A:** The calculator measures the difference in calendar days between the two dates you select. The total day count and the years/months/days breakdown are both shown.

**AR Q:** كيف تُحسب الأيام بين التواريخ؟

**AR A:** تحسب الحاسبة الفرق بالأيام التقويمية بين التاريخين المختارين. يُعرَض إجمالي الأيام وتفصيل السنوات/الأشهر/الأيام معاً.

### Q2

**EN Q:** Does the order of dates matter?

**EN A:** The absolute difference is the same either way. The breakdown also indicates whether the end date falls before or after the start date.

**AR Q:** هل يهم ترتيب التواريخ؟

**AR A:** الفرق المطلق هو نفسه في كلا الاتجاهين. يشير التفصيل أيضاً إلى ما إذا كان تاريخ النهاية قبل أو بعد تاريخ البداية.

### Q3

**EN Q:** How does the days until / days since feature work?

**EN A:** Pick any target date and the tool compares it to today. Future dates show days remaining; past dates show days elapsed.

**AR Q:** كيف يعمل عد الأيام حتى/منذ؟

**AR A:** اختر أي تاريخ مستهدف وتقارن الأداة به اليوم. التواريخ المستقبلية تعرض الأيام المتبقية؛ الماضية تعرض الأيام المنقضية.

### Q4

**EN Q:** Are leap years handled correctly?

**EN A:** Yes. Date math accounts for varying month lengths and leap years, so February 29 and other edge cases are calculated accurately.

**AR Q:** هل تُعالَج السنوات الكبيسة بشكل صحيح؟

**AR A:** نعم. حساب التواريخ يراعي أطوال الأشهر المتغيرة والسنوات الكبيسة، ف29 فبراير والحالات الحدية تُحسب بدقة.

**FLAGS:** (none)

---

## due-date-calculator

### Q1

**EN Q:** How is a pregnancy due date calculated?

**EN A:** This tool uses Naegele's rule: add 280 days (40 weeks) to the first day of your last menstrual period. Most pregnancies deliver within two weeks of that date.

**AR Q:** كيف يُحسب موعد الولادة؟

**AR A:** تستخدم هذه الأداة قاعدة Naegele: إضافة 280 يوماً (40 أسبوعاً) إلى اليوم الأول من آخر دورة شهرية. معظم الحالات تلد خلال أسبوعين من ذلك التاريخ.

### Q2

**EN Q:** Is an LMP due date always accurate?

**EN A:** LMP-based estimates assume a regular 28-day cycle. An early ultrasound often gives a more precise due date, especially if your cycle length varies.

**AR Q:** هل موعد الولادة من آخر دورة دائماً دقيق؟

**AR A:** تقديرات آخر دورة تفترض دورة منتظمة 28 يوماً. الموجات فوق الصوتية المبكرة غالباً تعطي موعداً أدق، خاصة إذا اختلف طول دورتك.

### Q3

**EN Q:** What does pregnancy week mean?

**EN A:** Pregnancy weeks are counted from the first day of your LMP, not from conception. Week 1 starts on that first day, so you are considered about two weeks pregnant at conception.

**AR Q:** ماذا يعني أسبوع الحمل؟

**AR A:** أسابيع الحمل تُحسب من اليوم الأول من آخر دورة وليس من الإخصاب. الأسبوع 1 يبدأ في ذلك اليوم، فتُعتبرين حاملاً بحوالي أسبوعين عند الإخصاب.

### Q4

**EN Q:** Should I use this instead of medical advice?

**EN A:** No. This is an educational estimate only. Always follow guidance from your obstetrician or midwife for prenatal care and delivery planning.

**AR Q:** هل أستخدم هذا بدلاً من النصيحة الطبية؟

**AR A:** لا. هذا تقدير تعليمي فقط. اتبعي دائماً إرشادات طبيب التوليد أو القابلة للرعاية قبل الولادة وتخطيط الولادة.

**FLAGS:** (none)

---

## gpa-calculator

### Q1

**EN Q:** What grading scale is used?

**EN A:** Standard 4.0 scale: A=4, B=3, C=2, D=1, F=0, weighted by credit hours.

**AR Q:** ما مقياس الدرجات المستخدم؟

**AR A:** مقياس 4.0 القياسي: A=4، B=3، C=2، D=1، F=0، موزوناً بساعات المعتمدة.

### Q2

**EN Q:** Can I calculate semester GPA?

**EN A:** Yes. Enter only the courses for the term you want to evaluate.

**AR Q:** هل يمكن حساب معدل الفصل؟

**AR A:** نعم. أدخل مقررات الفصل الذي تريد تقييمه فقط.

### Q3

**EN Q:** Can I add or remove courses?

**EN A:** Yes. Use Add course for more rows and Remove to drop a course you do not need.

**AR Q:** هل يمكن إضافة أو حذف مقررات؟

**AR A:** نعم. استخدم «إضافة مقرر» لمزيد من الصفوف و«إزالة» لحذف مقرر لا تحتاجه.

### Q4

**EN Q:** Are my grades saved?

**EN A:** No. GPA is calculated in your browser; course rows are not uploaded.

**AR Q:** هل تُحفَظ درجاتي؟

**AR A:** لا. يُحسب المعدل في متصفحك؛ صفوف المقررات لا تُرفع.

**FLAGS:** (none)

---

## fuel-cost-calculator

### Q1

**EN Q:** Which consumption units are supported?

**EN A:** Liters per 100 km (common in Europe/MENA) and US miles per gallon.

**AR Q:** ما وحدات الاستهلاك المدعومة؟

**AR A:** لتر لكل 100 كم (شائع في أوروبا والشرق الأوسط) والأميال لكل غالون الأمريكي.

### Q2

**EN Q:** Are conversions accurate?

**EN A:** Yes. Distance and MPG values are converted using standard conversion factors.

**AR Q:** هل التحويلات دقيقة؟

**AR A:** نعم. تُحوَّل المسافة وقيم MPG بعوامل تحويل قياسية.

### Q3

**EN Q:** What do I need to enter?

**EN A:** Trip distance (km or miles), fuel consumption (L/100 km or MPG), and price per liter at the pump.

**AR Q:** ماذا أحتاج أن أدخل؟

**AR A:** مسافة الرحلة (كم أو أميال)، استهلاك الوقود (لتر/100 كم أو MPG)، وسعر اللتر عند المضخة.

### Q4

**EN Q:** What does the result include?

**EN A:** Total liters needed for the trip and the estimated fuel cost in your entered currency.

**AR Q:** ماذا يتضمن الناتج؟

**AR A:** إجمالي اللترات اللازمة للرحلة وتكلفة الوقود التقديرية بالعملة التي أدخلتها.

**FLAGS:** (none)

---

## aspect-ratio-calculator

### Q1

**EN Q:** What is aspect ratio?

**EN A:** The proportional relationship between width and height, expressed as W:H (e.g. 16:9).

**AR Q:** ما نسبة العرض إلى الارتفاع؟

**AR A:** العلاقة التناسبية بين العرض والارتفاع، تُعبَّر بصيغة ع:ار (مثل 16:9).

### Q2

**EN Q:** Are ratios simplified?

**EN A:** Yes. The tool reduces dimensions to the smallest whole-number ratio using GCD.

**AR Q:** هل تُبسَّط النسب؟

**AR A:** نعم. تختصر الأداة الأبعاد إلى أصغر نسبة بأعداد صحيحة باستخدام القاسم المشترك الأكبر.

### Q3

**EN Q:** What do the preset buttons do?

**EN A:** They fill common ratios such as 16:9, 4:3, 3:2, 1:1, and 9:16 so you can start from a standard proportion.

**AR Q:** ماذا تفعل أزرار الإعدادات المسبقة؟

**AR A:** تملأ نسباً شائعة مثل 16:9 و4:3 و3:2 و1:1 و9:16 لتبدأ من تناسب قياسي.

### Q4

**EN Q:** Can I scale to a target width or height?

**EN A:** Yes. Enter a target width to compute the matching height, or enter a target height to compute the matching width.

**AR Q:** هل يمكنني التحجيم لعرض أو ارتفاع مستهدف؟

**AR A:** نعم. أدخل عرضاً مستهدفاً لحساب الارتفاع المطابق، أو ارتفاعاً مستهدفاً لحساب العرض المطابق.

**FLAGS:** (none)

---

## unit-converter

### Q1

**EN Q:** What units can I convert?

**EN A:** Length (mm, cm, m, km, in, ft, yd, mi), weight (mg, g, kg, oz, lb), area (m², ft², acres, hectares), and volume (ml, L, fl oz, cups, gallons).

**AR Q:** ما الوحدات التي يمكن تحويلها؟

**AR A:** الطول (مم، سم، م، كم، بوصة، قدم، ياردة، ميل)، الوزن (ملغ، غ، كغ، أونصة، رطل)، المساحة (م²، قدم²، فدان، هكتار)، والحجم (مل، ل، أونصة سائلة، أكواب، غالون).

### Q2

**EN Q:** Where do I convert temperature?

**EN A:** Use the dedicated Temperature Converter for Celsius, Fahrenheit, and Kelvin — linked from this tool.

**AR Q:** أين أحوّل درجة الحرارة؟

**AR A:** استخدم محوّل الحرارة المخصص للسلسيوس وفهرنهايت والكلفن — مرتبط من هذه الأداة.

### Q3

**EN Q:** Are conversions accurate?

**EN A:** Yes. Conversions use standard international factors for length, weight, area, and volume.

**AR Q:** هل التحويلات دقيقة؟

**AR A:** نعم. تستخدم عوامل تحويل دولية قياسية للطول والوزن والمساحة والحجم.

### Q4

**EN Q:** Which gallon does the volume converter use?

**EN A:** US customary units — US fluid ounces, US cups, and US gallons. This matches common American cooking and packaging labels.

**AR Q:** أي غالون يستخدم محوّل الحجم؟

**AR A:** الوحدات الأمريكية — أونصة سائلة أمريكية وأكواب وغالون أمريكي. يطابق ملصقات الطبخ والتعبئة الأمريكية الشائعة.

**FLAGS:** (none)

---

## temperature-converter

### Q1

**EN Q:** How is Kelvin defined?

**EN A:** Kelvin starts at absolute zero. K = °C + 273.15.

**AR Q:** كيف يُعرَّف الكلفن؟

**AR A:** يبدأ الكلفن عند الصفر المطلق. K = °C + 273.15.

### Q2

**EN Q:** Are negative Fahrenheit values supported?

**EN A:** Yes. Any valid numeric temperature converts correctly.

**AR Q:** هل تدعم قيم فهرنهايت السالبة؟

**AR A:** نعم. أي درجة حرارة رقمية صالحة تُحوَّل بشكل صحيح.

### Q3

**EN Q:** Where can I convert length or volume?

**EN A:** Use the Unit Converter for length, weight, area, and volume measurements.

**AR Q:** أين أحوّل الطول أو الحجم؟

**AR A:** استخدم محوّل الوحدات للطول والوزن والمساحة والحجم.

### Q4

**EN Q:** Are impossible Kelvin values rejected?

**EN A:** Yes. Kelvin input below zero or results colder than absolute zero show as invalid.

**AR Q:** هل تُرفض قيم الكلفن المستحيلة؟

**AR A:** نعم. إدخال كلفن أقل من صفر أو نتائج أبرد من الصفر المطلق تظهر غير صالحة.

**FLAGS:** (none)

---

## cooking-converter

### Q1

**EN Q:** US or metric cups?

**EN A:** This tool uses US customary cup (≈237 ml), tablespoon, and teaspoon measures.

**AR Q:** أكواب أمريكية أم متريّة؟

**AR A:** تستخدم الأداة الكوب الأمريكي (≈237 مل) والملعقة الكبيرة والصغيرة.

### Q2

**EN Q:** Are grams exact for all ingredients?

**EN A:** Grams assume water density (1 ml ≈ 1 g). Flour, sugar, and oils differ.

**AR Q:** هل الغرامات دقيقة لكل المكوّنات؟

**AR A:** تفترض الغرامات كثافة الماء (1 مل ≈ 1 غ). الدقيق والسكر والزيوت تختلف.

### Q3

**EN Q:** Which units can I convert?

**EN A:** US cup, tablespoon, teaspoon, milliliters, US fluid ounces, and grams (water equivalent).

**AR Q:** ما الوحدات التي يمكن تحويلها؟

**AR A:** كوب أمريكي، ملعقة كبيرة، ملعقة صغيرة، ملليلتر، أونصة سائلة أمريكية، وغرام (مكافئ الماء).

### Q4

**EN Q:** Do my recipe amounts leave my device?

**EN A:** No. Conversions run entirely in your browser.

**AR Q:** هل تغادر كميات الوصفة جهازي؟

**AR A:** لا. التحويل يتم بالكامل داخل متصفحك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2
- DUPLICATE privacy filler EN Q4 ≈ data-unit-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ file-size-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ hijri-gregorian-converter Q4

---

## data-unit-converter

### Q1

**EN Q:** Bits vs bytes?

**EN A:** One byte equals 8 bits. Network speeds are usually quoted in bits per second.

**AR Q:** البتات مقابل البايتات؟

**AR A:** البايت الواحد يساوي 8 بتات. سرعات الشبكة تُقتَرح عادةً بالبتات في الثانية.

### Q2

**EN Q:** Is storage binary?

**EN A:** KB, MB, and GB here use 1024-based steps (8 bits per byte).

**AR Q:** هل التخزين ثنائي؟

**AR A:** KB وMB وGB هنا تستخدم خطوات 1024 (8 بتات لكل بايت).

### Q3

**EN Q:** Can I convert between storage and speed units?

**EN A:** Yes. Convert among bits, bytes, KB, MB, GB, Mbps, and Gbps in either direction.

**AR Q:** هل يمكن التحويل بين التخزين والسرعة؟

**AR A:** نعم. حوِّل بين البتات والبايتات وKB وMB وGB وMbps وGbps في أي اتجاه.

### Q4

**EN Q:** Are my values uploaded?

**EN A:** No. Numbers you enter are converted locally and never sent to a server.

**AR Q:** هل تُرفع قيمي؟

**AR A:** لا. الأرقام التي تدخلها تُحوَّل محلياً ولا تُرسل إلى خادم.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ online-notepad Q4
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2
- DUPLICATE privacy filler EN Q4 ≈ cooking-converter Q4

---

## file-size-converter

### Q1

**EN Q:** Binary vs decimal?

**EN A:** Binary (KiB-style) uses 1024 per step; decimal uses 1000. Windows often shows binary sizes.

**AR Q:** ثنائي أم عشري؟

**AR A:** الثنائي (نمط KiB) يستخدم 1024 لكل خطوة؛ العشري يستخدم 1000. ويندوز غالباً يعرض أحجاماً ثنائية.

### Q2

**EN Q:** Why do sizes differ from labels?

**EN A:** Drive makers often use decimal GB while operating systems use binary GiB.

**AR Q:** لماذا تختلف الأحجام عن الملصقات؟

**AR A:** مصنّعو الأقراص يستخدمون غالباً GB عشرياً بينما أنظمة التشغيل تستخدم GiB ثنائياً.

### Q3

**EN Q:** Which size units are supported?

**EN A:** Bytes through petabytes: B, KB, MB, GB, TB, and PB.

**AR Q:** ما وحدات الحجم المدعومة؟

**AR A:** من البايت إلى البيتابايت: B وKB وMB وGB وTB وPB.

### Q4

**EN Q:** Does my file size data leave my device?

**EN A:** No. Size conversions happen entirely in your browser.

**AR Q:** هل تغادر بيانات حجم الملف جهازي؟

**AR A:** لا. تحويل الأحجام يتم بالكامل داخل متصفحك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ js-minifier Q2
- DUPLICATE privacy filler EN Q4 ≈ cooking-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ hijri-gregorian-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ mp3-cutter Q1
- DUPLICATE privacy filler EN Q4 ≈ audio-converter Q4

---

## roman-numeral-converter

### Q1

**EN Q:** What range is supported?

**EN A:** Standard Roman numerals from 1 to 3999 (no vinculum notation).

**AR Q:** ما النطاق المدعوم؟

**AR A:** الأرقام الرومانية القياسية من 1 إلى 3999 (بدون خط علوي).

### Q2

**EN Q:** Is input case-sensitive?

**EN A:** Roman input is normalized to uppercase before parsing.

**AR Q:** هل الإدخال حساس لحالة الأحرف؟

**AR A:** يُحوَّل الإدخال الروماني إلى أحرف كبيرة قبل التحليل.

### Q3

**EN Q:** Can I convert in both directions?

**EN A:** Yes. Switch between Arabic numeral to Roman and Roman to Arabic numeral modes.

**AR Q:** هل يمكن التحويل في الاتجاهين؟

**AR A:** نعم. بدّل بين وضع رقم عربي إلى روماني وروماني إلى عربي.

### Q4

**EN Q:** Does my input leave my device?

**EN A:** No. Conversion runs locally; nothing is uploaded.

**AR Q:** هل يغادر إدخالي جهازي؟

**AR A:** لا. التحويل محلي؛ لا يُرفع شيء.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ cooking-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ file-size-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ hijri-gregorian-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ mp3-cutter Q1
- DUPLICATE privacy filler EN Q4 ≈ audio-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ audio-merger Q4

---

## number-to-words

### Q1

**EN Q:** What is tafqit?

**EN A:** Arabic legal and formal spelling of numbers in words, used on checks and official documents.

**AR Q:** ما التفقيط؟

**AR A:** صياغة الأعداد عربياً بشكل رسمي وقانوني، تُستخدم في الشيكات والمستندات الرسمية.

### Q2

**EN Q:** Are decimals supported?

**EN A:** This tool converts whole numbers only.

**AR Q:** هل تدعم الكسور العشرية؟

**AR A:** تحوّل هذه الأداة الأعداد الصحيحة فقط.

### Q3

**EN Q:** What number range is supported?

**EN A:** Whole numbers from 0 up to 999 billion in either English or Arabic output.

**AR Q:** ما نطاق الأعداد المدعوم؟

**AR A:** أعداد صحيحة من 0 حتى 999 مليار، بإخراج إنجليزي أو عربي.

### Q4

**EN Q:** Can I switch output language?

**EN A:** Yes. Choose English or Arabic (tafqit) from the language dropdown.

**AR Q:** هل يمكن تغيير لغة الإخراج؟

**AR A:** نعم. اختر الإنجليزية أو العربية (تفقيط) من قائمة اللغة.

**FLAGS:** (none)

---

## hijri-gregorian-converter

### Q1

**EN Q:** How accurate is the Hijri date?

**EN A:** Uses a standard tabular algorithm. Official Umm al-Qura dates may differ by one day.

**AR Q:** ما دقة التاريخ الهجري؟

**AR A:** يستخدم خوارزمية جدولية قياسية. قد يختلف عن أم القرى الرسمي بيوم واحد.

### Q2

**EN Q:** Can I convert in both directions?

**EN A:** Yes. Switch between Gregorian to Hijri and Hijri to Gregorian at the top.

**AR Q:** هل يمكن التحويل في الاتجاهين؟

**AR A:** نعم. بدّل بين ميلادي إلى هجري وهجري إلى ميلادي من الأعلى.

### Q3

**EN Q:** How do I enter a Hijri date?

**EN A:** Type the Hijri year and day, then pick the month from the dropdown with month names in your language.

**AR Q:** كيف أُدخل تاريخاً هجرياً؟

**AR A:** اكتب السنة واليوم الهجريين، ثم اختر الشهر من القائمة بأسماء الأشهر بلغتك.

### Q4

**EN Q:** Do the dates I pick leave my device?

**EN A:** No. Calendar conversion runs entirely in your browser; nothing is uploaded.

**AR Q:** هل تغادر التواريخ التي أختارها جهازي؟

**AR A:** لا. تحويل التقويم يتم بالكامل داخل متصفحك؛ لا يُرفع شيء.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ cooking-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ file-size-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ mp3-cutter Q1
- DUPLICATE privacy filler EN Q4 ≈ audio-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ audio-merger Q4

---

## timestamp-converter

### Q1

**EN Q:** Does this accept seconds or milliseconds?

**EN A:** Both. Values with 13 or more digits are treated as milliseconds; shorter values are treated as seconds.

**AR Q:** هل يقبل الثواني أو الميلي ثانية؟

**AR A:** كلاهما. القيم ذات 13 رقماً أو أكثر تُعامَل كميلي ثانية؛ القيم الأقصر تُعامَل كثوانٍ.

### Q2

**EN Q:** What timezone is used?

**EN A:** Displayed dates use your browser's local timezone. The Unix timestamp itself is always UTC-based.

**AR Q:** ما المنطقة الزمنية المستخدمة؟

**AR A:** التواريخ المعروضة تستخدم المنطقة الزمنية المحلية لمتصفحك. الطابع الزمني Unix نفسه مبني دائماً على UTC.

### Q3

**EN Q:** Can I copy the current timestamp?

**EN A:** Yes. Use the Copy seconds or Copy ms buttons next to the live clock at the top.

**AR Q:** هل يمكنني نسخ الطابع الزمني الحالي؟

**AR A:** نعم. استخدم أزرار نسخ الثواني أو الميلي ثانية بجانب الساعة المباشرة في الأعلى.

### Q4

**EN Q:** Why do logs use Unix timestamps?

**EN A:** Unix time is a standard integer format that avoids timezone ambiguity and is easy to sort and compare.

**AR Q:** لماذا تستخدم السجلات الطوابع الزمنية Unix؟

**AR A:** وقت Unix صيغة عددية قياسية تتجنب غموض المناطق الزمنية وسهلة للفرز والمقارنة.

**FLAGS:** (none)

---

## number-base-converter

### Q1

**EN Q:** Which bases are supported?

**EN A:** Binary (2), octal (8), decimal (10), and hexadecimal (16).

**AR Q:** ما الأنظمة العددية المدعومة؟

**AR A:** ثنائي (2)، ثماني (8)، عشري (10)، وست عشري (16).

### Q2

**EN Q:** Are negative numbers supported?

**EN A:** This tool converts non-negative integers only.

**AR Q:** هل تدعم الأعداد السالبة؟

**AR A:** تحوّل هذه الأداة الأعداد الصحيحة غير السالبة فقط.

### Q3

**EN Q:** What if I type invalid digits for the base?

**EN A:** The result area shows an invalid message until every character is valid for the selected source base.

**AR Q:** ماذا لو أدخلت أرقاماً غير صالحة للنظام؟

**AR A:** تظهر رسالة عدم صلاحية حتى يصبح كل حرف صالحاً للنظام المصدر المختار.

### Q4

**EN Q:** Is my number sent anywhere?

**EN A:** No. Base conversion runs locally in your browser.

**AR Q:** هل يُرسل رقمي إلى مكان ما؟

**AR A:** لا. تحويل النظام العددي يتم محلياً في متصفحك.

**FLAGS:** (none)

---

## pomodoro-timer

### Q1

**EN Q:** What is the Pomodoro Technique?

**EN A:** It is a productivity method where you work in focused intervals (traditionally 25 minutes) separated by short breaks. Regular breaks help sustain concentration and reduce burnout.

**AR Q:** ما هي تقنية بومودورو؟

**AR A:** أسلوب إنتاجية تعمل فيه بفترات تركيز (تقليدياً 25 دقيقة) مفصولة باستراحات قصيرة. الاستراحات المنتظمة تساعد على استمرار التركيز وتقليل الإرهاق.

### Q2

**EN Q:** Can I change the timer durations?

**EN A:** Yes. Set custom work and break lengths in minutes before starting. Use Apply to reset the current session with your new durations.

**AR Q:** هل يمكنني تغيير مدد المؤقت؟

**AR A:** نعم. حدّد أطوال عمل واستراحة مخصصة بالدقائق قبل البدء. استخدم تطبيق لإعادة ضبط الجلسة الحالية بمددك الجديدة.

### Q3

**EN Q:** Does the timer make a sound?

**EN A:** A short chime plays when a work or break period ends if sound is enabled. You can toggle sound off if you prefer silent alerts.

**AR Q:** هل يصدر المؤقت صوتاً؟

**AR A:** تُشغَّل نغمة قصيرة عند انتهاء فترة عمل أو استراحة إذا كان الصوت مفعّلاً. يمكنك إيقاف الصوت إذا فضّلت تنبيهاً صامتاً.

### Q4

**EN Q:** Does the timer keep running if I switch tabs?

**EN A:** Yes. The timer runs in your browser while the tab is open. For best results, keep the tab active or return before the interval ends.

**AR Q:** هل يستمر المؤقت عند تبديل التبويبات؟

**AR A:** نعم. يعمل المؤقت في متصفحك طالما التبويب مفتوح. للحصول على أفضل نتيجة، أبقِ التبويب نشطاً أو عد قبل انتهاء الفترة.

**FLAGS:** (none)

---

## stopwatch-timer

### Q1

**EN Q:** Does the countdown beep?

**EN A:** Yes. A short beep plays when the countdown reaches zero (if audio is allowed).

**AR Q:** هل يصدر العد التنازلي صوتاً؟

**AR A:** نعم. يُشغَّل صوت قصير عند وصول العد التنازلي إلى صفر (إذا سُمح بالصوت).

### Q2

**EN Q:** Are lap times saved?

**EN A:** Laps appear in-session only; refresh clears stopwatch data.

**AR Q:** هل تُحفَظ أوقات اللفات؟

**AR A:** تظهر اللفات في الجلسة الحالية فقط؛ التحديث يمسح بيانات الساعة.

### Q3

**EN Q:** What is the difference between the two tabs?

**EN A:** Stopwatch counts up with lap splits; countdown counts down from minutes and seconds you set.

**AR Q:** ما الفرق بين التبويبين؟

**AR A:** الساعة الإيقافية تعدّ تصاعدياً مع لفات؛ العد التنازلي ينزل من الدقائق والثواني التي تحددها.

### Q4

**EN Q:** Does the stopwatch show centiseconds?

**EN A:** Yes. Elapsed time displays as MM:SS.cs with hundredths of a second while running.

**AR Q:** هل تعرض الساعة الإيقافية أجزاء المئة من الثانية؟

**AR A:** نعم. يُعرض الوقت بصيغة دد:ثث.جج مع أجزاء المئة أثناء التشغيل.

**FLAGS:** (none)

---

## random-picker

### Q1

**EN Q:** How does the random name picker work?

**EN A:** Enter names or options one per line, then spin the wheel. The tool randomly selects one entry using your browser's built-in random number generator.

**AR Q:** كيف يعمل منتقي الأسماء العشوائي؟

**AR A:** أدخل الأسماء أو الخيارات سطراً بسطر، ثم أدر العجلة. تختار الأداة عنصراً عشوائياً بمولّد الأرقام العشوائية المدمج في متصفحك.

### Q2

**EN Q:** Is the random number generator fair?

**EN A:** Yes. Each integer in your chosen range has an equal chance of being selected. The result is uniformly random within min and max, inclusive.

**AR Q:** هل مولّد الأرقام العشوائية عادل؟

**AR A:** نعم. لكل عدد صحيح في نطاقك فرصة متساوية للاختيار. النتيجة عشوائية موحّدة ضمن الحد الأدنى والأعلى شاملين.

### Q3

**EN Q:** Can I use this for giveaways or team selection?

**EN A:** Yes. Paste participant names into the list and spin once to pick a winner. For high-stakes draws, consider recording the screen for transparency.

**AR Q:** هل يمكنني استخدامه للهدايا أو اختيار الفريق؟

**AR A:** نعم. الصق أسماء المشاركين في القائمة وأدر مرة واحدة لاختيار فائز. للسحوبات عالية المخاطر، فكّر في تسجيل الشاشة للشفافية.

### Q4

**EN Q:** Are duplicate names in the list treated separately?

**EN A:** Each line is a separate entry. If you add the same name twice, it appears twice on the wheel and has twice the chance of being picked.

**AR Q:** هل تُعامَل الأسماء المكررة في القائمة بشكل منفصل؟

**AR A:** كل سطر إدخال منفصل. إذا أضفت نفس الاسم مرتين، يظهر مرتين على العجلة ولديه ضعف فرصة الاختيار.

**FLAGS:** (none)

---

## typing-speed-test

### Q1

**EN Q:** How is WPM calculated in this typing test?

**EN A:** WPM uses the standard formula: correct characters typed divided by 5, divided by elapsed minutes. Only correctly typed characters count toward speed.

**AR Q:** كيف تُحسب كلمات الدقيقة في هذا الاختبار؟

**AR A:** تستخدم WPM الصيغة القياسية: الأحرف الصحيحة المكتوبة مقسومة على 5، مقسومة على الدقائق المنقضية. الأحرف الصحيحة فقط تُحسب للسرعة.

### Q2

**EN Q:** How is typing accuracy measured?

**EN A:** Accuracy is the percentage of characters you typed correctly out of all characters entered so far. Mistakes lower your accuracy even if you correct them later.

**AR Q:** كيف تُقاس دقة الكتابة؟

**AR A:** الدقة هي نسبة الأحرف التي كتبتها بشكل صحيح من جميع الأحرف المدخلة حتى الآن. الأخطاء تخفض الدقة حتى لو صححتها لاحقاً.

### Q3

**EN Q:** Does backspacing affect my score?

**EN A:** You can backspace to fix errors. WPM is based on correct characters at each position; accuracy reflects how many keystrokes matched the sample.

**AR Q:** هل يؤثر الحذف للخلف على درجتي؟

**AR A:** يمكنك الحذف للخلف لتصحيح الأخطاء. WPM مبني على الأحرف الصحيحة في كل موضع؛ الدقة تعكس كم ضغطة مطابقة للنموذج.

### Q4

**EN Q:** What is a good typing speed?

**EN A:** Average adult typing speed is around 40 WPM. 60–80 WPM is considered proficient, and 100+ WPM is fast. Accuracy matters as much as raw speed.

**AR Q:** ما سرعة كتابة جيدة؟

**AR A:** متوسط سرعة البالغين نحو 40 كلمة في الدقيقة. 60–80 يُعتبر متمكناً، و100+ سريع. الدقة مهمة بقدر السرعة الخام.

**FLAGS:** (none)

---

## signature-pad

### Q1

**EN Q:** Is the background transparent?

**EN A:** Yes. PNG export keeps transparency outside the ink strokes.

**AR Q:** هل الخلفية شفافة؟

**AR A:** نعم. تصدير PNG يحافظ على الشفافية خارج خطوط التوقيع.

### Q2

**EN Q:** Works on mobile?

**EN A:** Yes. Draw with finger or stylus — touch scrolling is disabled on the pad so lines stay smooth.

**AR Q:** هل يعمل على الجوال؟

**AR A:** نعم. ارسم بإصبعك أو قلم اللمس — يُعطَّل التمرير على اللوحة ليبقى الرسم سلساً.

### Q3

**EN Q:** Can I clear and redraw?

**EN A:** Yes. Clear wipes the pad so you can start over before downloading.

**AR Q:** هل يمكنني المسح وإعادة الرسم؟

**AR A:** نعم. مسح يفرّغ اللوحة لتبدأ من جديد قبل التنزيل.

### Q4

**EN Q:** What size is exported?

**EN A:** PNG at 500×200 pixels with transparent pixels outside your strokes.

**AR Q:** ما حجم الملف المُصدَّر؟

**AR A:** PNG بحجم 500×200 بكسل مع بكسلات شفافة خارج خطوطك.

**FLAGS:** (none)

---

## mp3-cutter

### Q1

**EN Q:** Is my audio uploaded when I trim it?

**EN A:** No. Decoding, cutting, and export stay in your browser — your recording or track never leaves your device.

**AR Q:** هل يُرفع الصوت عند القص؟

**AR A:** لا. فك الترميز والقص والتصدير تبقى في متصفحك — تسجيلك أو مقطوعةك لا تغادر جهازك.

### Q2

**EN Q:** Which formats can I open?

**EN A:** Most audio types your browser can play, including MP3, WAV, M4A, OGG, Opus, and FLAC (and similar).

**AR Q:** ما الصيغ التي يمكن فتحها؟

**AR A:** معظم أنواع الصوت التي يشغّلها متصفحك، بما فيها MP3 وWAV وM4A وOGG وOpus وFLAC وما شابه.

### Q3

**EN Q:** How do I set the trim range?

**EN A:** Use the start/end number fields or the two sliders (0.1 s steps). Export is disabled if start is not before end.

**AR Q:** كيف أحدد نطاق القص؟

**AR A:** استخدم حقلي البداية/النهاية أو المنزلقين (بخطوة 0.1 ثانية). يُعطَّل التصدير إن لم تسبق البداية النهاية.

### Q4

**EN Q:** What can I download after cutting?

**EN A:** MP3 (default, 128 kbps) or WAV (uncompressed PCM). The file is named from your original with a -cut suffix.

**AR Q:** ماذا يمكنني تنزيله بعد القص؟

**AR A:** MP3 (الافتراضي، 128 كيلوبت/ث) أو WAV (PCM غير مضغوط). يُسمَّى الملف من الأصل مع لاحقة -cut.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q1 ≈ file-size-converter Q4
- DUPLICATE privacy filler EN Q1 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q1 ≈ hijri-gregorian-converter Q4
- DUPLICATE privacy filler EN Q1 ≈ audio-converter Q4
- DUPLICATE privacy filler EN Q1 ≈ audio-merger Q4

---

## audio-converter

### Q1

**EN Q:** What formats can I convert between?

**EN A:** Pick MP3 or WAV as the output first, then upload a file your browser can decode (MP3, WAV, M4A, OGG, and similar).

**AR Q:** ما الصيغ التي يمكن التحويل بينها؟

**AR A:** اختر MP3 أو WAV كمخرج أولاً، ثم ارفع ملفاً يفكه متصفحك (مثل MP3 وWAV وM4A وOGG).

### Q2

**EN Q:** Is the result lossless?

**EN A:** WAV export is uncompressed PCM. MP3 uses 128 kbps compression at 44.1 kHz, so it is smaller but lossy.

**AR Q:** هل النتيجة بدون فقد؟

**AR A:** تصدير WAV هو PCM غير مضغوط. MP3 يستخدم ضغط 128 كيلوبت/ث عند 44.1 كيلو هرتز، فهو أصغر لكنه بفقد.

### Q3

**EN Q:** When does conversion start?

**EN A:** As soon as you choose a file — there is no separate Convert button. Changing the output format afterward requires uploading again.

**AR Q:** متى يبدأ التحويل؟

**AR A:** فور اختيار الملف — لا يوجد زر تحويل منفصل. تغيير صيغة المخرج لاحقاً يتطلب الرفع من جديد.

### Q4

**EN Q:** Does my audio leave my device during conversion?

**EN A:** No. The file is decoded and re-encoded in your browser, then downloads locally.

**AR Q:** هل يغادر الصوت جهازي أثناء التحويل؟

**AR A:** لا. يُفك الملف ويُعاد ترميزه داخل متصفحك ثم يُنزَّل محلياً.

**FLAGS:** DUPLICATE, PRIVACY-REDUNDANT

Notes:
- DUPLICATE privacy filler EN Q4 ≈ file-size-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ hijri-gregorian-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ mp3-cutter Q1
- DUPLICATE privacy filler EN Q4 ≈ audio-merger Q4
- EN has 2 privacy/safety FAQs (Q1, Q4)
- AR has 3 privacy/safety FAQs (Q1, Q3, Q4)

---

## audio-merger

### Q1

**EN Q:** How many tracks do I need, and in what order?

**EN A:** Add at least two files. They merge in the order you added them — remove and re-add to change order.

**AR Q:** كم مقطعاً أحتاج وبأي ترتيب؟

**AR A:** أضف ملفين على الأقل. يُدمجان بترتيب الإضافة — احذف وأعد الإضافة لتغيير الترتيب.

### Q2

**EN Q:** What if sample rates or channels differ?

**EN A:** Later clips are matched to the first file’s sample rate and channel layout. Mixed sources often sound more predictable when you export WAV.

**AR Q:** ماذا لو اختلف معدل العينات أو القنوات؟

**AR A:** تُطابَق المقاطع اللاحقة مع معدل العينات وتخطيط القنوات للملف الأول. المصادر المختلطة غالباً أوضح عند التصدير إلى WAV.

### Q3

**EN Q:** Which output formats are available?

**EN A:** MP3 (default, 128 kbps) or WAV. The download is named merged-audio.

**AR Q:** ما صيغ الإخراج المتاحة؟

**AR A:** MP3 (الافتراضي، 128 كيلوبت/ث) أو WAV. يُنزَّل الملف باسم merged-audio.

### Q4

**EN Q:** Are my tracks uploaded when merging?

**EN A:** No. Concatenation and export run in your browser so your audio stays on your device.

**AR Q:** هل تُرفع مقاطعي عند الدمج؟

**AR A:** لا. الدمج والتصدير يعملان في متصفحك فيبقى الصوت على جهازك.

**FLAGS:** DUPLICATE

Notes:
- DUPLICATE privacy filler EN Q4 ≈ roman-numeral-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ hijri-gregorian-converter Q4
- DUPLICATE privacy filler EN Q4 ≈ mp3-cutter Q1
- DUPLICATE privacy filler EN Q4 ≈ audio-converter Q4

---

## voice-recorder

### Q1

**EN Q:** Where is my recording stored?

**EN A:** Only in your browser until you download it. Microphone audio is not sent to kitzos servers.

**AR Q:** أين يُخزَّن تسجيلي؟

**AR A:** في متصفحك فقط حتى التنزيل. صوت الميكروفون لا يُرسل إلى خوادم kitzos.

### Q2

**EN Q:** Which browsers can I use?

**EN A:** Current versions of Chrome, Firefox, Safari, and Edge that allow microphone recording in the browser.

**AR Q:** أي المتصفحات يمكن استخدامها؟

**AR A:** الإصدارات الحديثة من Chrome وFirefox وSafari وEdge التي تسمح بالتسجيل من الميكروفون داخل المتصفح.

### Q3

**EN Q:** What formats can I download?

**EN A:** After you stop, preview the clip then download WebM (original capture), MP3 (128 kbps), or WAV.

**AR Q:** ما الصيغ التي يمكن تنزيلها؟

**AR A:** بعد الإيقاف، عاين المقطع ثم نزّل WebM (التسجيل الأصلي) أو MP3 (128 كيلوبت/ث) أو WAV.

### Q4

**EN Q:** Can I pause or trim inside this tool?

**EN A:** No. Start and stop only — there is no pause/resume or in-tool trim. Use MP3 Cutter after download if you need to shorten the file.

**AR Q:** هل يمكن الإيقاف المؤقت أو القص داخل الأداة؟

**AR A:** لا. بدء وإيقاف فقط — بلا إيقاف مؤقت أو قص داخلي. استخدم أداة قص MP3 بعد التنزيل إن احتجت تقصير الملف.

**FLAGS:** AR-QUALITY

Notes:
- AR Q2: many Latin leftovers (Chrome, Firefox, Safari, Edge…)

---

## Summary

### Flag totals (tools with flag)

| Flag | Tools |
|---|---:|
| DUPLICATE | 34 |
| PRIVACY-REDUNDANT | 9 |
| ARTICLE-OVERLAP | 7 |
| AR-QUALITY | 6 |
| EN-AR-MISMATCH | 6 |
| TECH-JARGON | 4 |
| WRONG-CLAIM | 0 |

### Slug × flags (sorted by flag count desc)

| Slug | # | Flags |
|---|---:|---|
| image-resizer | 3 | TECH-JARGON, EN-AR-MISMATCH, DUPLICATE |
| pdf-to-jpg | 3 | TECH-JARGON, PRIVACY-REDUNDANT, ARTICLE-OVERLAP |
| rotate-pdf | 3 | TECH-JARGON, DUPLICATE, ARTICLE-OVERLAP |
| audio-converter | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| blur-image | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| compress-pdf | 2 | DUPLICATE, ARTICLE-OVERLAP |
| gif-maker | 2 | EN-AR-MISMATCH, DUPLICATE |
| glassmorphism-generator | 2 | AR-QUALITY, EN-AR-MISMATCH |
| heic-to-jpg | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| image-collage | 2 | EN-AR-MISMATCH, DUPLICATE |
| image-color-picker | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| js-minifier | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| merge-pdf | 2 | DUPLICATE, ARTICLE-OVERLAP |
| pdf-protect | 2 | DUPLICATE, ARTICLE-OVERLAP |
| pdf-sign | 2 | DUPLICATE, PRIVACY-REDUNDANT |
| pdf-watermark | 2 | DUPLICATE, ARTICLE-OVERLAP |
| remove-line-breaks | 2 | EN-AR-MISMATCH, DUPLICATE |
| split-pdf | 2 | DUPLICATE, ARTICLE-OVERLAP |
| add-text-to-image | 1 | DUPLICATE |
| audio-merger | 1 | DUPLICATE |
| barcode-generator | 1 | TECH-JARGON |
| compress-image | 1 | DUPLICATE |
| cooking-converter | 1 | DUPLICATE |
| crop-image | 1 | DUPLICATE |
| css-minifier | 1 | PRIVACY-REDUNDANT |
| data-unit-converter | 1 | DUPLICATE |
| exif-remover | 1 | DUPLICATE |
| extract-pages | 1 | DUPLICATE |
| file-size-converter | 1 | DUPLICATE |
| hijri-gregorian-converter | 1 | DUPLICATE |
| image-converter | 1 | DUPLICATE |
| image-watermark | 1 | DUPLICATE |
| markdown-to-html | 1 | PRIVACY-REDUNDANT |
| meta-tag-generator | 1 | AR-QUALITY |
| mp3-cutter | 1 | DUPLICATE |
| og-image-generator | 1 | AR-QUALITY |
| online-notepad | 1 | DUPLICATE |
| organize-pdf | 1 | DUPLICATE |
| passport-photo | 1 | DUPLICATE |
| qr-code-generator | 1 | EN-AR-MISMATCH |
| roman-numeral-converter | 1 | DUPLICATE |
| sql-formatter | 1 | AR-QUALITY |
| text-to-ascii-art | 1 | AR-QUALITY |
| voice-recorder | 1 | AR-QUALITY |
| xml-formatter | 1 | DUPLICATE |
| age-calculator | 0 | — |
| arabic-diacritics-remover | 0 | — |
| aspect-ratio-calculator | 0 | — |
| base64 | 0 | — |
| bmi-calculator | 0 | — |
| box-shadow-generator | 0 | — |
| calorie-calculator | 0 | — |
| case-converter | 0 | — |
| character-map | 0 | — |
| color-code-converter | 0 | — |
| color-palette-generator | 0 | — |
| color-picker | 0 | — |
| compound-interest | 0 | — |
| cron-expression-parser | 0 | — |
| csv-json-converter | 0 | — |
| date-difference | 0 | — |
| discount-calculator | 0 | — |
| due-date-calculator | 0 | — |
| favicon-generator | 0 | — |
| find-and-replace | 0 | — |
| flip-image | 0 | — |
| fuel-cost-calculator | 0 | — |
| gpa-calculator | 0 | — |
| gradient-generator | 0 | — |
| hash-generator | 0 | — |
| htaccess-redirect-generator | 0 | — |
| image-rotator | 0 | — |
| interaction-fx | 0 | — |
| json-formatter | 0 | — |
| json-to-typescript | 0 | — |
| jwt-decoder | 0 | — |
| line-sorter | 0 | — |
| loan-calculator | 0 | — |
| lorem-ipsum-generator | 0 | — |
| lorem-picsum-placeholder | 0 | — |
| mortgage-calculator | 0 | — |
| number-base-converter | 0 | — |
| number-to-words | 0 | — |
| password-generator | 0 | — |
| percentage-calculator | 0 | — |
| pomodoro-timer | 0 | — |
| random-picker | 0 | — |
| regex-tester | 0 | — |
| signature-pad | 0 | — |
| slug-generator | 0 | — |
| stopwatch-timer | 0 | — |
| svg-pattern-generator | 0 | — |
| temperature-converter | 0 | — |
| text-diff-checker | 0 | — |
| text-reverser | 0 | — |
| timestamp-converter | 0 | — |
| tip-calculator | 0 | — |
| typing-speed-test | 0 | — |
| unit-converter | 0 | — |
| url-encoder-decoder | 0 | — |
| uuid-generator | 0 | — |
| word-counter | 0 | — |
| word-frequency-counter | 0 | — |

_Phase 1 only — no content rewrites. Review and specify Phase 2 fixes._