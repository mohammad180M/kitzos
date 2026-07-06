import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/compress-image"), {
  ssr: false,
  loading: ToolSkeleton,
});
