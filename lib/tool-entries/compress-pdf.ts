import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/compress-pdf"), {
  ssr: false,
  loading: ToolSkeleton,
});
