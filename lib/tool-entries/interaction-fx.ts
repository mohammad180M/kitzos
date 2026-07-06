import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/interaction-fx"), {
  ssr: false,
  loading: ToolSkeleton,
});
