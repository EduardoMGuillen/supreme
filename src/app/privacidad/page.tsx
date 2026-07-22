import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="section-pad">
      <div className="container-narrow max-w-3xl">
        <h1 className="font-display text-5xl mb-8">Privacidad</h1>
        <div className="space-y-4 leading-relaxed text-ink-soft">
          <p>
            soysupremohn.com es el sitio oficial de SoySupremo. Recopilamos la
            información que envías en el formulario de contacto (nombre, email,
            empresa y mensaje) únicamente para responderte.
          </p>
          <p>
            No vendemos datos personales. Los mensajes pueden almacenarse de
            forma segura para gestión interna y enviarse por correo mediante
            Resend.
          </p>
          <p>
            Si usamos analítica o publicidad en el futuro, se actualizará esta
            página. Contacto: soysupremohn@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
