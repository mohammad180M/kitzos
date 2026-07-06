import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/text-reverser"), {
  ssr: false,
  loading: ToolSkeleton,
});
