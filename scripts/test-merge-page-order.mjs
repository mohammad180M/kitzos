/**
 * Verifies merge pageOrder → pdf-lib output order.
 * Run: node scripts/test-merge-page-order.mjs
 */
import { PDFDocument } from "pdf-lib";
import { buildGroupedPageOrder, reorderPageOrder } from "../lib/pdf/merge-page-order.ts";

async function makePdf(label, pages) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([200, 200]);
    page.drawText(`${label}-p${i + 1}`, { x: 50, y: 100, size: 12 });
  }
  return doc.save();
}

const fileA = await makePdf("A", 2);
const fileB = await makePdf("B", 3);

const files = [
  { id: "a", pageCount: 2 },
  { id: "b", pageCount: 3 },
];

let pageOrder = buildGroupedPageOrder(files);
console.log("Initial grouped order:", format(pageOrder));

// Drag B page 1 (index 2) between A's pages → after A-p1
pageOrder = reorderPageOrder(pageOrder, 2, 1);
console.log("After drag B-p1 between A pages:", format(pageOrder));
// Expected: A-p0, B-p0, A-p1, B-p1, B-p2

const docA = await PDFDocument.load(fileA);
const docB = await PDFDocument.load(fileB);
const sources = { a: docA, b: docB };

const merged = await PDFDocument.create();
for (const ref of pageOrder) {
  const [page] = await merged.copyPages(sources[ref.fileId], [ref.pageIndex]);
  merged.addPage(page);
}

const bytes = await merged.save();
const out = await PDFDocument.load(bytes);
console.log("Merged page count:", out.getPageCount());
console.log("PASS: order", format(pageOrder));

// File reorder: B before A
const filesBFirst = [
  { id: "b", pageCount: 3 },
  { id: "a", pageCount: 2 },
];
const regrouped = buildGroupedPageOrder(filesBFirst);
console.log("File list B-first regroup:", format(regrouped));

function format(order) {
  return order.map((r) => `${r.fileId}[${r.pageIndex}]`).join(" → ");
}
