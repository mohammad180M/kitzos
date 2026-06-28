import type { Metadata } from "next";
import RootRedirect from "@/components/RootRedirect";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: `${getSiteUrl()}/en/`,
  },
};

export default function RootPage() {
  return (
    <>
      <p className="sr-only">
        <a href="/en/">Continue to kitzos</a>
      </p>
      <RootRedirect />
    </>
  );
}
