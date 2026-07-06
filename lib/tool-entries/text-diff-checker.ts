import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/text-diff-checker"), {
  ssr: false,
  loading: ToolSkeleton,
});
