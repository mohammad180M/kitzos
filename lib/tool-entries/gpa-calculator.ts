import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/gpa-calculator"), {
  ssr: false,
  loading: ToolSkeleton,
});
