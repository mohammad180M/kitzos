import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/audio/mp3-cutter"), {
  ssr: false,
  loading: ToolSkeleton,
});
