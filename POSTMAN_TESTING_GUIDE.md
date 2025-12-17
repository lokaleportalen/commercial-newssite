# Postman API Testing Guide

## ⚠️ CRITICAL: Production Safety Warning

**This Postman collection connects to endpoints that affect PRODUCTION data.** Unlike many APIs, this system does NOT have separate development and production environments for:

- **Database**: All writes go to production PostgreSQL
- **Vercel Blob**: Shared storage for dev and prod (no separation)
- **Email**: Real emails sent via Mailgun to real users
- **AI APIs**: Real costs incurred on OpenAI and Gemini

## 🔴 High-Risk Endpoints (DO NOT USE CASUALLY)

These endpoints will cause immediate production impact:

### 💰 AI & Cost Endpoints
| Endpoint | Risk | Impact |
|----------|------|--------|
| `POST /api/admin/trigger-cron` | 🔴 EXTREME | Costs money (GPT-4o + Gemini), creates articles in DB, uploads to prod blob |
| `POST /api/admin/articles/:id/regenerate-image` | 🔴 HIGH | Costs money (Gemini), uploads to prod blob |

### 📧 Email Endpoints
| Endpoint | Risk | Impact |
|----------|------|--------|
| `POST /api/admin/articles/notify` | 🔴 EXTREME | Sends REAL emails to ALL users with matching preferences |
| `PUT /api/admin/articles/:id` (status=published) | 🔴 EXTREME | Auto-triggers email notifications when publishing |
| `POST /api/send-email` | 🟡 MEDIUM | Sends real email to specified address |
| `POST /api/admin/email-templates/:id/send-test` | 🟡 MEDIUM | Sends real email using template |

### 📤 Upload Endpoints (Permanent Storage)
| Endpoint | Risk | Impact |
|----------|------|--------|
| `POST /api/upload` | 🟡 MEDIUM | Uploads to prod Vercel Blob (permanent) |
| `POST /api/admin/upload-category-image` | 🟡 MEDIUM | Uploads to prod Vercel Blob (permanent) |

### 🗑️ Destructive Endpoints
| Endpoint | Risk | Impact |
|----------|------|--------|
| `DELETE /api/admin/articles/:id` | 🟡 MEDIUM | Deletes prod article + blob image |
| `DELETE /api/admin/users/:id` | 🟡 MEDIUM | Deletes prod user permanently |
| `DELETE /api/admin/email-templates/:id` | 🟡 MEDIUM | Deletes prod template |
| `DELETE /api/admin/ai-prompts/:id` | 🟡 MEDIUM | Deletes prod AI prompt |

## ✅ Safe for Testing

These endpoints are read-only or low-impact:

### 📖 Read-Only (100% Safe)
- `GET /api/articles` - List published articles
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/slug/:slug` - Get article by slug
- `GET /api/categories` - List categories
- `GET /api/user/preferences` - Get user preferences
- `GET /api/user/profile` - Get user profile
- `GET /api/admin/articles` - List all articles (admin)
- `GET /api/admin/categories` - List categories (admin)
- `GET /api/admin/users/search` - Search users
- `GET /api/admin/email-templates` - List templates
- `GET /api/admin/ai-prompts` - List prompts

### 🔐 Auth (Session Only)
- `POST /api/auth/sign-in` - Creates session cookie (safe)
- `POST /api/auth/sign-out` - Removes session (safe)
- `GET /api/auth/session` - Check session (safe)
- `POST /api/auth/sign-up` - Creates user + sends welcome email ⚠️

### ✏️ Low-Impact Writes
- `POST /api/admin/articles` (status=draft) - Creates draft article (safe, not published)
- `PUT /api/admin/articles/:id` (status=draft) - Updates draft (safe, no emails)
- `POST /api/user/preferences` - Updates user preferences (only affects your test user)
- `PUT /api/user/profile` - Updates profile (only affects your test user)

## 🛡️ Safe Testing Practices

### 1. Use Local Development Environment
```bash
# Start local dev server
npm run dev

