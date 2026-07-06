import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/meme-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
