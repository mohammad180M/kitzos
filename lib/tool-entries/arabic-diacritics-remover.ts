import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ToolSkeleton";

export default dynamic(() => import("@/tools/text/arabic-diacritics-remover"), {
  ssr: false,
  loading: ToolSkeleton,
});
