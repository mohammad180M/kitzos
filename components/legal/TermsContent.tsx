"use client";

import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/routing";

export default function TermsContent() {
  const { locale, t } = useLocale();

  if (locale === "ar") {
    return (
      <>
        <p className="text-sm text-muted">
          <strong>{t.legal.lastUpdated}:</strong> {LEGAL_LAST_UPDATED}
        </p>

        <p>
          تحكم شروط الخدمة هذه (&laquo;الشروط&raquo;) وصولك إلى kitzos.com واستخدامك للأدوات
          المجانية على الموقع (مجتمعة: &laquo;الخدمة&raquo;). باستخدامك للخدمة، فإنك توافق على
          هذه الشروط. إذا لم توافق، يرجى عدم استخدام الموقع.
        </p>

        <h2>الخدمة</h2>
        <p>
          يوفّر kitzos أدوات في المتصفح للعمل مع ملفات PDF والصور والنص ومهام المطوّرين ذات
          الصلة. صُمّمت الأدوات لمعالجة البيانات محلياً في متصفحك حيثما أمكن تقنياً. تُقدَّم
          الخدمة مجاناً، مدعومة جزئياً بالإعلانات عند عرضها.
        </p>

        <h2>بدون ضمان — &laquo;كما هي&raquo;</h2>
        <p>
          تُقدَّم الخدمة <strong>كما هي</strong> و<strong>حسب التوفر</strong>، دون أي ضمانات من
          أي نوع، صريحة أو ضمنية، بما في ذلك ضمانات القابلية للتسويق أو الملاءمة لغرض معيّن أو
          الدقة أو عدم الانتهاك. لا نضمن خلو أي أداة من الأخطاء أو استمراريتها أو ملاءمتها
          لاحتياجاتك الخاصة.
        </p>
        <p>
          قد تحتوي نتائج الأدوات (مثل الملفات المحوّلة أو النص المنسّق) على أخطاء. أنت مسؤول عن
          مراجعة المخرجات قبل الاعتماد عليها في أمور مهنية أو قانونية أو مالية أو غيرها.
        </p>

        <h2>الاستخدام المقبول</h2>
        <p>توافق على استخدام الخدمة لأغراض قانونية فقط. يجب ألا:</p>
        <ul>
          <li>تستخدم الأدوات لمعالجة محتوى ليس لك الحق في استخدامه</li>
          <li>تستخدم الخدمة لانتهاك أي قانون أو لائحة سارية</li>
          <li>تحاول تعطيل الموقع أو إرهاقه أو استخراج بياناته أو عكس هندسته بما يضر بتشغيله أو المستخدمين</li>
          <li>تستخدم الخدمة لنشر برمجيات خبيثة أو رسائل مزعجة أو مواد ضارة</li>
        </ul>
        <p>
          أنت وحدك المسؤول عن المحتوى الذي تدخله في أي أداة وعن كيفية استخدام المخرجات. لا يراقب
          kitzos ولا يخزّن مدخلات الأدوات على خوادمه.
        </p>

        <h2>الملكية الفكرية</h2>
        <p>
          اسم kitzos وعلامته التجارية وتصميم الموقع ومحتواه الأصلي مملوكة لـ kitzos أو مرخِّصيها
          ومحمية بقوانين الملكية الفكرية. لا يجوز نسخ الموقع أو تعديله أو إعادة توزيعه دون إذن،
          إلا حيث يسمح القانون أو الاستخدام الشخصي العادي.
        </p>
        <p>
          تحتفظ بحقوقك في المحتوى الذي تقدّمه للأدوات. لا ندّعي ملكية الملفات أو النصوص التي
          تعالجها محلياً في متصفحك.
        </p>

        <h2>خدمات وروابط أطراف ثالثة</h2>
        <p>
          قد تتضمن الخدمة خدمات خارجية (مثل الاستضافة أو الإعلان أو مواقع مرتبطة). تخضع تلك
          الخدمات لشروطها وسياساتها. لسنا مسؤولين عن محتوى أو ممارسات أطراف ثالثة.
        </p>

        <h2>تحديد المسؤولية</h2>
        <p>
          إلى أقصى حد يسمح به القانون، لن يكون kitzos ومشغّلوه مسؤولين عن أي أضرار غير مباشرة أو
          عرضية أو خاصة أو تبعية أو عقابية، أو فقدان أرباح أو بيانات أو سمعة أو خسائر غير
          ملموسة، ناتجة عن استخدامك للخدمة أو عدم قدرتك على استخدامها، حتى لو أُبلغنا بإمكانية
          حدوثها.
        </p>
        <p>
          لن تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة متعلقة بالخدمة أكبر من (أ) ما دفعته لنا
          خلال الاثني عشر شهراً السابقة للمطالبة (وهو صفر للاستخدام المجاني)، أو (ب) مائة دولار
          أمريكي (100 USD) حيث يسمح القانون بذلك.
        </p>

        <h2>التوفر</h2>
        <p>
          قد نعدّل أو نعلّق أو نوقف أي جزء من الخدمة في أي وقت دون إشعار. لا نضمن التوفر
          المستمر أو بقاء أي أداة معيّنة على الموقع.
        </p>

        <h2>الخصوصية</h2>
        <p>
          يخضع استخدامك للخدمة أيضاً لـ{" "}
          <Link href={localizedPath(locale, "/privacy")}>سياسة الخصوصية</Link>، التي توضّح كيفية التعامل مع المعلومات
          عند زيارة kitzos.com، بما في ذلك خدمات الأطراف الثالثة مثل الإعلان والاستضافة.
        </p>

        <h2>تغييرات على هذه الشروط</h2>
        <p>
          قد نحدّث هذه الشروط من وقت لآخر. يشير تاريخ &laquo;آخر تحديث&raquo; في الأعلى إلى آخر
          مراجعة. استمرارك في استخدام الخدمة بعد التغييرات يعني قبول الشروط المحدّثة.
        </p>

        <h2>القانون الحاكم</h2>
        <p>
          تخضع هذه الشروط للقانون المعمول به في الولاية القضائية التي يقيم فيها مشغّل الموقع، دون
          مراعاة تعارض القوانين، إلا حيث تفرض حماية المستهلك الإلزامية في بلدك خلاف ذلك.
        </p>

        <h2>اتصل بنا</h2>
        <p>
          أسئلة حول هذه الشروط؟ راسلنا على{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-muted">
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of kitzos.com
        and the free online tools offered on the site (collectively, the &ldquo;Service&rdquo;).
        By using the Service, you agree to these Terms. If you do not agree, please do not use the
        site.
      </p>

      <h2>The Service</h2>
      <p>
        kitzos provides browser-based utilities for working with PDFs, images, text, and related
        developer tasks. Tools are designed to process data locally in your browser where
        technically possible. The Service is offered free of charge, supported in part by
        advertising where displayed.
      </p>

      <h2>No warranty — &ldquo;as is&rdquo;</h2>
      <p>
        The Service is provided <strong>as is</strong> and <strong>as available</strong>, without
        warranties of any kind, whether express or implied, including but not limited to implied
        warranties of merchantability, fitness for a particular purpose, accuracy, or
        non-infringement. We do not guarantee that any tool will be error-free, uninterrupted, or
        suitable for your specific needs.
      </p>
      <p>
        Results produced by the tools (for example, converted files, formatted text, or generated
        output) may contain errors. You are responsible for reviewing output before relying on it
        for professional, legal, financial, or other important purposes.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree to use the Service only for lawful purposes. You must not:</p>
      <ul>
        <li>Use the tools to process content you do not have the right to use</li>
        <li>Use the Service to violate any applicable law or regulation</li>
        <li>
          Attempt to disrupt, overload, scrape, or reverse-engineer the site in ways that harm its
          operation or other users
        </li>
        <li>Use the Service to distribute malware, spam, or harmful material</li>
      </ul>
      <p>
        You are solely responsible for the content you input into any tool and for how you use the
        output. kitzos does not monitor or store your tool input on its servers.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The kitzos name, branding, site design, and original site content are owned by kitzos or
        its licensors and are protected by applicable intellectual property laws. You may not copy,
        modify, or redistribute the site or its branding without permission, except as allowed by
        law or normal personal use of the Service.
      </p>
      <p>
        You retain any rights you have in content you provide to the tools. We do not claim
        ownership of files or text you process locally in your browser.
      </p>

      <h2>Third-party services and links</h2>
      <p>
        The Service may include third-party services (such as hosting, advertising, or linked
        external sites). Those services are governed by their own terms and policies. We are not
        responsible for third-party content or practices.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, kitzos and its operators will not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or any loss of
        profits, data, goodwill, or other intangible losses, arising from your use of or inability
        to use the Service, even if we have been advised of the possibility of such damages.
      </p>
      <p>
        Our total liability for any claim relating to the Service shall not exceed the greater of
        (a) the amount you paid us to use the Service in the twelve months before the claim (which
        is zero for free use), or (b) one hundred U.S. dollars (USD $100), where permitted by law.
      </p>

      <h2>Availability</h2>
      <p>
        We may modify, suspend, or discontinue any part of the Service at any time without notice.
        We do not guarantee continuous availability or that any particular tool will remain on the
        site.
      </p>

      <h2>Privacy</h2>
      <p>
        Your use of the Service is also governed by our{" "}
        <Link href={localizedPath(locale, "/privacy")}>Privacy Policy</Link>, which explains how information is handled when
        you visit kitzos.com, including third-party services such as advertising and hosting.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top
        indicates when they were last revised. Your continued use of the Service after changes
        constitutes acceptance of the updated Terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by applicable law in the jurisdiction where the site operator
        resides, without regard to conflict-of-law principles, except where mandatory consumer
        protections in your country require otherwise.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
