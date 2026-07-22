import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos" };

export default function TerminosPage() {
  return (
    <div className="section-pad">
      <div className="container-narrow max-w-3xl">
        <h1 className="font-display text-5xl mb-8">Términos</h1>
        <div className="space-y-4 leading-relaxed text-ink-soft">
          <p>
            El contenido de este sitio (marca, textos, imágenes propias y
            materiales publicados) pertenece a SoySupremo o a sus respectivos
            titulares.
          </p>
          <p>
            Los enlaces a YouTube, TikTok, Instagram, Facebook, X y Spotify
            dirigen a plataformas de terceros con sus propias condiciones.
          </p>
          <p>
            Los eventos, entradas y colaboraciones se gestionan según lo
            indicado en cada publicación. Para consultas: soysupremohn@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
