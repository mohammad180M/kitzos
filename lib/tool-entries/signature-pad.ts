import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/signature-pad"), {
  ssr: false,
  loading: ToolSkeleton,
});
