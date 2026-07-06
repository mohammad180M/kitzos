import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/svg-pattern-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
