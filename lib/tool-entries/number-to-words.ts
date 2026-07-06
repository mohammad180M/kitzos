import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/converters/number-to-words"), {
  ssr: false,
  loading: ToolSkeleton,
});
