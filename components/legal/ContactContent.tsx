"use client";

import Link from "next/link";
import { Mail, MessageSquare, Bug } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ContactContent() {
  const { locale } = useLocale();
  const mailtoSubject = encodeURIComponent(
    locale === "ar" ? "kitzos.com — تواصل" : "kitzos.com — Contact"
  );
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}`;

  if (locale === "ar") {
    return (
      <>
        <p>
          kitzos موقع ثابت بدون حسابات مستخدمين أو صندوق رسائل على الخادم. أفضل طريقة للتواصل
          معنا هي البريد الإلكتروني عبر الزر أدناه — سيفتح تطبيق البريد الافتراضي مع سطر موضوع
          جاهز.
        </p>

        <div className="!my-8 flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6 dark:border-line dark:bg-surface-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">راسلنا على</p>
            <a
              href={mailtoHref}
              className="mt-1 block text-lg font-semibold text-accent ltr"
              dir="ltr"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <a href={mailtoHref} className="btn-primary shrink-0">
            <Mail className="h-4 w-4" />
            إرسال بريد
          </a>
        </div>

        <h2>ماذا تذكر في رسالتك</h2>
        <p>
          لمساعدتنا على الرد بفائدة، يرجى ذكر الصفحة أو الأداة التي كنت تستخدمها، ومتصفحك (مثل
          Chrome أو Firefox أو Safari)، ووصف مختصر للمشكلة أو الاقتراح. لبلاغات الأخطاء، لقطات
          الشاشة مرحّب بها.
        </p>

        <div className="grid gap-4 !mt-6 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-4">
            <MessageSquare
              className="h-5 w-5 text-accent"
              aria-hidden="true"
            />
            <h3 className="!pt-2 text-base font-semibold text-foreground">
              ملاحظات واقتراحات
            </h3>
            <p className="mt-1 text-sm">
              أفكار لأدوات جديدة أو تحسينات أو انطباعات عامة عن الموقع.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <Bug className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="!pt-2 text-base font-semibold text-foreground">
              بلاغات الأخطاء
            </h3>
            <p className="mt-1 text-sm">
              شيء لا يعمل كما تتوقع؟ أخبرنا بالأداة والمتصفح وما حدث.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="!pt-2 text-base font-semibold text-foreground">
              أسئلة قانونية وخصوصية
            </h3>
            <p className="mt-1 text-sm">أسئلة حول سياسة الخصوصية أو شروط الخدمة.</p>
          </div>
        </div>

        <h2>وقت الرد</h2>
        <p>
          نقرأ كل رسالة لكن لا نضمن موعد رد. kitzos مشروع مستقل صغير — شكراً لصبرك ولمساعدتك في
          تحسين الموقع.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        kitzos is a static website with no user accounts or server-side message inbox. The best way
        to reach us is by email using the button below — it will open your default email app with a
        pre-filled subject line.
      </p>

      <div className="!my-8 flex flex-col items-start gap-4 rounded-xl border border-line bg-surface p-6 dark:border-line dark:bg-surface-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Email us at</p>
          <a
            href={mailtoHref}
            className="mt-1 block text-lg font-semibold text-accent"
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
        <div className="rounded-lg border border-line bg-surface p-4">
          <MessageSquare
            className="h-5 w-5 text-accent"
            aria-hidden="true"
          />
          <h3 className="!pt-2 text-base font-semibold text-foreground">
            Feedback & suggestions
          </h3>
          <p className="mt-1 text-sm">
            Ideas for new tools, improvements, or general thoughts about the site.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <Bug className="h-5 w-5 text-accent" aria-hidden="true" />
          <h3 className="!pt-2 text-base font-semibold text-foreground">
            Bug reports
          </h3>
          <p className="mt-1 text-sm">
            Something not working as expected? Tell us which tool, browser, and what happened.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
          <h3 className="!pt-2 text-base font-semibold text-foreground">
            Privacy & legal questions
          </h3>
          <p className="mt-1 text-sm">Questions about our Privacy Policy or Terms of Service.</p>
        </div>
      </div>

      <h2>Response time</h2>
      <p>
        We read every message but cannot guarantee a reply time. kitzos is run as a small,
        independent project — thank you for your patience and for helping improve the site.
      </p>
    </>
  );
}
