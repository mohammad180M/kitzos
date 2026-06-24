import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import ContactContent from "@/components/legal/ContactContent";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "Contact",
  "Get in touch with kitzos for feedback, bug reports, or suggestions.",
  "/contact"
);

export default function ContactPage() {
  return (
    <LocalizedInfoPage page="contact">
      <ContactContent />
    </LocalizedInfoPage>
  );
}
