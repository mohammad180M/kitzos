import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/converters/file-size-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
