import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/color-code-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
