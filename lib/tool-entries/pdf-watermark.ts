import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/pdf-watermark"), {
  ssr: false,
  loading: ToolSkeleton,
});
