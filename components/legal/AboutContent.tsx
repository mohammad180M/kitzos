"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";
import { getToolsByCategoryLite } from "@/lib/registry-lite";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";

export default function AboutContent() {
  const { locale } = useLocale();

  if (locale === "ar") {
    return (
      <>
        <p>
          kitzos مجموعة أدوات مجانية على الإنترنت للمهام اليومية — دمج ملفات PDF وضغط الصور
          وتنسيق JSON وعدّ الكلمات وغيرها. كل شيء مبني ليعمل{" "}
          <strong>بالكامل في متصفحك</strong>، دون إرسال ملفاتك إلى خوادمنا.
        </p>

        <h2>لماذا وُجد kitzos</h2>
        <p>
          كثير من الأدوات على الإنترنت تطلب رفع مستندات حساسة أو إنشاء حساب قبل مهمة بسيطة.
          kitzos يتبع نهجاً معاكساً: افتح الأداة، أنجز المهمة، وانصرف. بلا حواجز تسجيل، بلا انتظار
          للرفع، وبلا تساؤل عن مصير بياناتك.
        </p>

        <h2>الخصوصية والسرعة في التصميم</h2>
        <p>
          عند استخدام أداة kitzos، تُعالَج ملفات PDF والصور والنصوص على جهازك عبر واجهات المتصفح
          الحديثة. لا نشغّل خادماً يستلم أو يخزّن ذلك المحتوى. ذلك يعني سير عمل أسرع لك وبصمة
          خصوصية أصغر — ملفاتك تبقى معك.
        </p>
        <p>
          قد يعرض الموقع إعلانات لإبقاء الأدوات مجانية. الإعلان من شركاء إعلان من أطراف ثالثة
          (حالياً Adsterra) منفصل عن عمل الأدوات نفسها. راجع{" "}
          <Link href={localizedPath(locale, "/privacy")}>سياسة الخصوصية</Link> للتفاصيل.
        </p>

        <h2>ما نقدّمه</h2>
        <p>
          تُنظَّم الأدوات في سبع فئات. كل فئة تجمع أدوات ذات صلة لتجد ما تحتاجه بسرعة:
        </p>

        <div className="space-y-6 !mt-8">
          {categories.map((category) => {
            const categoryTools = getToolsByCategoryLite(category.id);
            const { name, description } = getLocalizedCategory(category, locale);
            return (
              <div
                key={category.id}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <h3 className="!pt-0 text-lg font-semibold text-foreground">
                  <Link
                    href={localizedPath(locale, `/${category.id}`)}
                    className="hover:text-accent"
                  >
                    {name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm">{description}</p>
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                  {categoryTools.map((tool) => {
                    const { title } = getLocalizedTool(tool, locale);
                    return (
                      <li key={tool.slug} className="list-none">
                        <Link
                          href={localizedPath(locale, `/tools/${tool.slug}`)}
                          className="text-sm text-accent hover:underline"
                        >
                          {title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <h2>ملاحظة حول الدقة</h2>
        <p>
          نسعى لإبقاء الأدوات موثوقة ومفيدة، لكن البرمجيات لها حدود. راجع دائماً المخرجات المهمة
          — خاصة للمستندات القانونية أو الطبية أو المالية. kitzos أداة عملية وليس خدمة مهنية
          معتمدة.
        </p>

        <h2>تواصل معنا</h2>
        <p>
          لديك ملاحظة أو بلاغ خطأ أو فكرة لأداة جديدة؟ يسعدنا سماعك عبر صفحة{" "}
          <Link href={localizedPath(locale, "/contact")}>اتصل بنا</Link>.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        kitzos is a collection of free online tools for everyday tasks — merging PDFs, compressing
        images, formatting JSON, counting words, and more. Everything is built to run{" "}
        <strong>entirely in your web browser</strong>, without sending your files to our servers.
      </p>

      <h2>Why kitzos exists</h2>
      <p>
        Many online tools ask you to upload sensitive documents or create an account before you can
        do something simple. kitzos takes the opposite approach: open a tool, get the job done, and
        leave. No signup walls, no waiting for uploads, and no wondering where your data ended up.
      </p>

      <h2>Privacy and speed by design</h2>
      <p>
        When you use a kitzos tool, your PDFs, images, and text are processed on your device using
        modern browser APIs. We don&apos;t operate a backend that receives or stores that content.
        That means faster workflows for you and a smaller privacy footprint — your files stay with
        you.
      </p>
      <p>
        The site may show ads to help keep the tools free. Advertising is provided by third-party
        advertising partners (currently Adsterra) and is separate from how the tools themselves work. See our{" "}
        <Link href={localizedPath(locale, "/privacy")}>Privacy Policy</Link> for details.
      </p>

      <h2>What we offer</h2>
      <p>
        Tools are organized into seven categories. Each category groups related utilities so you can
        find what you need quickly:
      </p>

      <div className="space-y-6 !mt-8">
        {categories.map((category) => {
          const categoryTools = getToolsByCategoryLite(category.id);
          return (
            <div
              key={category.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <h3 className="!pt-0 text-lg font-semibold text-foreground">
                <Link
                  href={localizedPath(locale, `/${category.id}`)}
                  className="hover:text-accent"
                >
                  {category.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm">{category.description}</p>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {categoryTools.map((tool) => (
                  <li key={tool.slug} className="list-none">
                    <Link
                      href={localizedPath(locale, `/tools/${tool.slug}`)}
                      className="text-sm text-accent hover:underline"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h2>A note on accuracy</h2>
      <p>
        We work to keep tools reliable and useful, but software has limits. Always double-check
        important output — especially for legal, medical, or financial documents. kitzos is a
        practical utility, not a certified professional service.
      </p>

      <h2>Get in touch</h2>
      <p>
        Have feedback, a bug report, or an idea for a new tool? We&apos;d like to hear from you on
        our <Link href={localizedPath(locale, "/contact")}>Contact</Link> page.
      </p>
    </>
  );
}
