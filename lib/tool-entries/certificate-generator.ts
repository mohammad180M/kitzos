import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/certificate-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
