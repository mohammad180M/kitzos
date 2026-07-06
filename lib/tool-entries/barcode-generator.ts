import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/misc/barcode-generator"), {
  ssr: false,
  loading: ToolSkeleton,
});
