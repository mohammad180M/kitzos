export function formatXml(xml: string): string {
  const cleaned = xml.replace(/>\s+</g, "><").trim();
  let formatted = "";
  let indent = 0;
  const tab = "  ";
  const tokens = cleaned.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + "\n";
    } else if (trimmed.startsWith("<") && trimmed.endsWith("/>")) {
      formatted += tab.repeat(indent) + trimmed + "\n";
    } else if (trimmed.startsWith("<") && !trimmed.startsWith("<?") && !trimmed.endsWith("/>")) {
      formatted += tab.repeat(indent) + trimmed + "\n";
      if (!trimmed.startsWith("<?") && !trimmed.includes("</")) {
        indent++;
      }
    } else if (trimmed.startsWith("<?")) {
      formatted += trimmed + "\n";
    } else {
      formatted += tab.repeat(indent) + trimmed + "\n";
    }
  }

  return formatted.trim();
}

export function minifyXml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}
