import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/text-to-ascii-art"), {
  ssr: false,
  loading: ToolSkeleton,
});
