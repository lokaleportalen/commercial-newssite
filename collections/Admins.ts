import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: {
    tokenExpiration: 7200, // 2 hours
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: undefined,
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
  },
  access: {
    // Only admins can manage other admins
    create: ({ req: { user } }) => {
      return user?.collection === 'admins'
    },
    read: ({ req: { user } }) => {
      return user?.collection === 'admins'
    },
    update: ({ req: { user } }) => {
      return user?.collection === 'admins'
    },
    delete: ({ req: { user } }) => {
      return user?.collection === 'admins'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
