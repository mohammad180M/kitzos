import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/url-encoder-decoder"), {
  ssr: false,
  loading: ToolSkeleton,
});
