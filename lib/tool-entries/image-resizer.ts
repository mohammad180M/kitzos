import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/image-resizer"), {
  ssr: false,
  loading: ToolSkeleton,
});
