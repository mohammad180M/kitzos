import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/image-watermark"), {
  ssr: false,
  loading: ToolSkeleton,
});
