import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/sql-formatter"), {
  ssr: false,
  loading: ToolSkeleton,
});
