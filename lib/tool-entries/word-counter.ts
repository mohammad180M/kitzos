import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/word-counter"), {
  ssr: false,
  loading: ToolSkeleton,
});
