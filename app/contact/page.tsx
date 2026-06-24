import type { Metadata } from "next";
import { Mail, MessageSquare, Bug } from "lucide-react";
import InfoPageLayout from "@/components/InfoPageLayout";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "Contact",
  "Get in touch with kitzos for feedback, bug reports, or suggestions.",
  "/contact"
);

const CONTACT_TOPICS = [
  {
    icon: MessageSquare,
    title: "Feedback & suggestions",
    description: "Ideas for new tools, improvements, or general thoughts about the site.",
  },
  {
    icon: Bug,
    title: "Bug reports",
    description:
      "Something not working as expected? Tell us which tool, browser, and what happened.",
  },
  {
    icon: Mail,
    title: "Privacy & legal questions",
    description: "Questions about our Privacy Policy or Terms of Service.",
  },
];

export default function ContactPage() {
  const mailtoSubject = encodeURIComponent("kitzos.com — Contact");
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}`;

  return (
    <InfoPageLayout
      title="Contact"
      description="We'd love to hear from you."
    >
      <p>
        kitzos is a static website with no user accounts or server-side message inbox. The best way
        to reach us is by email using the button below — it will open your default email app with a
        pre-filled subject line.
      </p>

      <div className="!my-8 flex flex-col items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email us at</p>
          <a
            href={mailtoHref}
            className="mt-1 block text-lg font-semibold text-primary-600 dark:text-primary-400"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <a href={mailtoHref} className="btn-primary shrink-0">
          <Mail className="h-4 w-4" />
          Send email
        </a>
      </div>

      <h2>What to include</h2>
      <p>
        To help us respond usefully, please mention the page or tool you were using, your browser
        (e.g. Chrome, Firefox, Safari), and a short description of the issue or suggestion.
        Screenshots are welcome for bug reports.
      </p>

      <div className="grid gap-4 !mt-6 sm:grid-cols-3">
        {CONTACT_TOPICS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <Icon
              className="h-5 w-5 text-primary-600 dark:text-primary-400"
              aria-hidden="true"
            />
            <h3 className="!pt-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="mt-1 text-sm">{description}</p>
          </div>
        ))}
      </div>

      <h2>Response time</h2>
      <p>
        We read every message but cannot guarantee a reply time. kitzos is run as a small,
        independent project — thank you for your patience and for helping improve the site.
      </p>
    </InfoPageLayout>
  );
}
