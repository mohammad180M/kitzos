import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/whitespace-remover"), {
  ssr: false,
  loading: ToolSkeleton,
});
