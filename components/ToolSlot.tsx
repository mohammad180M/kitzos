"use client";

import { useEffect, useState, type ComponentType } from "react";
import ToolSkeleton from "@/components/ToolSkeleton";

interface ToolSlotProps {
  slug: string;
}

export default function ToolSlot({ slug }: ToolSlotProps) {
  const [Tool, setTool] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    setTool(null);
    import(`@/lib/tool-entries/${slug}`)
      .then((mod) => {
        if (active) setTool(() => mod.default);
      })
      .catch(() => {
        if (active) setTool(null);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!Tool) return <ToolSkeleton />;
  return <Tool />;
}
