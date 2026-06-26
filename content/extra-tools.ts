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
};
