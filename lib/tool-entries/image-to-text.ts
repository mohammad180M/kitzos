import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/vision/image-to-text"), {
  ssr: false,
  loading: ToolSkeleton,
});
