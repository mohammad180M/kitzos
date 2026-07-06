import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/regex-tester"), {
  ssr: false,
  loading: ToolSkeleton,
});
