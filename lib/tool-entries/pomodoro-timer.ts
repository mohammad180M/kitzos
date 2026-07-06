import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/pomodoro-timer"), {
  ssr: false,
  loading: ToolSkeleton,
});
