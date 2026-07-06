import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/random-picker"), {
  ssr: false,
  loading: ToolSkeleton,
});
