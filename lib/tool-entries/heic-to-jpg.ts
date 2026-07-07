import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/heic-to-jpg"), {
  ssr: false,
  loading: ToolSkeleton,
});
