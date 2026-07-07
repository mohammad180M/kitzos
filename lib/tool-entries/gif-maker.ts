import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/gif-maker"), {
  ssr: false,
  loading: ToolSkeleton,
});
