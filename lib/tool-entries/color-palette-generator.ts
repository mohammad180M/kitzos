import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/color-palette-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
