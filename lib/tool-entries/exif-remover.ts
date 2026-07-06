import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/exif-remover"), {
  ssr: false,
  loading: ToolSkeleton,
});
