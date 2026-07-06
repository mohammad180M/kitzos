import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/lorem-picsum-placeholder"), {
  ssr: false,
  loading: ToolSkeleton,
});
