export function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Find en{" "}
            <span className="text-primary">lejer eller køber</span>{" "}
            til dine{" "}
            <span className="text-primary">erhvervslokaler</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Søg og få adgang til flere tusinde af ledige og kommende erhvervslokaler
          </p>
        </div>
      </div>
    </div>
  );
}
