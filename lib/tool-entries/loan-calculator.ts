import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/loan-calculator"), {
  ssr: false,
  loading: ToolSkeleton,
});
