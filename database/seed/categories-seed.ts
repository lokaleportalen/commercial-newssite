import { db } from "../db";
import { category } from "../schema/categories-schema";

export async function seedCategories() {
  console.log("Seeding categories...");

  const categories = [
    {
      name: "Investering",
      slug: "investering",
      description: "Investeringer, salg og finansielle transaktioner i erhvervsejendomme",
      heroImage: "/categories/hero/investering-category.png",
    },
    {
      name: "Byggeri",
      slug: "byggeri",
      description: "Byggeprojekter, udvikling og nybyggeri",
      heroImage: "/categories/hero/byggeri-category.png",
    },
    {
      name: "Kontor",
      slug: "kontor",
      description: "Kontorlokaler og kontorejendomme",
      heroImage: "/categories/hero/kontor-category.png",
    },
    {
      name: "Lager",
      slug: "lager",
      description: "Lagerfaciliteter og lagerejendomme",
      heroImage: "/categories/hero/lager-category.png",
    },
    {
      name: "Detailhandel",
      slug: "detailhandel",
      description: "Butikslokaler og detailhandelsejendomme",
      heroImage: null, // No image provided for this category yet
    },
    {
      name: "Logistik",
      slug: "logistik",
      description: "Logistikcentre og distributionsfaciliteter",
      heroImage: "/categories/hero/logistik-category.png",
    },
    {
      name: "Hotel",
      slug: "hotel",
      description: "Hotelejendomme og turismefaciliteter",
      heroImage: "/categories/hero/hotel-category.png",
    },
    {
      name: "Industri",
      slug: "industri",
      description: "Industriejendomme og produktionsfaciliteter",
      heroImage: "/categories/hero/industri-category.png",
    },
    {
      name: "Bolig",
      slug: "bolig",
      description: "Boligejendomme og udlejningsejendomme",
      heroImage: "/categories/hero/bolig-category.png",
    },
    {
      name: "Bæredygtighed",
      slug: "baeredygtighed",
      description: "Bæredygtighed, grønne tiltag og energieffektivisering",
      heroImage: "/categories/hero/baedygtighed-category.png", // Note: filename has different spelling
    },
  ];

  await db.insert(category).values(categories);

  console.log(`✓ Created ${categories.length} categories`);
}
