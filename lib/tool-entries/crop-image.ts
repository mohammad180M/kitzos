import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/crop-image"), {
  ssr: false,
  loading: ToolSkeleton,
});
