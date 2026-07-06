import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/color-picker"), {
  ssr: false,
  loading: ToolSkeleton,
});
