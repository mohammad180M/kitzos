import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/character-map"), {
  ssr: false,
  loading: ToolSkeleton,
});
