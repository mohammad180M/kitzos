import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/js-minifier"), {
  ssr: false,
  loading: ToolSkeleton,
});
