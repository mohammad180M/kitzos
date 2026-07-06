import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/pixelate-image"), {
  ssr: false,
  loading: ToolSkeleton,
});
