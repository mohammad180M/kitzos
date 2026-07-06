import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/xml-formatter"), {
  ssr: false,
  loading: ToolSkeleton,
});
