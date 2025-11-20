import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Admins } from './collections/Admins'
import { Users } from './collections/Users'
import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',

  admin: {
    user: 'admins', // Only admins collection can access admin panel
    autoLogin: process.env.NODE_ENV === 'development' ? {
      email: 'admin@nyheder.dk',
      password: 'admin123',
      prefillOnly: true,
    } : false,
  },

  editor: lexicalEditor(),

  collections: [
    Admins,
    Users,
    Articles,
    Categories,
    Media,
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    prodMigrations: {
      dir: path.resolve(dirname, 'migrations'),
    },
  }),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  plugins: [
    vercelBlobStorage({
      enabled: true, // Enable Vercel Blob storage
      collections: {
        media: true, // Enable for media collection
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],

  // Server URL for generating absolute URLs
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

  // CORS configuration
  cors: [
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // CSRF configuration
  csrf: [
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ].filter(Boolean),
})
