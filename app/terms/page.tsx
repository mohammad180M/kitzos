import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import TermsContent from "@/components/legal/TermsContent";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "Terms of Service",
  "Terms and conditions for using kitzos.com and its free browser-based online tools.",
  "/terms"
);

export default function TermsPage() {
  return (
    <LocalizedInfoPage page="terms">
      <TermsContent />
    </LocalizedInfoPage>
  );
}
