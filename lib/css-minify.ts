export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export function formatCss(css: string): string {
  let result = "";
  let indent = 0;
  const tab = "  ";
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (ch === "{") {
      result += " {\n";
      indent++;
      result += tab.repeat(indent);
    } else if (ch === "}") {
      indent = Math.max(0, indent - 1);
      result = result.trimEnd() + "\n" + tab.repeat(indent) + "}\n";
      if (indent > 0) result += tab.repeat(indent);
    } else if (ch === ";") {
      result += ";\n" + tab.repeat(indent);
    } else {
      result += ch;
    }
  }

  return result.replace(/\n\s*\n/g, "\n").trim();
}
