import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/calculators/date-difference"), {
  ssr: false,
  loading: ToolSkeleton,
});
