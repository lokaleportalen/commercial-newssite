import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Om os | Estate News",
  description:
    "Læs mere om Estate News - din kilde til nyheder om erhvervsejendomme i Danmark",
};

export default function AboutPage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/about-hero.png"
              alt="Copenhagen commercial real estate"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Om Estate News
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Din daglige kilde til indsigt og nyheder om det danske marked for
              erhvervsejendomme
            </p>
          </div>
        </div>
      </section>

      {/* Visual Separator */}
      <div className="w-16 h-1 bg-primary/20 mx-auto my-8 rounded-full" />

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-muted/30 rounded-lg p-8 space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Vores Mission
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              Estate News leverer daglige nyheder, analyser og indsigt om det
              danske erhvervsejendomsmarked. Vi dækker alt fra kontorer og
              butikker til logistikcentre og industriejendomme.
            </p>
            <p>
              Vores mål er at holde investorer, udviklere, mæglere og andre
              professionelle opdateret med de seneste trends, transaktioner og
              udviklinger i branchen. Vi stræber efter at levere præcis,
              relevant og rettidig information, der hjælper vores læsere med at
              træffe informerede beslutninger.
            </p>
            <p>
              Estate News er en del af{" "}
              <a
                href="https://www.lokaleportalen.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Lokaleportalen.dk
              </a>
              , Danmarks førende platform for erhvervsejendomme.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
