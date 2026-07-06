import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/jwt-decoder"), {
  ssr: false,
  loading: ToolSkeleton,
});
