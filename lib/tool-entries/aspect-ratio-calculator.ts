import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/aspect-ratio-calculator"), {
  ssr: false,
  loading: ToolSkeleton,
});
