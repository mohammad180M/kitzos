import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/json-to-typescript"), {
  ssr: false,
  loading: ToolSkeleton,
});
