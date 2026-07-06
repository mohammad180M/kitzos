import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/image-to-ascii"), {
  ssr: false,
  loading: ToolSkeleton,
});
