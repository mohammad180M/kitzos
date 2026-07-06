import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/converters/roman-numeral-converter"), {
  ssr: false,
  loading: ToolSkeleton,
});
