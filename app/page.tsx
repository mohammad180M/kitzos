import type { Metadata } from "next";
import RootRedirect from "@/components/RootRedirect";
import { localeRedirectScript } from "@/lib/locale-redirect-script";
import { getRootMetadata } from "@/lib/seo";

export const metadata: Metadata = getRootMetadata();

export default function RootPage() {
  return (
    <>
      <script
        id="kitzos-locale-redirect"
        dangerouslySetInnerHTML={{ __html: localeRedirectScript }}
        suppressHydrationWarning
      />
      <p className="sr-only">
        <a href="/en/">Continue to kitzos (English)</a>
        {" · "}
        <a href="/ar/">المتابعة إلى kitzos (العربية)</a>
      </p>
      <RootRedirect />
    </>
  );
}
