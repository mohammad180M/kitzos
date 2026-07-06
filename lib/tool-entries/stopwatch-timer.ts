import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/stopwatch-timer"), {
  ssr: false,
  loading: ToolSkeleton,
});
