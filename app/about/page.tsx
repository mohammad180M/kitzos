import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import AboutContent from "@/components/legal/AboutContent";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "About",
  "Learn what kitzos is — free, privacy-first online tools that run entirely in your browser.",
  "/about"
);

export default function AboutPage() {
  return (
    <LocalizedInfoPage page="about">
      <AboutContent />
    </LocalizedInfoPage>
  );
}
