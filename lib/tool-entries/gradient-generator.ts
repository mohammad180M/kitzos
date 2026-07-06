import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/gradient-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
