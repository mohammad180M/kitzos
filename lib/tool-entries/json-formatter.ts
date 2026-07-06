import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/json-formatter"), {
  ssr: false,
  loading: ToolSkeleton,
});
