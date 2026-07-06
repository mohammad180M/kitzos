import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/pdf/pdf-protect"), {
  ssr: false,
  loading: ToolSkeleton,
});
