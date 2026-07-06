"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import ToolEmptyHint from "@/components/ToolEmptyHint";
import { usePersistedInput } from "@/lib/hooks/use-persisted-input";
import { useToolKeyboard } from "@/lib/hooks/use-tool-keyboard";
import {
  csvToJson,
  jsonToCsv,
  type CsvDelimiter,
  type CsvJsonError,
} from "@/lib/csv-json";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

type Direction = "csvToJson" | "jsonToCsv";

export default function CsvJsonConverter() {
  const { locale, t } = useLocale();
  const labels = useCommonLabels();
  const ui = t.csvJsonConverter;
  const fileRef = useRef<HTMLInputElement>(null);

  const [direction, setDirection] = useState<Direction>("csvToJson");
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(",");
  const [input, setInput] = usePersistedInput("kitzos-csv-json-input");

  useUnsavedWork(input.trim().length > 0);

  const { output, error } = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as CsvJsonError | null };
    }

    if (direction === "csvToJson") {
      const result = csvToJson(input, delimiter);
      if ("error" in result) {
        return { output: "", error: result.error };
      }
      return { output: JSON.stringify(result.data, null, 2), error: null };
    }

    const result = jsonToCsv(input);
    if ("error" in result) {
      return { output: "", error: result.error };
    }
    return { output: result.csv, error: null };
  }, [input, direction, delimiter]);

  const errorMessage = error ? ui.errors[error] : null;

  useToolKeyboard({
    onClear: () => setInput(""),
  });

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (direction === "csvToJson" && ext !== "csv" && ext !== "txt") {
      return;
    }
    if (direction === "jsonToCsv" && ext !== "json") {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  };

  const downloadOutput = () => {
    if (!output) return;
    const mime = direction === "csvToJson" ? "application/json" : "text/csv";
    const ext = direction === "csvToJson" ? "json" : "csv";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <ToolEmptyHint message={t.common.emptyStateHint} show={!input.trim()} />
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.common.keyboardHint}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDirection("csvToJson")}
          className={direction === "csvToJson" ? "btn-primary" : "btn-secondary"}
        >
          {ui.csvToJson}
        </button>
        <button
          type="button"
          onClick={() => setDirection("jsonToCsv")}
          className={direction === "jsonToCsv" ? "btn-primary" : "btn-secondary"}
        >
          {ui.jsonToCsv}
        </button>
      </div>

      {direction === "csvToJson" && (
        <div>
          <label htmlFor="csv-delimiter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {ui.delimiter}
          </label>
          <select
            id="csv-delimiter"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as CsvDelimiter)}
            className="input-field mt-1 max-w-xs"
          >
            <option value=",">{ui.delimiterComma}</option>
            <option value=";">{ui.delimiterSemicolon}</option>
            <option value={"\t"}>{ui.delimiterTab}</option>
          </select>
        </div>
      )}

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="csv-json-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {direction === "csvToJson" ? ui.inputCsv : ui.inputJson}
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary inline-flex items-center gap-1.5 py-1.5 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            {ui.uploadFile}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={direction === "csvToJson" ? ".csv,.txt" : ".json"}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
        <textarea
          id="csv-json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === "csvToJson" ? ui.csvPlaceholder : ui.jsonPlaceholder}
          rows={8}
          className="input-field ltr-input resize-y font-mono text-sm"
          spellCheck={false}
          dir="ltr"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="csv-json-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {direction === "csvToJson" ? ui.outputJson : ui.outputCsv}
          </label>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={output} disabled={!output} />
            <button
              type="button"
              onClick={downloadOutput}
              disabled={!output}
              className="btn-secondary inline-flex items-center gap-1.5 py-1.5 text-xs disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {labels.download}
            </button>
          </div>
        </div>
        <textarea
          id="csv-json-output"
          value={output}
          readOnly
          rows={8}
          className="input-field ltr-input resize-y bg-gray-50 font-mono text-sm dark:bg-gray-800/50"
          spellCheck={false}
          dir="ltr"
        />
      </div>

      {input && (
        <button type="button" onClick={() => setInput("")} className="btn-secondary">
          {labels.clear}
        </button>
      )}
    </div>
  );
}
