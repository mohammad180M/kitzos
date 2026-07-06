import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/converters/hijri-gregorian-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
