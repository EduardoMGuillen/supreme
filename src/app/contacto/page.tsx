import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto / Patrocinios",
  description:
    "Contacto, patrocinios y colaboraciones con SoySupremo. Escríbenos a soysupremohn@gmail.com.",
};

export default function ContactoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto SoySupremo",
    url: `${SITE_URL}/contacto`,
  };

  return (
    <div className="section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-narrow grid gap-12 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-[0.72rem] tracking-[0.16em] uppercase text-ink-soft">
            Hablemos
          </p>
          <h1 className="font-display text-5xl md:text-7xl mt-2 leading-[0.92]">
            Contacto
          </h1>
          <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
            Contacto general, patrocinios de marca o colaboraciones. El mensaje
            llega directo a{" "}
            <a
              href="mailto:soysupremohn@gmail.com"
              className="text-ink underline underline-offset-4"
            >
              soysupremohn@gmail.com
            </a>
            .
          </p>
          <ul className="mt-8 space-y-3 text-sm tracking-wide uppercase">
            <li className="border-t border-[var(--line)] pt-3">Contacto</li>
            <li className="border-t border-[var(--line)] pt-3">Patrocinios</li>
            <li className="border-t border-[var(--line)] pt-3">Colaboraciones</li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