# Point Postman to localhost
{{baseUrl}} = http://localhost:3000
```

### 2. Test with Draft Articles
When creating/updating articles, **always use `status: "draft"`** to prevent:
- Articles appearing on public site
- Email notifications being sent
- Trigger.dev tasks firing

```json
{
  "title": "Test Article",
  "status": "draft"  // ← SAFE
}
```

### 3. Avoid These Actions in Production
- ❌ Never trigger weekly news cron
- ❌ Never manually trigger article notifications
- ❌ Never change article status to "published" unless intended
- ❌ Never upload files unless you want them permanently stored
- ❌ Never delete production data

### 4. Email Testing
To test email functionality without spamming users:
1. Use `/api/send-email` with **your own email address**
2. Create test users with fake email addresses
3. Set your test user preferences to match article categories
4. **DO NOT** trigger `/api/admin/articles/notify` in production

### 5. Blob Storage Testing
Remember: **Uploads are permanent** and use production storage
- Consider the 1GB free tier limit
- Images cannot be easily bulk-deleted
- Use small test images
- Don't upload repeatedly

## 📋 Recommended Testing Flow

### Initial Setup (One Time)
1. Import `postman-collection.json` into Postman
2. Set `{{baseUrl}}` to `http://localhost:3000`
3. Start local dev server: `npm run dev`

### Safe Testing Sequence
1. **Auth**: Sign in as test user
   ```
   POST /api/auth/sign-in
   Body: {"email": "test@example.com", "password": "password123"}
   ```

2. **Read Operations**: Test all GET endpoints (100% safe)
   ```
   GET /api/articles
   GET /api/categories
   GET /api/user/preferences
   ```

3. **User Preferences**: Update your test user settings
   ```
   POST /api/user/preferences
   Body: {"allCategories": true, "emailFrequency": "weekly"}
   ```

4. **Draft Articles**: Create/edit draft articles (safe)
   ```
   POST /api/admin/articles
   Body: {"title": "Test", "status": "draft", ...}
   ```

5. **Sign out**
   ```
   POST /api/auth/sign-out
   ```

### What to NEVER Test in Production
- ❌ Weekly news trigger
- ❌ Article notifications
- ❌ Publishing articles (triggers emails)
- ❌ Blob uploads (unless needed)
- ❌ Deleting production data

## 🔧 Environment Setup

### Local Development (Recommended)
```bash
# .env.local
DATABASE_URL=postgresql://localhost/newssite_dev
OPENAI_API_KEY=sk-...  # Optional: comment out to disable AI
GEMINI_API_KEY=...     # Optional: comment out to disable images
MAILGUN_API_KEY=...    # Optional: comment out to disable emails
BLOB_READ_WRITE_TOKEN=... # Required for uploads
```

### Production Testing (Use with Extreme Caution)
If you must test against production:
1. Only use GET requests
2. Only modify your own test user data
3. **NEVER** trigger cron jobs
4. **NEVER** send emails to real users
5. **NEVER** publish articles

## 📊 API Cost Tracking

Be aware of API costs when testing:

| Service | Cost per Call | Triggered By |
|---------|--------------|--------------|
| OpenAI GPT-4o | ~$0.01-0.10 | Weekly news, article research |
| Gemini 3 Pro | ~$0.05 | Image generation |
| Mailgun | Free (10k/mo) | Email sending |
| Vercel Blob | Free (1GB) | File uploads |

**Expensive endpoints:**
- `POST /api/admin/trigger-cron` - Can cost $1-5 per run (10+ articles with images)
- `POST /api/admin/articles/:id/regenerate-image` - ~$0.05 per image

## 🆘 Emergency: Accidental Production Impact

If you accidentally trigger something in production:

1. **Triggered Weekly News**
   - Check Trigger.dev dashboard: https://cloud.trigger.dev
   - Monitor article creation in admin panel
   - Articles created as drafts (safe, not published)
   - Let it complete or cancel the task

2. **Sent Email Notifications**
   - Cannot be recalled
   - Check Mailgun logs to see who received emails
   - Apologize to users if needed

3. **Uploaded Files to Blob**
   - Files are permanent
   - Check Vercel dashboard to manage storage
   - Manually delete if needed (no bulk delete)

4. **Deleted Production Data**
   - Check database backups
   - Restore from most recent backup if critical

## 📚 Additional Resources

- **Full API Documentation**: See `postman-collection.json`
- **Project Documentation**: See `CLAUDE.md`
- **Better-Auth Docs**: https://better-auth.com
- **Trigger.dev Docs**: https://trigger.dev/docs

## 🤝 Contributing

If you find issues with the API or this testing guide, please:
1. Create an issue in the GitHub repository
2. Include the endpoint, request body, and expected vs actual behavior
3. Tag with `api` or `testing` label
