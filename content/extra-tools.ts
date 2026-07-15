import type { FaqItem, HowToStep } from "@/lib/seo";

type ToolContent = { howTo: HowToStep[]; faq: FaqItem[] };
function content(howTo: HowToStep[], faq: FaqItem[]): ToolContent {
  return { howTo, faq };
}

export const extraToolContent: Record<string, ToolContent> = {
  "mp3-cutter": content(
    [
      { title: "Upload audio", description: "Select an MP3, WAV, or other audio file from your device." },
      { title: "Set trim range", description: "Use the sliders or number fields to pick start and end times." },
      { title: "Download", description: "Choose MP3 or WAV and download the trimmed clip instantly." },
    ],
    [
      { question: "Is my audio uploaded when I trim it?", answer: "No. Decoding, cutting, and export stay in your browser — your recording or track never leaves your device." },
      { question: "Which formats can I open?", answer: "Most audio types your browser can play, including MP3, WAV, M4A, OGG, Opus, and FLAC (and similar)." },
      { question: "How do I set the trim range?", answer: "Use the start/end number fields or the two sliders (0.1 s steps). Export is disabled if start is not before end." },
      { question: "What can I download after cutting?", answer: "MP3 (default, 128 kbps) or WAV (uncompressed PCM). The file is named from your original with a -cut suffix." },
    ]
  ),
  "audio-converter": content(
    [
      { title: "Choose output format", description: "Select MP3 or WAV before uploading." },
      { title: "Upload file", description: "Pick the audio file you want to convert." },
      { title: "Download", description: "The converted file downloads automatically when ready." },
    ],
    [
      { question: "What formats can I convert between?", answer: "Pick MP3 or WAV as the output first, then upload a file your browser can decode (MP3, WAV, M4A, OGG, and similar)." },
      { question: "Is the result lossless?", answer: "WAV export is uncompressed PCM. MP3 uses 128 kbps compression at 44.1 kHz, so it is smaller but lossy." },
      { question: "When does conversion start?", answer: "As soon as you choose a file — there is no separate Convert button. Changing the output format afterward requires uploading again." },
      { question: "Does my audio leave my device during conversion?", answer: "No. The file is decoded and re-encoded in your browser, then downloads locally." },
    ]
  ),
  "audio-merger": content(
    [
      { title: "Add tracks", description: "Upload two or more audio files in the order you want them merged." },
      { title: "Choose format", description: "Pick MP3 or WAV for the combined output." },
      { title: "Merge and download", description: "Click merge to concatenate clips into one file." },
    ],
    [
      { question: "How many tracks do I need, and in what order?", answer: "Add at least two files. They merge in the order you added them — remove and re-add to change order." },
      { question: "What if sample rates or channels differ?", answer: "Later clips are matched to the first file’s sample rate and channel layout. Mixed sources often sound more predictable when you export WAV." },
      { question: "Which output formats are available?", answer: "MP3 (default, 128 kbps) or WAV. The download is named merged-audio." },
      { question: "Are my tracks uploaded when merging?", answer: "No. Concatenation and export run in your browser so your audio stays on your device." },
    ]
  ),
  "voice-recorder": content(
    [
      { title: "Allow microphone", description: "Click start and approve microphone access when prompted." },
      { title: "Record", description: "Speak into your mic, then click stop when finished." },
      { title: "Preview and download", description: "Play back the recording, then download as WebM, MP3, or WAV." },
    ],
    [
      { question: "Where is my recording stored?", answer: "Only in your browser until you download it. Microphone audio is not sent to kitzos servers." },
      { question: "Which browsers can I use?", answer: "Current versions of Chrome, Firefox, Safari, and Edge that allow microphone recording in the browser." },
      { question: "What formats can I download?", answer: "After you stop, preview the clip then download WebM (original capture), MP3 (128 kbps), or WAV." },
      { question: "Can I pause or trim inside this tool?", answer: "No. Start and stop only — there is no pause/resume or in-tool trim. Use MP3 Cutter after download if you need to shorten the file." },
    ]
  ),
  "pdf-sign": content(
    [
      { title: "Upload PDF", description: "Select the PDF you want to sign." },
      { title: "Create your signature", description: "Draw on the pad or upload an image (PNG, JPG, WebP, and more)." },
      { title: "Position on the preview", description: "Drag and resize the signature on the page preview to place it exactly where you want." },
      { title: "Download signed PDF", description: "Choose which pages to sign, then download your signed document." },
    ],
    [
      {
        question: "Is the PDF uploaded?",
        answer:
          "No. Your signature and the document stay on your device — signing happens inside the browser with nothing uploaded.",
      },
      {
        question: "What image types can I upload as a signature?",
        answer:
          "Any image your browser can decode: PNG, JPG, WebP, GIF (first frame), SVG, and AVIF. Files are normalized to PNG before embedding.",
      },
      {
        question: "Will transparency be preserved?",
        answer:
          "Yes for PNG and images with transparency. JPEG uploads keep their white background unless you enable “Remove white background.” Drawn signatures export with a transparent background.",
      },
      {
        question: "How do I place one signature on several pages?",
        answer:
          "Choose all pages, a page range, or the current page. The signature is applied at the same relative position on each selected page.",
      },
    ]
  ),
  "pdf-watermark": content(
    [
      { title: "Upload PDF", description: "Choose the document to watermark." },
      {
        title: "Choose text or image",
        description:
          "Add text (with a self-hosted font) or upload a logo, then set size, opacity, rotation, and single or tiled layout.",
      },
      { title: "Download", description: "Get a copy with the watermark on every page." },
    ],
    [
      {
        question: "Can I use an image watermark?",
        answer:
          "Yes. Switch to Image mode, upload a PNG/JPG/WebP/SVG logo, and adjust size, opacity, rotation, and layout. Transparent PNGs keep their alpha.",
      },
      {
        question: "Does the watermark become part of the page?",
        answer:
          "Yes. When you export, the stamp is drawn onto every page of the downloaded PDF.",
      },
      {
        question: "Does Arabic text look correct?",
        answer:
          "Yes — choose an Arabic-capable font (marked AR). Arabic is rasterized with proper joining so the export matches the preview.",
      },
      {
        question: "What is the difference between Single and Tiled?",
        answer:
          "Single places one watermark you can reposition on the preview. Tiled repeats it across the page. Opacity and rotation apply to both.",
      },
    ]
  ),
  "pdf-protect": content(
    [
      { title: "Upload PDF", description: "Select an unprotected PDF file." },
      { title: "Set password", description: "Enter the password viewers will need to open the file." },
      { title: "Download locked PDF", description: "Save the encrypted copy locally." },
    ],
    [
      {
        question: "Is encryption done on my device?",
        answer:
          "Yes. Your PDF and password stay in the browser — the locked file is created locally and never uploaded.",
      },
      {
        question: "Can I remove a password here?",
        answer:
          "This tool only adds protection. To unlock a file, open it in a PDF reader with the password and save an unprotected copy.",
      },
      {
        question: "How strong is the protection?",
        answer:
          "The tool applies modern 256-bit PDF encryption. Strength still depends on a long, hard-to-guess password and sending it on a different channel than the file.",
      },
      {
        question: "What if the PDF is already password-protected?",
        answer:
          "Unlock it first, then protect it again here. This tool expects an unprotected PDF as input.",
      },
    ]
  ),
  "exif-remover": content(
    [
      { title: "Upload photo", description: "Choose a JPG, PNG, or WebP image." },
      { title: "Process", description: "The image is redrawn on canvas to strip metadata." },
      { title: "Download", description: "Save the clean JPEG without EXIF data." },
    ],
    [
      { question: "What metadata can be removed?", answer: "Fields such as GPS, camera model, timestamps, and other EXIF/IPTC tags embedded in the file. Sensitive fields are pre-selected; you can select or deselect tags before cleaning." },
      { question: "Which formats are supported?", answer: "JPEG, PNG, and WebP, including multiple files at once (individual download or a ZIP). WebP cleaned via full re-encode is saved as JPEG." },
      { question: "Will cleaning reduce image quality?", answer: "When the tool re-encodes (typical for PNG/WebP, or JPEG when stripping everything), JPEG output uses about 92% quality — usually close visually, without the hidden metadata. Selective JPEG tag removal can keep the original pixels." },
      { question: "Do my photos leave my device when stripping EXIF?", answer: "No. Metadata removal runs in your browser so location and camera details stay on your device until you download the cleaned files." },
    ]
  ),
  "og-image-generator": content(
    [
      { title: "Edit text and colors", description: "Set title, subtitle, background, and text colors." },
      {
        title: "Upload and frame the background",
        description:
          "Optional image fill uses cover. Adjust focus with the 3×3 grid or horizontal/vertical sliders.",
      },
      { title: "Export PNG", description: "Download 1200×630 for Twitter, Facebook, LinkedIn, and Discord." },
    ],
    [
      { question: "What size is OG standard?", answer: "1200×630 pixels is the recommended Open Graph image size." },
      {
        question: "Can I reposition the background image?",
        answer:
          "Yes. After uploading a background, use the position grid or sliders. Preview and PNG export use the same focal point.",
      },
      {
        question: "Can I use custom fonts?",
        answer:
          "Latin text uses system UI fonts. Arabic titles automatically use Noto Sans Arabic when Arabic characters are detected — you cannot upload your own font files.",
      },
      { question: "What format downloads?", answer: "PNG at 1200×630 matching the preview." },
    ]
  ),
  "favicon-generator": content(
    [
      { title: "Upload source image", description: "Use a square logo or icon for best results." },
      { title: "Auto resize", description: "The tool generates 16, 32, 48, 192, and 512 px PNGs." },
      { title: "Download ZIP", description: "Unzip and add icons to your site or PWA manifest." },
    ],
    [
      { question: "Which sizes are included?", answer: "16, 32, 48, 192, and 512 pixel PNG files." },
      { question: "Do I need a square image?", answer: "Square sources work best; non-square images are scaled to fit." },
      { question: "How do I get all sizes?", answer: "Upload once and download a ZIP containing every PNG size." },
      { question: "Which source formats work?", answer: "Common image types your browser can read, such as PNG or JPG." },
    ]
  ),
  "svg-pattern-generator": content(
    [
      { title: "Pick a pattern", description: "Choose dots, lines, or grid style." },
      { title: "Adjust colors and tile size", description: "Fine-tune pattern and background colors." },
      { title: "Copy CSS", description: "Paste the background CSS into your project." },
    ],
    [
      { question: "Is the pattern an SVG?", answer: "Yes. It is embedded as a data-URI SVG in the CSS background." },
      { question: "Can I use it commercially?", answer: "Patterns you generate are yours to use freely." },
      { question: "Which pattern styles exist?", answer: "Dots, lines, or grid — each tiles as a CSS background." },
      { question: "Can I adjust tile size and colors?", answer: "Yes. Change pattern color, background color, and tile size before copying the CSS." },
    ]
  ),
  "box-shadow-generator": content(
    [
      { title: "Adjust shadow", description: "Tweak offset, blur, spread, color, and inset." },
      { title: "Preview", description: "See the shadow on a live card element." },
      { title: "Copy CSS", description: "Copy the box-shadow rule into your stylesheet." },
    ],
    [
      { question: "Does it support multiple shadows?", answer: "This tool generates a single shadow layer. Duplicate the rule for stacked shadows." },
      { question: "What color format works?", answer: "Any valid CSS color, including hex with alpha like #00000040." },
      { question: "Can I make an inset shadow?", answer: "Yes. Toggle Inset to draw the shadow inside the preview card." },
      { question: "What does the preview show?", answer: "A live card with adjustable offset, blur, spread, shadow color/opacity, and optional inset." },
    ]
  ),
  "signature-pad": content(
    [
      { title: "Draw", description: "Sign with mouse, pen, or finger on the pad." },
      { title: "Clear if needed", description: "Reset and redraw until you are happy." },
      { title: "Download PNG", description: "Export a transparent-background signature image." },
    ],
    [
      { question: "Is the background transparent?", answer: "Yes. PNG export keeps transparency outside the ink strokes." },
      { question: "Works on mobile?", answer: "Yes. Draw with finger or stylus — touch scrolling is disabled on the pad so lines stay smooth." },
      { question: "Can I clear and redraw?", answer: "Yes. Clear wipes the pad so you can start over before downloading." },
      { question: "What size is exported?", answer: "PNG at 500×200 pixels with transparent pixels outside your strokes." },
    ]
  ),
  "color-palette-generator": content(
    [
      { title: "Pick a base color", description: "Choose your starting hue." },
      { title: "Select harmony", description: "Complementary, analogous, or triadic schemes." },
      { title: "Copy swatches", description: "Click any color to copy its hex code." },
    ],
    [
      { question: "How is this different from the color picker?", answer: "This tool generates full harmonious palettes, not just a single color." },
      { question: "Are colors accessible?", answer: "Check contrast manually before using text/background pairs in production UI." },
      { question: "Which harmony modes exist?", answer: "Complementary, analogous, or triadic schemes from one base color." },
      { question: "How do I copy a swatch?", answer: "Click any palette square to copy its HEX code." },
    ]
  ),
  "glassmorphism-generator": content(
    [
      { title: "Tune glass effect", description: "Adjust blur, opacity, and border strength." },
      { title: "Preview", description: "See the frosted card on a gradient backdrop." },
      { title: "Copy CSS", description: "Paste backdrop-filter and background rules into your design." },
    ],
    [
      { question: "Which browsers support the glass effect?", answer: "Frosted-glass blur works in current Chromium, Safari, and Firefox versions." },
      { question: "Can I use it on any element?", answer: "Yes. Apply the copied CSS to cards, modals, or nav bars over colorful backgrounds." },
      { question: "What can I adjust?", answer: "Blur (4–40px), panel opacity, border width, and the backdrop gradient color behind the preview." },
      { question: "What CSS is copied?", answer: "Background, backdrop-filter, border, and border-radius rules ready to paste." },
    ]
  ),
  "css-minifier": content(
    [
      { title: "Paste CSS", description: "Drop your stylesheet or snippet into the input area." },
      { title: "Format or minify", description: "Beautify for readability or compress for production." },
      { title: "Copy output", description: "Copy the result into your project." },
    ],
    [
      { question: "Is minification lossless?", answer: "Yes. Comments and whitespace are removed; rules stay functionally the same." },
      { question: "Does it run locally?", answer: "All processing happens in your browser." },
      { question: "Can I beautify as well as minify?", answer: "Yes. Switch between Format (readable) and Minify modes before copying output." },
      { question: "Is my stylesheet uploaded?", answer: "No. Paste stays on your device for the whole session." },
    ]
  ),
  "js-minifier": content(
    [
      { title: "Paste JavaScript", description: "Enter the script you want to compress." },
      { title: "Minify", description: "Terser loads dynamically and minifies with compress and mangle." },
      { title: "Copy result", description: "Use the minified output in production bundles." },
    ],
    [
      { question: "What does minify do to my script?", answer: "It removes whitespace and shortens names where safe, then shows the compressed output to copy." },
      { question: "Is my code uploaded?", answer: "No. Minification runs entirely in your browser after you click Minify." },
      { question: "When does minification start?", answer: "After you paste code and click Minify — there is no automatic run on every keystroke." },
      { question: "What if minification fails?", answer: "A syntax error message appears; fix the script and try Minify again." },
    ]
  ),
  "xml-formatter": content(
    [
      { title: "Paste XML", description: "Enter your XML document or fragment." },
      { title: "Format or minify", description: "Pretty-print with indentation or compress whitespace." },
      { title: "Copy output", description: "Copy the formatted or minified XML." },
    ],
    [
      { question: "Does it validate XML?", answer: "It formats structure visually but does not perform full schema validation." },
      { question: "Can I minify for APIs?", answer: "Yes. Minify removes extra whitespace between tags." },
      { question: "Can I beautify and minify?", answer: "Yes. Choose Format for indented output or Minify for a compact single-line style." },
      { question: "Is my XML sent to a server?", answer: "No. Formatting and minify run locally in your browser." },
    ]
  ),
  "sql-formatter": content(
    [
      { title: "Paste SQL", description: "Enter a query or script." },
      { title: "Format", description: "sql-formatter loads dynamically and applies indentation." },
      { title: "Copy output", description: "Copy the readable SQL." },
    ],
    [
      { question: "Which SQL dialect is supported?", answer: "Standard SQL formatting that works well for common read and write statements such as SELECT, INSERT, and UPDATE." },
      { question: "Do I need to click Format?", answer: "Yes. Paste your query, click Format, then copy the indented output." },
      { question: "What if formatting fails?", answer: "An error message appears. Fix the query syntax and try Format again." },
      { question: "Is my query logged anywhere?", answer: "No. Formatting runs locally in your browser after you click Format." },
    ]
  ),
  "url-encoder-decoder": content(
    [
      { title: "Choose mode", description: "Encode plain text to percent-encoding or decode an encoded string." },
      { title: "Enter value", description: "Type or paste the text to convert." },
      { title: "Copy result", description: "Copy the encoded or decoded output." },
    ],
    [
      { question: "Which encoding is used?", answer: "Standard percent-encoding for URL components — the same rules browsers use for encodeURIComponent." },
      { question: "Spaces in URLs?", answer: "Encoded as %20 when encoding text for URL components." },
      { question: "Can I switch encode and decode?", answer: "Yes. Toggle modes at the top; switching clears the input so you start fresh." },
      { question: "What if decoding fails?", answer: "Invalid percent-sequences show an error instead of partial output." },
    ]
  ),
  "uuid-generator": content(
    [
      { title: "Set count", description: "Choose how many UUIDs to generate (1–20)." },
      { title: "Generate", description: "Create cryptographically random UUID v4 values." },
      { title: "Copy all", description: "Copy every UUID at once, one per line." },
    ],
    [
      { question: "Which UUID version?", answer: "Version 4 (random) IDs from your browser's built-in secure random generator." },
      { question: "Are UUIDs unique?", answer: "Collision probability is negligible for practical use." },
      { question: "How many can I generate at once?", answer: "Choose 1–20 from the count dropdown, then click Generate." },
      { question: "Can I copy all results?", answer: "Yes. Copy all puts every UUID on its own line." },
    ]
  ),
  "cron-expression-parser": content(
    [
      { title: "Enter cron", description: "Type a standard 5-field cron expression." },
      { title: "Read description", description: "See a human-readable English summary of the schedule." },
    ],
    [
      { question: "How many fields?", answer: "Five: minute, hour, day-of-month, month, day-of-week." },
      { question: "Example: 0 9 * * 1?", answer: "Runs at 9:00 AM every Monday." },
      { question: "Does description update live?", answer: "Yes. The plain-English summary changes as you edit the expression." },
      { question: "What if the expression is invalid?", answer: "The description area shows an invalid message until the five fields parse correctly." },
    ]
  ),
  "color-code-converter": content(
    [
      { title: "Enter a color", description: "Paste HEX, RGB, or HSL." },
      { title: "View all formats", description: "See HEX, RGB, HSL, and HSV with copy buttons." },
    ],
    [
      { question: "Supported inputs?", answer: "HEX (#RRGGBB), rgb(), and hsl() strings." },
      { question: "Different from color picker?", answer: "This tool converts typed values; the picker is for visual selection." },
      { question: "What outputs do I get?", answer: "Matching HEX, RGB, HSL, and HSV values with copy buttons for each." },
      { question: "Does conversion update live?", answer: "Yes. Valid typed colors update all formats as you edit." },
    ]
  ),
  "meta-tag-generator": content(
    [
      { title: "Fill page details", description: "Enter title, description, canonical URL, and OG image." },
      { title: "Copy tags", description: "Paste meta, Open Graph, and Twitter Card tags into your HTML head." },
    ],
    [
      { question: "Which tags are included?", answer: "Page title, meta description, canonical link, Open Graph tags (og:*), and Twitter Card tags (twitter:*)." },
      { question: "Do I need all fields?", answer: "Fill what you have; empty fields are omitted from output." },
      { question: "Is a Twitter card set automatically?", answer: "When you add an image URL, twitter:card is set to summary_large_image in the output." },
      { question: "Where do I paste the output?", answer: "Inside the <head> section of your HTML page." },
    ]
  ),
  "htaccess-redirect-generator": content(
    [
      { title: "Set paths", description: "Enter the old and new URL paths." },
      { title: "Pick redirect type", description: "Choose 301 permanent or 302 temporary." },
      { title: "Copy rules", description: "Paste into your .htaccess file." },
    ],
    [
      { question: "Does this work on Nginx?", answer: "These are Apache mod_rewrite rules. Nginx uses a different syntax." },
      { question: "Paths with trailing slash?", answer: "Rules match optional trailing slashes on the source path." },
      { question: "301 or 302?", answer: "Pick permanent (301) or temporary (302) before copying the rule." },
      { question: "What do I enter for paths?", answer: "Old and new URL paths — the tool outputs ready-to-paste .htaccess lines." },
    ]
  ),
  "lorem-picsum-placeholder": content(
    [
      { title: "Set dimensions", description: "Choose width and height in pixels." },
      { title: "Pick a color", description: "Select background color for the placeholder." },
      { title: "Download PNG", description: "Save a local placeholder image with size label." },
    ],
    [
      { question: "Does this call an external image service?", answer: "No. The placeholder is drawn locally in your browser and downloads as PNG." },
      { question: "What is the maximum size?", answer: "Width and height each accept 1–4,000 pixels." },
      { question: "What appears on the image?", answer: "A solid background color with centered width × height label text." },
      { question: "Can I pick the background color?", answer: "Yes. Use the color picker; label text automatically switches to light or dark for contrast." },
    ]
  ),
  "json-to-typescript": content(
    [
      { title: "Paste JSON", description: "Enter a JSON object or array." },
      { title: "Set root name", description: "Name the top-level TypeScript interface." },
      { title: "Convert and copy", description: "Generate nested interfaces and copy the TypeScript." },
    ],
    [
      { question: "Nested objects?", answer: "Each nested object becomes a named interface derived from its key." },
      { question: "Arrays?", answer: "Homogeneous arrays use element types; object arrays get dedicated interfaces." },
      { question: "Can I name the root interface?", answer: "Yes. Set the root name field before clicking Convert." },
      { question: "What if JSON is invalid?", answer: "An error message appears and no TypeScript is generated until the JSON parses." },
    ]
  ),
  "interaction-fx": content(
    [
      { title: "Preview ripple", description: "Click the demo area to see the effect." },
      { title: "Customize", description: "Change color, duration, and ripple size." },
      { title: "Export code", description: "Copy CSS and JS that uses Pointer Events for mobile and desktop." },
    ],
    [
      { question: "Does exported code work on touch screens?", answer: "Yes. The press-effect snippet responds to both taps and mouse clicks." },
      { question: "Can I attach the press effect to my own button?", answer: "Yes. Call attachPressEffect on the element you want from the exported snippet." },
      { question: "Which press effect patterns are available?", answer: "Ripple, burst, shockwave, ring pulse, and ink spread — each with adjustable color, duration, and size." },
      { question: "Can I customize cursor motion too?", answer: "Yes. Pick dot, trail, glow, or ring presets and tune color and size, then copy or download both effects together." },
    ]
  ),
  "age-calculator": content(
    [
      { title: "Enter your birth date", description: "Pick your date of birth using the date picker." },
      { title: "Choose reference date", description: "Calculate age as of today or any other date." },
      { title: "Read your age", description: "See years, months, days, total days lived, and days until your next birthday." },
    ],
    [
      { question: "How is age calculated?", answer: "The tool counts full years, months, and days between your birth date and the reference date, accounting for varying month lengths." },
      { question: "Can I calculate age as of a specific date?", answer: "Yes. Pick any reference date or tap Use today to measure age as of the current day." },
      { question: "What else does the result show?", answer: "Besides years, months, and days, you also see total days lived and how many days remain until your next birthday." },
      { question: "Is my birth date stored?", answer: "No. Your birth and reference dates stay on your device — nothing is uploaded." },
    ]
  ),
  "tip-calculator": content(
    [
      { title: "Enter bill amount", description: "Type the pre-tip total from your receipt." },
      { title: "Set tip percentage", description: "Choose a tip rate such as 15% or 20%." },
      { title: "Split the bill", description: "Enter how many people are sharing the cost." },
      { title: "View totals", description: "See tip amount, grand total, and per-person share instantly." },
    ],
    [
      { question: "Can I split tips between people?", answer: "Yes. Enter the number of diners and the tool divides the total evenly." },
      { question: "Does this work offline?", answer: "Yes. It is a pure client-side calculator with no network requests." },
      { question: "What totals are shown?", answer: "Tip amount, bill plus tip grand total, and each person's share." },
      { question: "Can I use any tip percentage?", answer: "Yes. Enter any non-negative tip rate; results update instantly." },
    ]
  ),
  "gpa-calculator": content(
    [
      {
        title: "Add this term’s courses",
        description:
          "Optionally name each course, then enter credit hours and letter grades (plus/minus 4.0 scale).",
      },
      {
        title: "Optional: cumulative GPA",
        description:
          "Turn on Include previous GPA, enter prior GPA and credit hours, and mark retakes with the previous grade if needed.",
      },
      {
        title: "Read semester and cumulative results",
        description:
          "Your semester GPA updates live. With cumulative mode on, the new overall GPA is shown as the primary result.",
      },
    ],
    [
      {
        question: "What grading scale is used?",
        answer:
          "Standard 4.0 plus/minus scale: A+/A=4.0, A−=3.7, B+=3.3, B=3.0, B−=2.7, C+=2.3, C=2.0, C−=1.7, D+=1.3, D=1.0, D−=0.7, F=0.0 — weighted by credit hours.",
      },
      {
        question: "How does cumulative GPA work?",
        answer:
          "Enter your previous GPA and prior credit hours. The tool combines them with this term’s points: (prevGPA × prevCredits + semester points) ÷ (prevCredits + semester credits), adjusted for retakes.",
      },
      {
        question: "How are retakes calculated?",
        answer:
          "When cumulative mode is on, mark a course as a retake and choose the old grade. The calculator uses grade replacement: the old attempt’s points are removed and the credits are not double-counted. Policies vary by university.",
      },
      {
        question: "Are my courses saved?",
        answer:
          "Yes, locally in your browser (on this device only). Nothing is uploaded. Clearing site data removes the saved rows.",
      },
    ]
  ),
  "compound-interest": content(
    [
      { title: "Enter principal", description: "Type the starting investment or savings amount." },
      { title: "Set rate and time", description: "Enter annual interest rate and number of years." },
      { title: "Choose compound frequency", description: "Select how often interest is compounded (monthly, daily, etc.)." },
      { title: "View growth", description: "See final balance and total interest earned." },
    ],
    [
      { question: "What formula is used?", answer: "A = P × (1 + r/n)^(nt) where n is compounding periods per year." },
      { question: "Is tax included?", answer: "No. This shows gross compound growth before taxes or fees." },
      { question: "Which compounding frequencies are available?", answer: "Annual, semiannual, quarterly, monthly, and daily — pick how often interest is added." },
      { question: "What results are shown?", answer: "Final balance and total interest earned, formatted in USD based on your principal, rate, and years." },
    ]
  ),
  "mortgage-calculator": content(
    [
      { title: "Enter home price", description: "Type the purchase price of the property." },
      { title: "Set down payment", description: "Enter down payment as a percentage of the home price." },
      { title: "Enter rate and term", description: "Add annual interest rate and loan length in years." },
      { title: "Review payment and schedule", description: "See monthly P&I, total interest, and an amortization table." },
    ],
    [
      { question: "Does this include taxes and insurance?", answer: "No. It calculates principal and interest (P&I) only, unlike full escrow estimates." },
      { question: "How is this different from the loan calculator?", answer: "This tool uses home price and down payment and shows an amortization schedule for mortgages." },
      { question: "Does it show an amortization schedule?", answer: "Yes. A table lists monthly payment, principal, interest, and remaining balance for the first 24 months." },
      { question: "What summary figures are shown?", answer: "Loan amount after down payment, monthly P&I payment, total interest, and total amount paid over the term." },
    ]
  ),
  "fuel-cost-calculator": content(
    [
      { title: "Enter trip distance", description: "Type distance in kilometers or miles." },
      { title: "Set fuel consumption", description: "Use L/100 km or MPG depending on your vehicle specs." },
      { title: "Enter fuel price", description: "Add price per liter at the pump." },
      { title: "View trip cost", description: "See liters needed and total fuel cost for the trip." },
    ],
    [
      { question: "Which consumption units are supported?", answer: "Liters per 100 km (common in Europe/MENA) and US miles per gallon." },
      { question: "Are conversions accurate?", answer: "Yes. Distance and MPG values are converted using standard conversion factors." },
      { question: "What do I need to enter?", answer: "Trip distance (km or miles), fuel consumption (L/100 km or MPG), and price per liter at the pump." },
      { question: "What does the result include?", answer: "Total liters needed for the trip and the estimated fuel cost in your entered currency." },
    ]
  ),
  "discount-calculator": content(
    [
      { title: "Enter original price", description: "Type the price before discount." },
      { title: "Enter discount percent", description: "Add the sale or coupon percentage off." },
      { title: "See savings", description: "View final price and amount saved instantly." },
    ],
    [
      { question: "Can discount exceed 100%?", answer: "No. Valid discounts are 0–100%." },
      { question: "Does this stack multiple discounts?", answer: "This tool applies a single discount percentage. For stacked discounts, calculate step by step." },
      { question: "What results are shown?", answer: "Final sale price and the amount you save, updated as you type." },
      { question: "Are prices I enter stored anywhere?", answer: "No. Calculations run in your browser; your amounts are not saved or uploaded." },
    ]
  ),
  "aspect-ratio-calculator": content(
    [
      { title: "Enter dimensions", description: "Type width and height in pixels or any unit." },
      { title: "Use presets", description: "Quick-fill common ratios like 16:9 or 4:3." },
      { title: "Scale dimensions", description: "Enter a target width or height to compute the matching side." },
    ],
    [
      { question: "What is aspect ratio?", answer: "The proportional relationship between width and height, expressed as W:H (e.g. 16:9)." },
      { question: "Are ratios simplified?", answer: "Yes. The tool reduces dimensions to the smallest whole-number ratio using GCD." },
      { question: "What do the preset buttons do?", answer: "They fill common ratios such as 16:9, 4:3, 3:2, 1:1, and 9:16 so you can start from a standard proportion." },
      { question: "Can I scale to a target width or height?", answer: "Yes. Enter a target width to compute the matching height, or enter a target height to compute the matching width." },
    ]
  ),
  "number-base-converter": content(
    [
      { title: "Enter a value", description: "Type digits valid for the source base (0–9, A–F for hex)." },
      { title: "Select bases", description: "Choose source and target bases: binary, octal, decimal, or hexadecimal." },
      { title: "Copy result", description: "The converted value appears instantly." },
    ],
    [
      { question: "Which bases are supported?", answer: "Binary (2), octal (8), decimal (10), and hexadecimal (16)." },
      { question: "Are negative numbers supported?", answer: "This tool converts non-negative integers only." },
      { question: "What if I type invalid digits for the base?", answer: "The result area shows an invalid message until every character is valid for the selected source base." },
      { question: "Is my number sent anywhere?", answer: "No. Base conversion runs locally in your browser." },
    ]
  ),
  "roman-numeral-converter": content(
    [
      { title: "Choose direction", description: "Convert Arabic numerals to Roman or Roman to Arabic." },
      { title: "Enter value", description: "Type a number (1–3999) or a Roman numeral such as MMXXVI." },
      { title: "Copy result", description: "The converted value appears instantly below." },
    ],
    [
      { question: "What range is supported?", answer: "Standard Roman numerals from 1 to 3999 (no vinculum notation)." },
      { question: "Is input case-sensitive?", answer: "Roman input is normalized to uppercase before parsing." },
      { question: "Can I convert in both directions?", answer: "Yes. Switch between Arabic numeral to Roman and Roman to Arabic numeral modes." },
      { question: "Does my input leave my device?", answer: "No. Conversion runs locally; nothing is uploaded." },
    ]
  ),
  "number-to-words": content(
    [
      { title: "Enter a number", description: "Type a whole number from 0 up to 999 billion." },
      { title: "Pick language", description: "Choose English or Arabic (tafqit) output." },
      { title: "Copy words", description: "Read or copy the spelled-out result." },
    ],
    [
      { question: "What is tafqit?", answer: "Arabic legal and formal spelling of numbers in words, used on checks and official documents." },
      { question: "Are decimals supported?", answer: "This tool converts whole numbers only." },
      { question: "What number range is supported?", answer: "Whole numbers from 0 up to 999 billion in either English or Arabic output." },
      { question: "Can I switch output language?", answer: "Yes. Choose English or Arabic (tafqit) from the language dropdown." },
    ]
  ),
  "file-size-converter": content(
    [
      { title: "Enter size", description: "Type a file size value as a number." },
      { title: "Select units", description: "Pick source and target units (B, KB, MB, GB, TB, PB)." },
      { title: "Choose base", description: "Use binary (1024) for OS storage or decimal (1000) for SI units." },
    ],
    [
      { question: "Binary vs decimal?", answer: "Binary (KiB-style) uses 1024 per step; decimal uses 1000. Windows often shows binary sizes." },
      { question: "Why do sizes differ from labels?", answer: "Drive makers often use decimal GB while operating systems use binary GiB." },
      { question: "Which size units are supported?", answer: "Bytes through petabytes: B, KB, MB, GB, TB, and PB." },
      { question: "Does my file size data leave my device?", answer: "No. Size conversions happen entirely in your browser." },
    ]
  ),
  "temperature-converter": content(
    [
      { title: "Enter temperature", description: "Type a value in the source scale." },
      { title: "Select scales", description: "Convert between Celsius, Fahrenheit, and Kelvin." },
      { title: "Read result", description: "See the converted value and a helpful reference note." },
    ],
    [
      { question: "How is Kelvin defined?", answer: "Kelvin starts at absolute zero. K = °C + 273.15." },
      { question: "Are negative Fahrenheit values supported?", answer: "Yes. Any valid numeric temperature converts correctly." },
      { question: "Where can I convert length or volume?", answer: "Use the Unit Converter for length, weight, area, and volume measurements." },
      { question: "Are impossible Kelvin values rejected?", answer: "Yes. Kelvin input below zero or results colder than absolute zero show as invalid." },
    ]
  ),
  "data-unit-converter": content(
    [
      { title: "Enter value", description: "Type a number for bits, bytes, storage, or speed." },
      { title: "Select units", description: "Pick from bits, bytes, KB, MB, GB, Mbps, or Gbps." },
      { title: "Read result", description: "The equivalent value in the target unit appears instantly." },
    ],
    [
      { question: "Bits vs bytes?", answer: "One byte equals 8 bits. Network speeds are usually quoted in bits per second." },
      { question: "Is storage binary?", answer: "KB, MB, and GB here use 1024-based steps (8 bits per byte)." },
      { question: "Can I convert between storage and speed units?", answer: "Yes. Convert among bits, bytes, KB, MB, GB, Mbps, and Gbps in either direction." },
      { question: "Are my values uploaded?", answer: "No. Numbers you enter are converted locally and never sent to a server." },
    ]
  ),
  "cooking-converter": content(
    [
      { title: "Enter amount", description: "Type the quantity from your recipe." },
      { title: "Select units", description: "Convert cups, tablespoons, teaspoons, ml, fl oz, or grams (water)." },
      { title: "Use result", description: "Apply the converted amount in your kitchen or recipe app." },
    ],
    [
      { question: "US or metric cups?", answer: "This tool uses US customary cup (≈237 ml), tablespoon, and teaspoon measures." },
      { question: "Are grams exact for all ingredients?", answer: "Grams assume water density (1 ml ≈ 1 g). Flour, sugar, and oils differ." },
      { question: "Which units can I convert?", answer: "US cup, tablespoon, teaspoon, milliliters, US fluid ounces, and grams (water equivalent)." },
      { question: "Do my recipe amounts leave my device?", answer: "No. Conversions run entirely in your browser." },
    ]
  ),
  "hijri-gregorian-converter": content(
    [
      { title: "Choose direction", description: "Convert Gregorian to Hijri or Hijri to Gregorian." },
      { title: "Enter date", description: "Pick a Gregorian date or enter Hijri year, month, and day." },
      { title: "Read result", description: "See the equivalent date with month names in your locale." },
    ],
    [
      { question: "How accurate is the Hijri date?", answer: "Uses a standard tabular algorithm. Official Umm al-Qura dates may differ by one day." },
      { question: "Can I convert in both directions?", answer: "Yes. Switch between Gregorian to Hijri and Hijri to Gregorian at the top." },
      { question: "How do I enter a Hijri date?", answer: "Type the Hijri year and day, then pick the month from the dropdown with month names in your language." },
      { question: "Do the dates I pick leave my device?", answer: "No. Calendar conversion runs entirely in your browser; nothing is uploaded." },
    ]
  ),
  "word-frequency-counter": content(
    [
      { title: "Paste your text", description: "Enter or paste the passage you want to analyze." },
      { title: "Review counts", description: "See each word and how many times it appears, sorted by frequency." },
      { title: "Use the stats", description: "Check total words and unique words for SEO or writing analysis." },
    ],
    [
      { question: "Are words case-sensitive?", answer: "No. Words are lowercased before counting. Punctuation at word edges is stripped." },
      { question: "Does it support Arabic?", answer: "Yes. Arabic and Latin letters are counted after splitting on whitespace and trimming edge punctuation." },
      { question: "How are results sorted?", answer: "Highest count first. When two words tie, they sort alphabetically." },
      { question: "Where does counting happen?", answer: "Entirely in your browser as you paste or type — your text is not uploaded for analysis." },
    ]
  ),
  "arabic-diacritics-remover": content(
    [
      { title: "Paste Arabic text", description: "Enter text that includes tashkeel (harakat) and other diacritics." },
      { title: "View clean output", description: "Diacritical marks are removed instantly as you type or paste." },
      { title: "Copy result", description: "Copy the stripped text for search, NLP, or plain display." },
    ],
    [
      { question: "What is removed?", answer: "Arabic harakat such as fatha, damma, kasra, sukun, shadda, and tanween marks." },
      { question: "Are letters changed?", answer: "Only diacritics are removed. Base Arabic letters and spacing stay the same." },
      { question: "Does output update as I paste?", answer: "Yes. Stripping happens instantly while you type or paste in the input area." },
      { question: "Is processing local?", answer: "Yes. Nothing is sent to kitzos servers." },
    ]
  ),
  "line-sorter": content(
    [
      { title: "Paste lines", description: "Enter one item per line in the text area." },
      { title: "Choose sort mode", description: "Sort alphabetically, reverse order, or shuffle randomly." },
      { title: "Remove duplicates", description: "Optionally deduplicate lines while keeping one copy of each." },
      { title: "Copy sorted text", description: "Copy the reordered lines for lists, configs, or data cleanup." },
    ],
    [
      { question: "Is sorting case-sensitive?", answer: "Alphabetical sort uses locale-aware comparison, which handles mixed case naturally." },
      { question: "Does random shuffle repeat?", answer: "Each shuffle produces a new random order using in-browser randomness." },
      { question: "Can I remove duplicate lines?", answer: "Yes. Turn on Remove duplicates before sorting or shuffling to keep one copy of each line." },
      { question: "What sort orders are available?", answer: "A–Z ascending, Z–A descending, or random shuffle." },
    ]
  ),
  "text-reverser": content(
    [
      { title: "Enter text", description: "Type or paste the string you want to reverse." },
      { title: "Pick reverse mode", description: "Reverse all characters, each line, or word order within lines." },
      { title: "Copy output", description: "Use the reversed text for puzzles, testing, or creative effects." },
    ],
    [
      { question: "Does it work with Arabic?", answer: "Yes. Character and word reversal respect Unicode text direction." },
      { question: "Are line breaks preserved?", answer: "Line-based modes keep newline structure; full reverse flips the entire string." },
      { question: "What reverse modes exist?", answer: "Reverse the whole string, reverse line order, or reverse word order while keeping spacing." },
      { question: "Does output update live?", answer: "Yes. The reversed text updates as you type or paste." },
    ]
  ),
  "slug-generator": content(
    [
      { title: "Enter a title", description: "Type a page title, product name, or heading." },
      { title: "Read the slug", description: "The tool converts it to lowercase with hyphens and no special characters." },
      { title: "Copy slug", description: "Paste the slug into URLs, CMS permalinks, or file names." },
    ],
    [
      { question: "Are Arabic titles supported?", answer: "Yes. Arabic letters are kept in the slug. Latin accented letters are normalized; other symbols become hyphens or are removed." },
      { question: "What characters are removed?", answer: "Punctuation and symbols are stripped; spaces and underscores become single hyphens." },
      { question: "Does the slug update automatically?", answer: "Yes. The slug updates as you type — no separate generate button." },
      { question: "What if my title has only symbols?", answer: "You may get an empty slug. Add letters or words first, then copy the result." },
    ]
  ),
  "find-and-replace": content(
    [
      { title: "Enter source text", description: "Paste the document or snippet to edit." },
      { title: "Set find and replace", description: "Type the search string and what to replace it with." },
      { title: "Enable regex (optional)", description: "Turn on regular expressions for pattern-based replacements." },
      { title: "Replace all", description: "Apply every match at once and copy the updated text." },
    ],
    [
      { question: "Does pattern mode use regular expressions?", answer: "Yes. Enable the regex checkbox for pattern-based find and replace with global matching." },
      { question: "Can I undo a replace?", answer: "Use your browser undo in the textarea or re-paste the original text." },
      { question: "Is replacement live or on a button?", answer: "A live preview and match count appear below. Click Replace all to write the result back into the input field." },
      { question: "What if my pattern is invalid?", answer: "An error message appears and no replacements run until you fix the pattern." },
    ]
  ),
  "text-to-ascii-art": content(
    [
      { title: "Type your message", description: "Enter Latin text for figlet banners, or Arabic for block-letter output." },
      { title: "Pick a font", description: "Choose a figlet font for Latin text (hidden for Arabic input)." },
      { title: "Copy or download", description: "Copy the banner or save it as a text file." },
    ],
    [
      { question: "Does Arabic work?", answer: "Pure Arabic input cannot render as ASCII art — the tool explains why and asks for Latin letters. Mixed Arabic/Latin input converts the Latin parts only." },
      { question: "Which banner styles can I pick?", answer: "For Latin text choose Standard, Big, Slant, Banner, or Block styles from the font list." },
      { question: "Does it work offline?", answer: "After the page loads, generation runs locally without network calls." },
      { question: "Can I copy or save the result?", answer: "Yes. Copy the banner text or download it as a .txt file." },
    ]
  ),
  "character-map": content(
    [
      { title: "Browse categories", description: "Use tabs for arrows, math, currency, emoji, keyboard keys, shapes, and more." },
      { title: "Search in English or Arabic", description: "Filter by tags like heart, سهم, قلب, نجمة, euro, يورو." },
      { title: "Click to copy", description: "Tap any symbol to copy it — a confirmation appears when copied." },
    ],
    [
      { question: "How many symbols are included?", answer: "Hundreds of symbols organized in categories including emoji and keyboard key labels for common platforms." },
      { question: "Does copy work on mobile?", answer: "Yes. Tap a symbol to copy it when your browser allows clipboard access." },
      { question: "Can I search in Arabic?", answer: "Yes. Search accepts English and Arabic tags such as heart, arrow, سهم, قلب, or نجمة." },
      { question: "What categories can I browse?", answer: "Arrows, math, currency, emoji, keyboard keys, shapes, Arabic letters, legal marks, and more — or view all at once." },
    ]
  ),
  "image-rotator": content(
    [
      { title: "Upload an image", description: "Choose JPG, PNG, or WebP from your device." },
      { title: "Rotate", description: "Turn the image 90°, 180°, or 270° with instant preview." },
      { title: "Download PNG", description: "Save the rotated image locally." },
    ],
    [
      { question: "By how many degrees can I rotate?", answer: "In 90° steps only: buttons add 90°, 180°, or 270° (cumulative, wrapping at 360°). Free-angle rotation is not available." },
      { question: "What format is exported?", answer: "Always PNG at the image’s full pixel size. Width and height swap on 90° and 270° turns." },
      { question: "Need to flip or mirror instead?", answer: "Use the Flip Image tool linked on the page for horizontal or vertical mirroring." },
      { question: "Is my image sent anywhere to rotate it?", answer: "No. Rotation stays in your browser and the PNG downloads to your device." },
    ]
  ),
  "add-text-to-image": content(
    [
      { title: "Upload image", description: "Select the photo or graphic to annotate." },
      {
        title: "Add and position text layers",
        description:
          "Use Add text for multiple captions. Drag any layer on the preview to place it, or nudge with arrow keys.",
      },
      {
        title: "Style the selected layer",
        description:
          "Pick a layer, then set message, font family, size, curve (Latin text only), color, and outline.",
      },
      { title: "Download PNG", description: "Export the image with all text layers at full resolution." },
    ],
    [
      { question: "Can I add more than one caption?", answer: "Yes. Add up to 10 text layers. Select a layer to edit its message, font, size (12–120), color, and outline." },
      { question: "How do I position text?", answer: "Drag any layer on the preview, or nudge the selected layer with the arrow keys. Export is always a full-resolution PNG." },
      { question: "Does curved text work with Arabic?", answer: "Curvature (−100 to 100) is for Latin-script text. When a layer contains Arabic, curvature is disabled and forced flat." },
      { question: "Do my photos stay private while I add text?", answer: "Yes. Text is composited in your browser — your image is not uploaded." },
    ]
  ),
  "image-collage": content(
    [
      { title: "Add photos", description: "Upload 2–4 images for your grid layout." },
      { title: "Adjust gap", description: "Set spacing between cells for a tighter or airier collage." },
      { title: "Download collage", description: "Export the combined grid as one PNG file." },
    ],
    [
      { question: "How many images can I use?", answer: "Between 2 and 4 photos. Layout options change with the count (for example 2-cols, 2-rows, 3-cols, or 2×2)." },
      { question: "Can I adjust spacing and framing inside each cell?", answer: "Yes. Set the gap from 0 to 32px (default 8). Select a cell to zoom 0.5–2.5× and drag to pan within that cell." },
      { question: "What size is the exported collage?", answer: "A single 800×800 PNG on a white background." },
      { question: "Are my collage photos uploaded?", answer: "No. The grid is built and exported in your browser on your device." },
    ]
  ),
  "heic-to-jpg": content(
    [
      { title: "Upload HEIC files", description: "Select one or more iPhone HEIC photos from your device." },
      { title: "Set JPEG quality", description: "Use the quality slider to balance file size and visual fidelity." },
      { title: "Download results", description: "Save each JPG individually or download all as a ZIP archive." },
    ],
    [
      { question: "Do my iPhone HEIC photos get uploaded?", answer: "No. HEIC/HEIF conversion runs in your browser — your photos stay on your device." },
      { question: "Can I convert several photos at once?", answer: "Yes. Upload multiple HEIC or HEIF files, then download each JPG or one ZIP of all results." },
      { question: "How do I balance file size and quality?", answer: "Use the JPEG quality slider from 10 to 100 (default 90). Lower values make smaller files; changing quality reconverts the loaded batch." },
      { question: "What do I get after conversion?", answer: "Each photo becomes a JPG with the same base name. There is no on-page image preview — you see file names and sizes in the list." },
    ]
  ),
  "flip-image": content(
    [
      { title: "Upload an image", description: "Choose a PNG or JPG photo." },
      { title: "Pick flip direction", description: "Flip horizontally, vertically, or both with instant preview." },
      { title: "Download", description: "Export in the same format as the original file." },
    ],
    [
      { question: "Which flip directions are supported?", answer: "Horizontal, vertical, or both at once. Toggles update the preview immediately." },
      { question: "Does flipping reduce quality?", answer: "Mirroring does not soften the image. JPEG sources export as JPEG; other types export as PNG at full resolution." },
      { question: "Need rotation instead of a mirror?", answer: "Use the Image Rotator link on the page for 90°, 180°, or 270° turns." },
      { question: "Does my photo leave the browser when I flip it?", answer: "No. The flip is applied locally and you download the result from your device." },
    ]
  ),
  "blur-image": content(
    [
      { title: "Upload a photo", description: "Choose the image you want to redact before sharing." },
      { title: "Draw regions", description: "Drag rectangles over faces, license plates, or sensitive text. Add multiple regions." },
      { title: "Pixelate or blur and export", description: "Pixelate is best for secure redaction. Adjust strength, then download PNG or JPG." },
    ],
    [
      { question: "Can I redact more than one area?", answer: "Yes. Draw as many rectangles as you need; each region is listed with its size in image pixels so you can delete or refine it." },
      { question: "Should I use blur or pixelate?", answer: "Prefer pixelate at high strength for secure redaction (default mode). Light blur can sometimes still be recoverable." },
      { question: "What strength ranges can I set?", answer: "Pixelate intensity runs from 8 to 64 (default 16). Blur runs from 2 to 40. Export is JPEG for JPEG sources, otherwise PNG." },
      { question: "Does my photo leave my device while redacting?", answer: "No. Regions are applied in your browser so you can hide faces, plates, or text before sharing — nothing is uploaded." },
    ]
  ),
  "image-watermark": content(
    [
      { title: "Upload your image", description: "Choose the photo or graphic to watermark." },
      { title: "Add text watermark", description: "Type your label, set size, color, opacity, and rotation. Drag on the preview to position." },
      { title: "Export", description: "Enable tile mode for diagonal repeats, then download in the original format." },
    ],
    [
      { question: "Can I move the watermark?", answer: "Yes, in single mode: drag the text on the live preview. Default text is CONFIDENTIAL; empty text draws nothing." },
      { question: "What does tile mode do?", answer: "It repeats your watermark in a diagonal pattern across the whole image. Positioning by drag is for single mode only." },
      { question: "What styling options are available?", answer: "Font size 12–120, color, opacity 0.1–1, and rotation from −90° to 90° (default about −35°)." },
      { question: "Are my photos uploaded to add a watermark?", answer: "No. The overlay is drawn in your browser and exported as JPEG or the source format on your device." },
    ]
  ),
  "image-color-picker": content(
    [
      { title: "Upload an image", description: "Choose any photo or screenshot with colors you want to sample." },
      { title: "Click to pick", description: "Click any pixel to capture its color. Values appear in HEX, RGB, and HSL." },
      { title: "Copy or review history", description: "Copy any format with one click. Recent picks stay in session history." },
    ],
    [
      { question: "How do I read a color from my image?", answer: "Upload a photo or screenshot, then click the preview. The color under the click is shown as HEX, RGB, and HSL with one-click copy." },
      { question: "How accurate is the sampled color?", answer: "It reads the pixel under your click on the on-screen preview. Very large images are scaled down for display, so the sample matches what you see, not necessarily a full-resolution source pixel." },
      { question: "Is there a history of recent picks?", answer: "Yes. Up to 12 recent colors stay in the session history until you load a new image." },
      { question: "Does my image leave my device?", answer: "No. Color sampling happens in your browser — the photo is never uploaded." },
    ]
  ),
  "passport-photo": content(
    [
      { title: "Choose a size preset", description: "Pick 2×2 in (US), 35×45 mm (Schengen), 40×60 mm, or enter custom dimensions at 300 DPI." },
      { title: "Upload and crop", description: "Drag and zoom your photo under the fixed-ratio frame. Use a plain light background when possible." },
      { title: "Export photo or sheet", description: "Download a single passport photo or tile copies onto a 4×6 in / A6 printable sheet." },
    ],
    [
      { question: "Which official sizes are supported?", answer: "Presets for US 2×2 in, Schengen 35×45 mm, and 40×60 mm, plus custom width/height. Zoom and pan under the fixed frame to crop." },
      { question: "What print resolution is used?", answer: "Exports default to 300 DPI. You can set DPI from 72 to 600; pixel size follows inches (or mm) × DPI." },
      { question: "Can I print multiple copies on one sheet?", answer: "Yes. Download a single photo or a tiled sheet on 4×6 in or A6 paper. Output is JPEG." },
      { question: "Do my photos leave my device?", answer: "No. Cropping and sheet layout run in your browser — your portrait stays on your device." },
    ]
  ),
  "gif-maker": content(
    [
      { title: "Add frames", description: "Upload up to 50 images. Reorder frames with the up/down controls." },
      { title: "Set timing", description: "Adjust frame delay in milliseconds and toggle loop on or off." },
      { title: "Encode and download", description: "Choose max dimension (480 or 720 px), encode with progress, then save the animated GIF." },
    ],
    [
      { question: "How many frames can I add?", answer: "Up to 50 images. You need at least 2 frames to encode. Reorder with the up/down controls." },
      { question: "How do I control speed and looping?", answer: "Set frame delay from 50 to 2000 ms (default 200, step 10) and toggle loop on or off (loop defaults on)." },
      { question: "What output size options exist?", answer: "Cap the longest side at 480px (default) or 720px. Frames are centered on a white background, so source transparency is not kept." },
      { question: "Do my frames leave my device?", answer: "No. GIF encoding runs in your browser — your images stay on your device until you download animation.gif." },
    ]
  ),
  "barcode-generator": content(
    [
      { title: "Enter barcode data", description: "Type the value to encode (numbers or text depending on format)." },
      { title: "Choose format", description: "Select CODE128, EAN13, UPC, or CODE39." },
      { title: "Download barcode", description: "Export as SVG or PNG for labels, packaging, or inventory." },
    ],
    [
      { question: "Which formats need fixed lengths?", answer: "EAN13 requires 12 digits; UPC requires 11 digits. CODE128 and CODE39 are more flexible." },
      { question: "Can I download the barcode as PNG?", answer: "Yes. Preview as SVG or canvas, then use Download PNG to save a white-background image." },
      { question: "What happens if the value is invalid for the format?", answer: "An error message appears and the preview clears until you enter a valid value for the selected format." },
      { question: "Is generation local?", answer: "Yes. Barcodes render in your browser; your text is never uploaded." },
    ]
  ),
  "stopwatch-timer": content(
    [
      { title: "Pick mode", description: "Switch between stopwatch and countdown tabs." },
      { title: "Start timing", description: "Run the stopwatch with lap splits, or set minutes and seconds for a countdown." },
      { title: "Pause or reset", description: "Pause anytime and reset to start over." },
    ],
    [
      { question: "Does the countdown beep?", answer: "Yes. A short beep plays when the countdown reaches zero (if audio is allowed)." },
      { question: "Are lap times saved?", answer: "Laps appear in-session only; refresh clears stopwatch data." },
      { question: "What is the difference between the two tabs?", answer: "Stopwatch counts up with lap splits; countdown counts down from minutes and seconds you set." },
      { question: "Does the stopwatch show centiseconds?", answer: "Yes. Elapsed time displays as MM:SS.cs with hundredths of a second while running." },
    ]
  ),
};
