import Image from "next/image";

const PHOTOS = [
  { src: "/supremo1.png", alt: "Supremo" },
  { src: "/supremo2.png", alt: "Supremo" },
  { src: "/supremo3.png", alt: "Supremo" },
  { src: "/supremo4.png", alt: "Supremo" },
  { src: "/foto-supremo.jpg", alt: "Supremo" },
  { src: "/supremo-y-javird.png", alt: "Supremo" },
] as const;

export function PhotoMosaic() {
  return (
    <section aria-label="Galería" className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
        {PHOTOS.map((photo) => (
          <div key={photo.src} className="relative aspect-[3/4] overflow-hidden bg-bg-muted">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
