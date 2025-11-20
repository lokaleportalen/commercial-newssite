import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedDate', 'categories'],
    description: 'Administrer nyhedsartikler',
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375, // Auto-save every 375ms
      },
    },
    maxPerDoc: 50,
  },
  access: {
    // Published articles are public, drafts only for admins
    read: ({ req: { user } }) => {
      if (user?.collection === 'admins') return true
      // Public users can only see published articles
      return {
        _status: {
          equals: 'published',
        },
      }
    },
    // Only admins can manage articles
    create: ({ req: { user } }) => user?.collection === 'admins',
    update: ({ req: { user } }) => user?.collection === 'admins',
    delete: ({ req: { user } }) => user?.collection === 'admins',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 200,
      label: 'Titel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL slug',
      admin: {
        position: 'sidebar',
        description: 'URL-venlig version af titlen',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Indhold',
    },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 300,
      label: 'Resumé',
      admin: {
        description: '2-3 sætninger til artikelforhåndsvisning',
      },
    },
    {
      name: 'metaDescription',
      type: 'text',
      maxLength: 160,
      label: 'Meta beskrivelse',
      admin: {
        description: 'SEO meta beskrivelse (150-160 tegn)',
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Fremhævet billede',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Kilde URL',
      admin: {
        description: 'URL til den originale nyhedskilde',
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Kategorier',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Publiceringsdato',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
