import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/box-shadow-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
