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
      { question: "Is my audio uploaded?", answer: "No. Decoding and export happen locally in your browser." },
      { question: "Which formats are supported?", answer: "Most formats your browser can decode, including MP3, WAV, M4A, and OGG." },
    ]
  ),
  "audio-converter": content(
    [
      { title: "Choose output format", description: "Select MP3 or WAV before uploading." },
      { title: "Upload file", description: "Pick the audio file you want to convert." },
      { title: "Download", description: "The converted file downloads automatically when ready." },
    ],
    [
      { question: "How does WAV to MP3 work?", answer: "The file is decoded with Web Audio API, then re-encoded to MP3 using lamejs in your browser." },
      { question: "Is quality lossless?", answer: "WAV export is lossless. MP3 uses 128 kbps compression." },
    ]
  ),
  "audio-merger": content(
    [
      { title: "Add tracks", description: "Upload two or more audio files in the order you want them merged." },
      { title: "Choose format", description: "Pick MP3 or WAV for the combined output." },
      { title: "Merge and download", description: "Click merge to concatenate clips into one file." },
    ],
    [
      { question: "Can I reorder tracks?", answer: "Remove and re-add files in the desired order before merging." },
      { question: "Do sample rates need to match?", answer: "Files are concatenated as decoded buffers; very mixed sources may sound best as WAV." },
    ]
  ),
  "voice-recorder": content(
    [
      { title: "Allow microphone", description: "Click start and approve microphone access when prompted." },
      { title: "Record", description: "Speak into your mic, then click stop when finished." },
      { title: "Preview and download", description: "Play back the recording and download as WebM." },
    ],
    [
      { question: "Where is my recording stored?", answer: "Only in your browser memory until you download it. Nothing is sent to kitzos servers." },
      { question: "Which browsers work?", answer: "Modern Chrome, Firefox, Safari, and Edge with MediaRecorder support." },
    ]
  ),
  "image-to-text": content(
    [
      {
        title: "Choose text language",
        description:
          "Select English, Arabic, or both for mixed documents. For best Arabic accuracy, choose Arabic only.",
      },
      {
        title: "Upload your image",
        description:
          "Drop a clear photo or screenshot (JPG, PNG, WebP). Processing happens in your browser — your image is never uploaded to any server.",
      },
      {
        title: "Improve accuracy (optional)",
        description:
          "Enable image enhancement or rotate a tilted photo for a more accurate result.",
      },
      {
        title: "Copy the text",
        description: "Review the extracted text and copy it with one click.",
      },
    ],
    [
      {
        question: "How do I convert an image to text for free?",
        answer:
          "Upload the image, choose the language, and the tool will extract text automatically using OCR. Completely free, no sign-up, and runs right in your browser.",
      },
      {
        question: "Does the tool support extracting Arabic text from images?",
        answer:
          'Yes, it supports Arabic and English. For best Arabic accuracy, choose "Arabic only" and use a clear image with readable text.',
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. All processing happens entirely inside your browser, and your image never leaves your device — complete privacy, unlike tools that upload your files.",
      },
      {
        question: "Is there a limit on the number or size of images?",
        answer:
          "There is no limit on the number of images. The tool has no daily caps and no subscription, unlike many sites that limit you to a few images per hour.",
      },
      {
        question: "How accurate is Arabic text extraction?",
        answer:
          "Accuracy is good on clear text. For best results, use a high-quality image with large text and enable image enhancement. Tilted or faded images reduce accuracy.",
      },
      {
        question: "What image formats are supported?",
        answer:
          "JPG, PNG, WebP, and screenshots. You can upload any image that contains readable text.",
      },
    ]
  ),
  "pdf-sign": content(
    [
      { title: "Upload PDF", description: "Select the PDF you want to sign." },
      { title: "Draw signature", description: "Use mouse or touch on the signature pad." },
      { title: "Download signed PDF", description: "Your signature is stamped on the first page." },
    ],
    [
      { question: "Is the PDF uploaded?", answer: "No. Signing happens locally with pdf-lib in your browser." },
      { question: "Can I place the signature elsewhere?", answer: "This tool places the signature on the bottom-right of the first page." },
    ]
  ),
  "pdf-watermark": content(
    [
      { title: "Upload PDF", description: "Choose the document to watermark." },
      { title: "Customize text", description: "Enter watermark text and adjust opacity." },
      { title: "Download", description: "Get a copy with the watermark on every page." },
    ],
    [
      { question: "Can I use an image watermark?", answer: "This version supports text watermarks only." },
      { question: "Will it flatten the PDF?", answer: "The watermark is drawn onto each page when you export." },
    ]
  ),
  "pdf-protect": content(
    [
      { title: "Upload PDF", description: "Select an unprotected PDF file." },
      { title: "Set password", description: "Enter the password viewers will need to open the file." },
      { title: "Download locked PDF", description: "Save the encrypted copy locally." },
    ],
    [
      { question: "Is encryption done locally?", answer: "Yes. pdf-lib encrypts the file in your browser." },
      { question: "Can I remove a password here?", answer: "This tool only adds protection. Use a PDF reader to remove passwords if you know the original." },
    ]
  ),
  "exif-remover": content(
    [
      { title: "Upload photo", description: "Choose a JPG, PNG, or WebP image." },
      { title: "Process", description: "The image is redrawn on canvas to strip metadata." },
      { title: "Download", description: "Save the clean JPEG without EXIF data." },
    ],
    [
      { question: "What metadata is removed?", answer: "GPS, camera model, timestamps, and other EXIF/IPTC embedded in the original file." },
      { question: "Does it reduce quality?", answer: "Output is JPEG at 92% quality — visually similar but without hidden metadata." },
    ]
  ),
  "og-image-generator": content(
    [
      { title: "Edit text and colors", description: "Set title, subtitle, background, and text colors." },
      { title: "Preview", description: "See the 1200×630 Open Graph layout live." },
      { title: "Export PNG", description: "Download for Twitter, Facebook, LinkedIn, and Discord previews." },
    ],
    [
      { question: "What size is OG standard?", answer: "1200×630 pixels is the recommended Open Graph image size." },
      { question: "Can I use custom fonts?", answer: "This tool uses system UI fonts for fast, reliable rendering." },
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
    ]
  ),
  "meme-generator": content(
    [
      { title: "Upload image", description: "Choose the photo for your meme." },
      { title: "Add text", description: "Type top and bottom captions — they render in classic meme style." },
      { title: "Download PNG", description: "Save and share your meme." },
    ],
    [
      { question: "What font is used?", answer: "Impact-style bold caps with outline, the classic meme look." },
      { question: "Is processing local?", answer: "Yes. Canvas rendering happens entirely in your browser." },
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
      { question: "Works on mobile?", answer: "Yes. Pointer Events support touch drawing with touch-action disabled on the pad." },
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
    ]
  ),
  "glassmorphism-generator": content(
    [
      { title: "Tune glass effect", description: "Adjust blur, opacity, and border strength." },
      { title: "Preview", description: "See the frosted card on a gradient backdrop." },
      { title: "Copy CSS", description: "Paste backdrop-filter and background rules into your design." },
    ],
    [
      { question: "Browser support?", answer: "backdrop-filter works in modern Chromium, Safari, and Firefox." },
      { question: "Can I use it on any element?", answer: "Yes. Apply the copied CSS to cards, modals, or nav bars over colorful backgrounds." },
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
    ]
  ),
  "js-minifier": content(
    [
      { title: "Paste JavaScript", description: "Enter the script you want to compress." },
      { title: "Minify", description: "Terser loads dynamically and minifies with compress and mangle." },
      { title: "Copy result", description: "Use the minified output in production bundles." },
    ],
    [
      { question: "Which minifier is used?", answer: "Terser, loaded on demand in the browser." },
      { question: "Is my code uploaded?", answer: "No. Minification runs entirely client-side." },
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
    ]
  ),
  "sql-formatter": content(
    [
      { title: "Paste SQL", description: "Enter a query or script." },
      { title: "Format", description: "sql-formatter loads dynamically and applies indentation." },
      { title: "Copy output", description: "Copy the readable SQL." },
    ],
    [
      { question: "Which SQL dialect?", answer: "Standard SQL formatting; works well for common SELECT/INSERT/UPDATE statements." },
      { question: "Is data sent to a server?", answer: "No. Formatting runs in your browser." },
    ]
  ),
  "url-encoder-decoder": content(
    [
      { title: "Choose mode", description: "Encode plain text to percent-encoding or decode an encoded string." },
      { title: "Enter value", description: "Type or paste the text to convert." },
      { title: "Copy result", description: "Copy the encoded or decoded output." },
    ],
    [
      { question: "Which encoding is used?", answer: "encodeURIComponent / decodeURIComponent for URL components." },
      { question: "Spaces in URLs?", answer: "Encoded as %20 with encodeURIComponent." },
    ]
  ),
  "uuid-generator": content(
    [
      { title: "Set count", description: "Choose how many UUIDs to generate (1–20)." },
      { title: "Generate", description: "Create cryptographically random UUID v4 values." },
      { title: "Copy all", description: "Copy every UUID at once, one per line." },
    ],
    [
      { question: "Which UUID version?", answer: "Version 4 (random) via crypto.randomUUID()." },
      { question: "Are UUIDs unique?", answer: "Collision probability is negligible for practical use." },
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
    ]
  ),
  "meta-tag-generator": content(
    [
      { title: "Fill page details", description: "Enter title, description, canonical URL, and OG image." },
      { title: "Copy tags", description: "Paste meta, Open Graph, and Twitter Card tags into your HTML head." },
    ],
    [
      { question: "Which tags are included?", answer: "title, description, canonical, og:*, and twitter:* tags." },
      { question: "Do I need all fields?", answer: "Fill what you have; empty fields are omitted from output." },
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
    ]
  ),
  "lorem-picsum-placeholder": content(
    [
      { title: "Set dimensions", description: "Choose width and height in pixels." },
      { title: "Pick a color", description: "Select background color for the placeholder." },
      { title: "Download PNG", description: "Save a local placeholder image with size label." },
    ],
    [
      { question: "External API?", answer: "No. The image is drawn on canvas entirely in your browser." },
      { question: "Max size?", answer: "Up to 4000×4000 pixels." },
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
    ]
  ),
  "interaction-fx": content(
    [
      { title: "Preview ripple", description: "Click the demo area to see the effect." },
      { title: "Customize", description: "Change color, duration, and ripple size." },
      { title: "Export code", description: "Copy CSS and JS that uses Pointer Events for mobile and desktop." },
    ],
    [
      { question: "Does exported JS work on touch?", answer: "Yes. It listens to pointerdown so taps and clicks both trigger ripples." },
      { question: "Can I attach it to any button?", answer: "Call attachPressEffect(yourElement) from the exported snippet." },
    ]
  ),
  "certificate-generator": content(
    [
      {
        title: "Pick a template",
        description: "Choose classic, modern, tech, or elegant — colors and frame update instantly.",
      },
      {
        title: "Customize text and logo",
        description: "Edit title, recipient name, project, description, date, and signature. Upload a logo and adjust size, opacity, and position.",
      },
      {
        title: "Tune colors and size",
        description: "Set accent, background, and text colors. Pick A4, Letter, or square; landscape or portrait.",
      },
      {
        title: "Download PNG or PDF",
        description: "Export a high-resolution certificate — everything runs locally in your browser.",
      },
    ],
    [
      {
        question: "Is the certificate generator free?",
        answer: "Yes. Create and download unlimited certificates with no sign-up and no watermarks from kitzos.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer: "No. Your logo and certificate are processed entirely in your browser. Nothing is sent to our servers.",
      },
      {
        question: "Does it support Arabic text on the certificate?",
        answer: "Yes. Arabic names and project titles render with RTL-aware canvas text and Noto Sans Arabic for connected letter shapes.",
      },
      {
        question: "What formats can I download?",
        answer: "PNG for sharing online and PDF for printing. Both export at 2× resolution for sharp output.",
      },
      {
        question: "Can I use my own logo?",
        answer: "Yes. Upload any image as a logo, resize it, change opacity, and place it at the top or as a watermark.",
      },
      {
        question: "What certificate sizes are available?",
        answer: "A4 and US Letter in landscape or portrait, plus a square format ideal for social posts.",
      },
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
      { question: "Is my birth date stored?", answer: "No. All calculations run locally in your browser." },
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
    ]
  ),
  "gpa-calculator": content(
    [
      { title: "Add courses", description: "Enter credit hours and letter grade for each course." },
      { title: "Add or remove rows", description: "Use Add course for more subjects; remove rows you do not need." },
      { title: "Read your GPA", description: "Your weighted GPA on a 4.0 scale updates automatically." },
    ],
    [
      { question: "What grading scale is used?", answer: "Standard 4.0 scale: A=4, B=3, C=2, D=1, F=0, weighted by credit hours." },
      { question: "Can I calculate semester GPA?", answer: "Yes. Enter only the courses for the term you want to evaluate." },
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
      { question: "Is my date uploaded?", answer: "No. All calendar math runs locally in your browser." },
    ]
  ),
  "word-frequency-counter": content(
    [
      { title: "Paste your text", description: "Enter or paste the passage you want to analyze." },
      { title: "Review counts", description: "See each word and how many times it appears, sorted by frequency." },
      { title: "Use the stats", description: "Check total words and unique words for SEO or writing analysis." },
    ],
    [
      { question: "Are words case-sensitive?", answer: "Words are counted case-insensitively. Punctuation at word edges is stripped." },
      { question: "Does it support Arabic?", answer: "Yes. Arabic and Latin letters are counted using Unicode word boundaries." },
      { question: "Is my text uploaded?", answer: "No. Frequency counting runs entirely in your browser." },
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
    ]
  ),
  "slug-generator": content(
    [
      { title: "Enter a title", description: "Type a page title, product name, or heading." },
      { title: "Read the slug", description: "The tool converts it to lowercase with hyphens and no special characters." },
      { title: "Copy slug", description: "Paste the slug into URLs, CMS permalinks, or file names." },
    ],
    [
      { question: "Are Arabic titles supported?", answer: "Non-Latin characters are transliterated or removed depending on input; Latin titles work best." },
      { question: "What characters are removed?", answer: "Punctuation and symbols are stripped; spaces become hyphens." },
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
      { question: "Does regex mode use JavaScript syntax?", answer: "Yes. Patterns follow JavaScript RegExp rules with global replace." },
      { question: "Can I undo a replace?", answer: "Use your browser undo in the textarea or re-paste the original text." },
    ]
  ),
  "whitespace-remover": content(
    [
      { title: "Paste messy text", description: "Enter text with extra spaces, trailing whitespace, or blank lines." },
      { title: "Choose cleanup options", description: "Trim lines, collapse multiple spaces, and remove empty lines." },
      { title: "Copy clean text", description: "Use the normalized output in code, forms, or documents." },
    ],
    [
      { question: "Are tabs handled?", answer: "Extra spaces and tabs within lines can be collapsed to single spaces." },
      { question: "Will paragraph breaks remain?", answer: "Blank-line removal is optional; enable only when you want tighter text." },
    ]
  ),
  "text-to-ascii-art": content(
    [
      { title: "Type your message", description: "Enter Latin text for figlet banners, or Arabic for block-letter output." },
      { title: "Pick a font", description: "Choose a figlet font for Latin text (hidden for Arabic input)." },
      { title: "Copy or download", description: "Copy the banner or save it as a text file." },
    ],
    [
      { question: "Does Arabic work?", answer: "Figlet is Latin-only. Arabic input uses block-letter rendering with a quality notice; Latin text uses classic figlet fonts." },
      { question: "Which font engine is used?", answer: "Figlet fonts in the browser for Latin; custom block grids for Arabic letters." },
      { question: "Does it work offline?", answer: "After the page loads, generation runs locally without network calls." },
    ]
  ),
  "character-map": content(
    [
      { title: "Browse categories", description: "Use tabs for arrows, math, currency, emoji, keyboard keys, shapes, and more." },
      { title: "Search in English or Arabic", description: "Filter by tags like heart, سهم, قلب, نجمة, euro, يورو." },
      { title: "Click to copy", description: "Tap any symbol to copy it — a confirmation appears when copied." },
    ],
    [
      { question: "How many symbols are included?", answer: "Hundreds of Unicode symbols organized in categories including emoji and Mac/Windows/Android key labels." },
      { question: "Does copy work on mobile?", answer: "Yes. Tap a character to copy when the clipboard API is available." },
    ]
  ),
  "image-rotator": content(
    [
      { title: "Upload an image", description: "Choose JPG, PNG, or WebP from your device." },
      { title: "Rotate or flip", description: "Turn 90°, 180°, or 270° and mirror horizontally or vertically." },
      { title: "Download PNG", description: "Save the transformed image locally." },
    ],
    [
      { question: "Is my image uploaded?", answer: "No. Rotation and flipping happen on canvas in your browser." },
      { question: "What format is exported?", answer: "PNG to preserve quality after transforms." },
    ]
  ),
  "add-text-to-image": content(
    [
      { title: "Upload image", description: "Select the photo or graphic to annotate." },
      { title: "Customize text", description: "Set message, font size, color, and position on the canvas." },
      { title: "Download PNG", description: "Export the image with your text overlay." },
    ],
    [
      { question: "Can I move the text?", answer: "Yes. Drag or use position controls to place the caption." },
      { question: "Is processing local?", answer: "Yes. Canvas rendering stays entirely in your browser." },
    ]
  ),
  "image-collage": content(
    [
      { title: "Add photos", description: "Upload 2–4 images for your grid layout." },
      { title: "Adjust gap", description: "Set spacing between cells for a tighter or airier collage." },
      { title: "Download collage", description: "Export the combined grid as one PNG file." },
    ],
    [
      { question: "How many images can I use?", answer: "Between 2 and 4 photos in a single grid collage." },
      { question: "Are images uploaded to a server?", answer: "No. Layout and export run locally on canvas." },
    ]
  ),
  "pixelate-image": content(
    [
      { title: "Upload image", description: "Choose the photo you want to censor or stylize." },
      { title: "Choose mode", description: "Pixelate the entire image or drag to select a specific region." },
      { title: "Set pixel size", description: "Adjust block size for stronger or subtler pixelation." },
      { title: "Download result", description: "Save the pixelated PNG for privacy or creative use." },
    ],
    [
      { question: "Can I pixelate part of an image?", answer: "Yes. Choose “Selected region” and drag on the preview to mark the area to pixelate." },
      { question: "Is my photo private?", answer: "Yes. Processing happens locally; nothing leaves your device." },
    ]
  ),
  "image-to-ascii": content(
    [
      { title: "Upload a photo", description: "Choose an image to convert to text art." },
      { title: "Tune settings", description: "Adjust width and character density for detail vs. size." },
      { title: "Copy or download", description: "Copy ASCII output or save as a .txt file." },
    ],
    [
      { question: "How is ASCII generated?", answer: "Pixel brightness is sampled and mapped to characters from dark to light." },
      { question: "Does it work on portraits?", answer: "Yes. High-contrast photos produce the clearest ASCII results." },
    ]
  ),
  "image-border-adder": content(
    [
      { title: "Upload image", description: "Select the photo or graphic to frame." },
      { title: "Style the border", description: "Set border color, padding, and optional drop shadow." },
      { title: "Download PNG", description: "Save the framed image with your chosen styling." },
    ],
    [
      { question: "Can I add padding only?", answer: "Yes. Padding creates space around the image inside the border." },
      { question: "Is export lossless?", answer: "Output is PNG; very large borders increase file dimensions, not compression artifacts." },
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
      { question: "Is generation local?", answer: "Yes. JsBarcode renders in your browser without uploading data." },
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
    ]
  ),
};
