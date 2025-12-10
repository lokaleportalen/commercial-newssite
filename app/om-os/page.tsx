import { Metadata } from "next";
import { Building2, Sparkles, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Om os | Estate News",
  description:
    "Læs mere om Estate News - din kilde til nyheder om erhvervsejendomme i Danmark",
};

export default function AboutPage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Om Estate News
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Din daglige kilde til indsigt og nyheder om det danske marked for
              erhvervsejendomme
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Mission Statement */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Estate News er en del af{" "}
              <a
                href="https://www.lokaleportalen.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Lokaleportalen.dk
              </a>{" "}
              og leverer daglige nyheder og analyser om erhvervsejendomme i
              Danmark. Vi kombinerer avanceret AI-teknologi med journalistisk
              grundighed for at give dig de mest relevante historier fra
              branchen.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Fokus på Erhverv</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Specialiseret dækning af kontorer, butikker, logistik og andre
                erhvervsejendomme på det danske marked.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Markedsindsigt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Få dybdegående analyser af trends, transaktioner og udviklinger
                i erhvervsejendomsbranchen.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>For Fagfolk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Skræddersyet til investorer, udviklere, mæglere og andre
                professionelle i erhvervsejendomssektoren.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Partnership Section */}
        <section className="bg-muted/50 rounded-lg p-8 border">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">En del af Lokaleportalen</h2>
            <p className="text-muted-foreground">
              Lokaleportalen.dk er Danmarks førende platform for
              erhvervsejendomme. Med tusindvis af ledige lokaler og en bred
              vifte af services hjælper vi virksomheder med at finde det
              perfekte erhvervslokale.
            </p>
            <div className="pt-4">
              <a
                href="https://www.lokaleportalen.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Besøg Lokaleportalen.dk
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
