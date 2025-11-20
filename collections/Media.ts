import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: {
    useAsTitle: 'alt',
  },
  access: {
    // Public read access for images
    read: () => true,
    // Only admins can upload/manage media
    create: ({ req: { user } }) => user?.collection === 'admins',
    update: ({ req: { user } }) => user?.collection === 'admins',
    delete: ({ req: { user } }) => user?.collection === 'admins',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt tekst',
      admin: {
        description: 'Beskrivelse af billedet for tilgængelighed',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Billedtekst',
    },
  ],
}
