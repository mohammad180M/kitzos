import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/case-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
