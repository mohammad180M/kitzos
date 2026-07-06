import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/pdf-sign"), {
  ssr: false,
  loading: ToolSkeleton,
});
