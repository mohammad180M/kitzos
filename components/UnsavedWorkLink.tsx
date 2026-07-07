"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { hasUnsavedWork } from "@/lib/unsaved-work";
import UnsavedWorkDialog from "@/components/UnsavedWorkDialog";

interface UnsavedWorkLinkProps extends Omit<ComponentProps<typeof Link>, "onClick"> {
  children: ReactNode;
}

/** Internal navigation link that confirms when the tool has unsaved work. */
export default function UnsavedWorkLink({ href, children, ...rest }: UnsavedWorkLinkProps) {
  const router = useRouter();
  const { t, dir } = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = () => {
    router.push(typeof href === "string" ? href : href.toString());
  };

  return (
    <>
      <Link
        href={href}
        {...rest}
        onClick={(e) => {
          if (hasUnsavedWork()) {
            e.preventDefault();
            setDialogOpen(true);
          }
        }}
      >
        {children}
      </Link>

      <UnsavedWorkDialog
        open={dialogOpen}
        title={t.header.unsavedWorkTitle}
        body={t.header.unsavedWorkBody}
        confirmLabel={t.header.unsavedWorkConfirm}
        cancelLabel={t.header.unsavedWorkCancel}
        dir={dir}
        onConfirm={() => {
          setDialogOpen(false);
          navigate();
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
}
