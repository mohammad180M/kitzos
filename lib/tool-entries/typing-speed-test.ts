import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/typing-speed-test"), {
  ssr: false,
  loading: ToolSkeleton,
});
