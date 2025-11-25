import Link from "next/link";

export function HeroBanner() {
  return (
    <Link
      href="https://www.lokaleportalen.dk"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-muted/30 border-b hover:bg-muted/50 transition-colors"
    >
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-7xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Find en{" "}
            <span className="text-primary">lejer eller køber</span>{" "}
            til dine{" "}
            <span className="text-primary">erhvervslokaler</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Søg og få adgang til flere tusinde af ledige og kommende erhvervslokaler
          </p>
        </div>
      </div>
    </Link>
  );
}
