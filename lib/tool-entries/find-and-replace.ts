import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/find-and-replace"), {
  ssr: false,
  loading: ToolSkeleton,
});
