import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/image/passport-photo"), {
  ssr: false,
  loading: ToolSkeleton,
});
