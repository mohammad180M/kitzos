import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/extract-pages"), {
  ssr: false,
  loading: ToolSkeleton,
});
