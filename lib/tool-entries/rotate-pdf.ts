import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/rotate-pdf"), {
  ssr: false,
  loading: ToolSkeleton,
});
