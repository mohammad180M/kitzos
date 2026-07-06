import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/csv-json-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
