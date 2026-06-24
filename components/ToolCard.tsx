import Link from "next/link";
import type { Tool } from "@/lib/registry";
import { getIcon } from "@/lib/icons";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = getIcon(tool.icon);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-gray-900 group-hover:text-primary-700">
          {tool.title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
