import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/compound-interest"), {
  ssr: false,
  loading: ToolSkeleton,
});
