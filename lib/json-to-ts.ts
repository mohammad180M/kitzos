import { parseJsonSafe } from "@/lib/safe-json";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeOfValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const types = new Set(value.map(typeOfValue));
    const typeList = Array.from(types);
    if (typeList.length === 1) return `${typeList[0]}[]`;
    return `(${typeList.join(" | ")})[]`;
  }
  if (isObject(value)) return "object";
  return typeof value;
}

function toInterfaceName(key: string, parent = "Root"): string {
  const cleaned = key.replace(/[^a-zA-Z0-9]/g, " ");
  const pascal = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return pascal || `${parent}Item`;
}

function collectInterfaces(
  obj: Record<string, unknown>,
  name: string,
  interfaces: Map<string, Record<string, string>>
): void {
  const props: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isObject(value)) {
      const ifaceName = toInterfaceName(key, name);
      collectInterfaces(value, ifaceName, interfaces);
      props[key] = ifaceName;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        props[key] = "unknown[]";
      } else if (isObject(value[0])) {
        const ifaceName = toInterfaceName(key, name);
        collectInterfaces(value[0] as Record<string, unknown>, ifaceName, interfaces);
        props[key] = `${ifaceName}[]`;
      } else {
        props[key] = typeOfValue(value);
      }
    } else {
      props[key] = typeOfValue(value);
    }
  }

  interfaces.set(name, props);
}

function renderInterface(name: string, props: Record<string, string>): string {
  const lines = Object.entries(props).map(([key, type]) => {
    const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`;
    return `  ${safeKey}: ${type};`;
  });
  return `interface ${name} {\n${lines.join("\n")}\n}`;
}

export function jsonToTypeScript(json: string, rootName = "Root"): { code: string; error?: string } {
  const parsedResult = parseJsonSafe(json);
  if (!parsedResult.ok) {
    return { code: "", error: "Invalid JSON" };
  }
  const parsed = parsedResult.value;

  if (!isObject(parsed)) {
      const type = typeOfValue(parsed);
      return { code: `type ${rootName} = ${type};` };
    }

    const interfaces = new Map<string, Record<string, string>>();
    collectInterfaces(parsed, rootName, interfaces);

    const blocks: string[] = [];
    interfaces.forEach((props, name) => {
      blocks.push(renderInterface(name, props));
    });

    return { code: blocks.join("\n\n") };
}
