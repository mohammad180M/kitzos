import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/base64"), {
  ssr: false,
  loading: ToolSkeleton,
});
