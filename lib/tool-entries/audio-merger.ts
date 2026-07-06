import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/audio/audio-merger"), {
  ssr: false,
  loading: ToolSkeleton,
});
