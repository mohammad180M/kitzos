import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/online-notepad"), {
  ssr: false,
  loading: ToolSkeleton,
});
