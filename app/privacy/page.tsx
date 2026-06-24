import type { Metadata } from "next";
import InfoPageLayout from "@/components/InfoPageLayout";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site-config";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "Privacy Policy",
  "How kitzos handles your data. All tools run in your browser — your files are never uploaded to our servers.",
  "/privacy"
);

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      description="How we handle information when you use kitzos.com."
    >
      <p className="text-sm text-gray-500 dark:text-gray-500">
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>

      <p>
        kitzos.com (&ldquo;kitzos,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) provides free online
        tools at kitzos.com. This Privacy Policy explains what information is involved when you
        visit the site and how it is handled.
      </p>

      <h2>Our core privacy guarantee</h2>
      <p>
        <strong>
          Every tool on kitzos runs entirely in your web browser on your own device.
        </strong>{" "}
        When you use a tool to process a PDF, image, or text, that content is handled locally in
        your browser. We do not receive, store, or have access to the files or text you process.
        There is no upload step to our servers for tool processing — this is a fundamental part of
        how the site is built, not merely a policy claim.
      </p>

      <h2>Information we do not collect directly</h2>
      <p>kitzos does not offer user accounts or login. We do not ask you to register, and we do not
        intentionally collect personal information such as your name, postal address, or payment
        details through the tools themselves.</p>
      <p>
        Because tool processing happens on your device, we also do not maintain a database of the
        documents, images, or text you work with.
      </p>

      <h2>Information collected by third parties</h2>
      <p>
        Like most websites, kitzos relies on third-party services to host the site, deliver content,
        and (where enabled) show advertising. These providers may collect information automatically
        when you visit pages on kitzos.com, including through cookies and similar technologies.
      </p>

      <h3>Cloudflare</h3>
      <p>
        kitzos is hosted and delivered through Cloudflare, which acts as our content delivery and
        security provider. Cloudflare may process technical data such as your IP address, browser
        type, requested URLs, and timestamps in server and security logs. This data is used to
        deliver the site, protect against abuse, and maintain performance. For details, see{" "}
        <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
          Cloudflare&apos;s Privacy Policy
        </a>
        .
      </p>

      <h3>Google AdSense</h3>
      <p>
        We may display advertisements served by Google AdSense. Google and its partners may use
        cookies and similar technologies to serve ads based on your visits to this site and other
        sites on the Internet, to measure ad performance, and to limit how often you see an ad.
        AdSense may collect or receive information such as your IP address, device identifiers,
        browser characteristics, and interactions with ads.
      </p>
      <p>
        You can learn more about how Google uses data from partner sites at{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          Google&apos;s partner sites policy
        </a>
        . You may opt out of personalized advertising by visiting{" "}
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>
        . You can also visit{" "}
        <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>{" "}
        for additional opt-out options in the United States.
      </p>

      <h3>Google Analytics</h3>
      <p>
        kitzos does not currently use Google Analytics. If we add analytics in the future, we will
        update this policy to describe what is collected and provide applicable opt-out information
        before or when it is enabled.
      </p>

      <h2>Cookies</h2>
      <p>
        Cookies are small text files stored on your device. kitzos itself does not set cookies for
        tool functionality — the tools work without signing in. However, third parties integrated
        into the site may set cookies, including:
      </p>
      <ul>
        <li>
          <strong>Advertising cookies</strong> (e.g. Google AdSense) — used to deliver and measure
          ads, and to limit repeat impressions.
        </li>
        <li>
          <strong>Essential / infrastructure cookies</strong> — Cloudflare or similar providers may
          use cookies or local storage for security, load balancing, or bot protection.
        </li>
        <li>
          <strong>Theme preference</strong> — kitzos stores your light/dark theme choice in your
          browser&apos;s <code className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800">localStorage</code>{" "}
          on your device only. This is not sent to our servers.
        </li>
      </ul>
      <p>
        You can control or delete cookies through your browser settings. Blocking all cookies may
        affect how some third-party features (such as ad personalization) work.
      </p>

      <h2>How we use information</h2>
      <p>Because we do not operate accounts or receive your tool input, our direct use of personal
        data is minimal. Information processed by third parties is generally used to:</p>
      <ul>
        <li>Host and deliver the website</li>
        <li>Protect the site from abuse and attacks</li>
        <li>Serve and measure advertisements, where enabled</li>
        <li>Comply with legal obligations applicable to those providers</li>
      </ul>

      <h2>Legal bases and your rights (GDPR / UK GDPR)</h2>
      <p>
        If you are in the European Economic Area or the United Kingdom, certain third-party
        providers may process personal data on grounds such as legitimate interests (security,
        site delivery) or consent (where required for advertising cookies). Because kitzos does
        not collect personal data directly through tools or accounts, most requests relating to
        personal data should be directed to the relevant third party (for example, Google for
        AdSense-related data).
      </p>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict
        processing of personal data, or to object to certain processing. To exercise rights
        against data we might hold indirectly, contact us using the email below and we will
        assist where we can or point you to the appropriate provider.
      </p>

      <h2>California privacy notice (CCPA / CPRA)</h2>
      <p>
        kitzos does not sell personal information in the traditional sense. We do not buy or sell
        lists of users. Advertising partners may use cookies for cross-context behavioral
        advertising as described above. California residents may have rights to know, delete, or
        opt out of certain sharing. Because we do not maintain user accounts or store tool
        content, most data handling is performed by third parties — use the contact information
        below for questions, and see Google&apos;s policies for ad-related choices.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        kitzos is intended for a general audience and is not directed at children under 13. We do
        not knowingly collect personal information from children. If you believe a child has
        provided us with personal information, please contact us.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at
        the top will reflect the latest revision. Continued use of the site after changes means you
        accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this Privacy Policy? Email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </InfoPageLayout>
  );
}
