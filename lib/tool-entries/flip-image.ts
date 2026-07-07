import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/flip-image"), {
  ssr: false,
  loading: ToolSkeleton,
});
