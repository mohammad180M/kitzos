"use client";

import { useState } from "react";
import { Check, Copy, Upload } from "lucide-react";

type Mode = "encode" | "decode";
type InputMode = "text" | "image";

function encodeText(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function decodeText(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTextInput = (value: string) => {
    setInput(value);
    setError(null);

    if (!value.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeText(value));
      } else {
        setOutput(decodeText(value));
      }
    } catch {
      setError("Invalid Base64 string. Check your input and try again.");
      setOutput("");
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? result;
      setInput(file.name);
      setOutput(result);
      setError(null);
    };
    reader.onerror = () => setError("Failed to read image.");
    reader.readAsDataURL(file);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setInput("");
                setOutput("");
                setError(null);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                mode === m
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            {(["text", "image"] as InputMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setInputMode(m);
                  setInput("");
                  setOutput("");
                  setError(null);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                  inputMode === m
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "encode" && inputMode === "image" ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-colors hover:border-primary-400">
          <Upload className="h-6 w-6 text-gray-400" aria-hidden="true" />
          <span className="mt-2 text-sm text-gray-600">Upload image to encode</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <textarea
          value={input}
          onChange={(e) => handleTextInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to encode…"
              : "Enter Base64 to decode…"
          }
          rows={5}
          className="input-field resize-y font-mono text-sm"
          aria-label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
        />
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {output && (
        <div>
          <label htmlFor="base64-output" className="text-sm font-medium text-gray-700">
            Output
          </label>
          <textarea
            id="base64-output"
            value={output}
            readOnly
            rows={5}
            className="input-field mt-1 resize-y font-mono text-sm bg-gray-50"
          />
          <button type="button" onClick={copy} className="btn-secondary mt-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
