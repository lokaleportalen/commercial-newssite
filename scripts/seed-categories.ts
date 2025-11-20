import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const categories = [
  {
    name: 'Investering',
    slug: 'investering',
    description: 'Nyheder om ejendomsinvesteringer og kapital i erhvervsejendomme'
  },
  {
    name: 'Byggeri',
    slug: 'byggeri',
    description: 'Nyheder om byggeprojekter og nybyggeri af erhvervsejendomme'
  },
  {
    name: 'Byudvikling',
    slug: 'byudvikling',
    description: 'Nyheder om byplanlægning, bydelsudvikling og byfornyelse'
  },
  {
    name: 'Finans',
    slug: 'finans',
    description: 'Nyheder om finansiering, realkreditlån og ejendomsøkonomi'
  },
  {
    name: 'Lokaler',
    slug: 'lokaler',
    description: 'Nyheder om kontorer, butikker og erhvervslokaler til leje'
  },
  {
    name: 'Ejendomme',
    slug: 'ejendomme',
    description: 'Nyheder om salg og køb af erhvervsejendomme'
  },
  {
    name: 'Jura',
    slug: 'jura',
    description: 'Nyheder om ejendomsret, byggelovgivning og regulering'
  },
  {
    name: 'Marked',
    slug: 'marked',
    description: 'Nyheder om markedsudvikling, trends og analyser'
  },
  {
    name: 'Bæredygtighed',
    slug: 'baeredygtighed',
    description: 'Nyheder om grøn omstilling, energirenovering og klimatilpasning'
  },
  {
    name: 'Teknologi',
    slug: 'teknologi',
    description: 'Nyheder om PropTech, digitalisering og innovation i ejendomsbranchen'
  },
]

async function seedCategories() {
  console.log('🌱 Seeding categories...')

  const payload = await getPayload({ config })

  for (const category of categories) {
    try {
      // Check if category already exists
      const existing = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: category.slug
          }
        }
      })

      if (existing.docs.length > 0) {
        console.log(`✓ Category "${category.name}" already exists`)
        continue
      }

      // Create category
      await payload.create({
        collection: 'categories',
        data: category
      })

      console.log(`✓ Created category: ${category.name}`)
    } catch (error) {
      console.error(`✗ Error creating category ${category.name}:`, error)
    }
  }

  console.log('✓ Category seeding complete!')
  process.exit(0)
}

seedCategories()
