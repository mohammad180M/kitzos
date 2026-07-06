import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/audio/voice-recorder"), {
  ssr: false,
  loading: ToolSkeleton,
});
