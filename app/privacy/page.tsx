import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import PrivacyContent from "@/components/legal/PrivacyContent";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "Privacy Policy",
  "How kitzos handles your data. All tools run in your browser — your files are never uploaded to our servers.",
  "/privacy"
);

export default function PrivacyPage() {
  return (
    <LocalizedInfoPage page="privacy">
      <PrivacyContent />
    </LocalizedInfoPage>
  );
}
