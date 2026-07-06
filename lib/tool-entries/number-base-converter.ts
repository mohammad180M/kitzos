import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/number-base-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
