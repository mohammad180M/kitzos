import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/image-color-picker"), {
  ssr: false,
  loading: ToolSkeleton,
});
