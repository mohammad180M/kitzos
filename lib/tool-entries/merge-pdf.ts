import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/merge-pdf"), {
  ssr: false,
  loading: ToolSkeleton,
});
