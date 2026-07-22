import { SITE_URL } from "@/lib/site";

export async function GET() {
  const body = `# SoySupremo

> Sitio oficial de Supremo (SoySupremo): humor, música, partidos y lives.

- Home: ${SITE_URL}
- Contenido: ${SITE_URL}/contenido
- Música: ${SITE_URL}/musica
- Eventos: ${SITE_URL}/eventos
- Blog: ${SITE_URL}/blog
- Contacto / Patrocinios: ${SITE_URL}/contacto
- TikTok: https://www.tiktok.com/@supremolives
- YouTube: https://www.youtube.com/@SoySupremoo
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
