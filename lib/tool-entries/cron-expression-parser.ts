import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/cron-expression-parser"), {
  ssr: false,
  loading: ToolSkeleton,
});
