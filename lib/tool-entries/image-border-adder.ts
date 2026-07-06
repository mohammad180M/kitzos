import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/image-border-adder"), {
  ssr: false,
  loading: ToolSkeleton,
});
