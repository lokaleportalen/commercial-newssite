import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
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
    defaultColumns: ['name', 'email', 'emailPreferences'],
  },
  access: {
    // Admins can see all users, users can only see themselves
    read: ({ req: { user } }) => {
      if (user?.collection === 'admins') return true
      if (user?.collection === 'users') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Anyone can create (public signup)
    create: () => true,
    // Users can update themselves, admins can update anyone
    update: ({ req: { user } }) => {
      if (user?.collection === 'admins') return true
      if (user?.collection === 'users') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only admins can delete users
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
    {
      name: 'emailPreferences',
      type: 'checkbox',
      label: 'Modtag email notifikationer',
      defaultValue: true,
    },
  ],
}
