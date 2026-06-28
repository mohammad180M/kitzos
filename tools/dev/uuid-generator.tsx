"use client";

import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function generateUuid(): string {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const t = useDevToolsExtraLabels("uuidGenerator");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    setUuids(Array.from({ length: count }, () => generateUuid()));
  }, [count]);

  const allText = uuids.join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.count}</span>
          <select
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            className="input-field mt-1"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={generate} className="btn-secondary">
          <RefreshCw className="h-4 w-4" />
          {t.generate}
        </button>
      </div>
      {uuids.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</p>
          <ul className="mt-2 space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-gray-700 dark:bg-gray-800/50">
            {uuids.map((id) => (
              <li key={id} dir="ltr">
                {id}
              </li>
            ))}
          </ul>
          <CopyButton text={allText} label={t.copyAll} className="mt-2" />
        </div>
      )}
    </div>
  );
}
