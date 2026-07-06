import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/line-sorter"), {
  ssr: false,
  loading: ToolSkeleton,
});
