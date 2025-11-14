import { db } from "../db";
import { category } from "../schema/categories-schema";

export async function seedCategories() {
  console.log("Seeding categories...");

  const categories = [
    {
      name: "Investering",
      slug: "investering",
      description: "Investeringer, salg og finansielle transaktioner i erhvervsejendomme",
    },
    {
      name: "Byggeri",
      slug: "byggeri",
      description: "Byggeprojekter, udvikling og nybyggeri",
    },
    {
      name: "Kontor",
      slug: "kontor",
      description: "Kontorlokaler og kontorejendomme",
    },
    {
      name: "Lager",
      slug: "lager",
      description: "Lagerfaciliteter og lagerejendomme",
    },
    {
      name: "Detailhandel",
      slug: "detailhandel",
      description: "Butikslokaler og detailhandelsejendomme",
    },
    {
      name: "Logistik",
      slug: "logistik",
      description: "Logistikcentre og distributionsfaciliteter",
    },
    {
      name: "Hotel",
      slug: "hotel",
      description: "Hotelejendomme og turismefaciliteter",
    },
    {
      name: "Industri",
      slug: "industri",
      description: "Industriejendomme og produktionsfaciliteter",
    },
    {
      name: "Bolig",
      slug: "bolig",
      description: "Boligejendomme og udlejningsejendomme",
    },
    {
      name: "Bæredygtighed",
      slug: "baeredygtighed",
      description: "Bæredygtighed, grønne tiltag og energieffektivisering",
    },
  ];

  await db.insert(category).values(categories);

  console.log(`✓ Created ${categories.length} categories`);
}
