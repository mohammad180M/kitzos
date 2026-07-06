import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/lorem-ipsum-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
