import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/password-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
