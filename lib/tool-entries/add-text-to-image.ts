import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/add-text-to-image"), {
  ssr: false,
  loading: ToolSkeleton,
});
