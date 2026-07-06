import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/dev/htaccess-redirect-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
