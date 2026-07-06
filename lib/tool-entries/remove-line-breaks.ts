import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/remove-line-breaks"), {
  ssr: false,
  loading: ToolSkeleton,
});
