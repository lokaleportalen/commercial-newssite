import nodemailer from "nodemailer";

// Initialize SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.eu.mailgun.org",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "nyheder@lokaleportalen.dk";
const FROM_NAME = process.env.FROM_NAME || "Nyheder";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Mailgun
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn(
        "SMTP not configured. Email would be sent to:",
        to,
        "Subject:",
        subject
      );
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html), // Fallback to stripped HTML if no text provided
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email with verification link
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${verificationToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Velkommen til Nyheder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Velkommen til Nyheder</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">Hej ${name},</p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                Tak fordi du tilmeldte dig Nyheder - din kilde til de seneste nyheder om dansk erhvervsejendomme.
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 24px;">
                For at komme i gang skal du bekræfte din e-mailadresse ved at klikke på knappen nedenfor:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Bekræft e-mailadresse
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Hvis knappen ikke virker, kan du kopiere og indsætte dette link i din browser:
              </p>
              <p style="margin: 10px 0 0; color: #f97316; font-size: 14px; line-height: 20px; word-break: break-all;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                Dette link udløber om 24 timer af sikkerhedsmæssige årsager.
              </p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                © ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Velkommen til Nyheder

Hej ${name},

Tak fordi du tilmeldte dig Nyheder - din kilde til de seneste nyheder om dansk erhvervsejendomme.

For at komme i gang skal du bekræfte din e-mailadresse ved at besøge dette link:
${verificationUrl}

Dette link udløber om 24 timer af sikkerhedsmæssige årsager.

© ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
  `;

  return sendEmail({
    to: email,
    subject: "Velkommen til Nyheder - Bekræft din e-mailadresse",
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nulstil din adgangskode</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Nulstil adgangskode</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">Hej ${name},</p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                Vi har modtaget en anmodning om at nulstille adgangskoden til din Nyheder-konto.
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 24px;">
                Klik på knappen nedenfor for at oprette en ny adgangskode:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Nulstil adgangskode
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Hvis knappen ikke virker, kan du kopiere og indsætte dette link i din browser:
              </p>
              <p style="margin: 10px 0 0; color: #f97316; font-size: 14px; line-height: 20px; word-break: break-all;">
                ${resetUrl}
              </p>

              <div style="margin: 30px 0 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px; font-weight: 600;">
                  Sikkerhedsnotat
                </p>
                <p style="margin: 10px 0 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  Hvis du ikke har anmodet om at nulstille din adgangskode, kan du ignorere denne e-mail. Din konto forbliver sikker.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                Dette link udløber om 1 time af sikkerhedsmæssige årsager.
              </p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                © ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Nulstil adgangskode

Hej ${name},

Vi har modtaget en anmodning om at nulstille adgangskoden til din Nyheder-konto.

Besøg dette link for at oprette en ny adgangskode:
${resetUrl}

Hvis du ikke har anmodet om at nulstille din adgangskode, kan du ignorere denne e-mail. Din konto forbliver sikker.

Dette link udløber om 1 time af sikkerhedsmæssige årsager.

© ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
  `;

  return sendEmail({
    to: email,
    subject: "Nulstil din adgangskode - Nyheder",
    html,
    text,
  });
}

/**
 * Send daily news digest email
 */
export async function sendDailyDigestEmail(
  email: string,
  name: string,
  articles: Array<{
    id: string;
    title: string;
    summary: string | null;
    slug: string;
    categories: string | null;
    publishedDate: Date | null;
  }>
) {
  if (articles.length === 0) {
    return { success: true }; // Don't send empty digests
  }

  const articlesHtml = articles
    .map(
      (article) => `
    <tr>
      <td style="padding: 30px 0; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 700; line-height: 28px;">
          <a href="${BASE_URL}/articles/${
        article.slug
      }" style="color: #111827; text-decoration: none;">
            ${article.title}
          </a>
        </h2>

        ${
          article.summary
            ? `
        <p style="margin: 0 0 15px; color: #6b7280; font-size: 15px; line-height: 22px;">
          ${article.summary}
        </p>
        `
            : ""
        }

        <div style="margin: 15px 0 0;">
          <a href="${BASE_URL}/articles/${
        article.slug
      }" style="display: inline-block; color: #f97316; font-size: 14px; font-weight: 600; text-decoration: none;">
            Læs mere →
          </a>
        </div>

        ${
          article.categories
            ? `
        <div style="margin: 15px 0 0;">
          ${article.categories
            .split(",")
            .map(
              (cat) => `
            <span style="display: inline-block; margin: 0 8px 8px 0; padding: 4px 12px; background-color: #fff7ed; color: #c2410c; font-size: 12px; font-weight: 500; border-radius: 12px;">
              ${cat.trim()}
            </span>
          `
            )
            .join("")}
        </div>
        `
            : ""
        }
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dit daglige nyhedsoverblik</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📰 Dit daglige nyhedsoverblik</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                ${new Date().toLocaleDateString("da-DK", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 24px;">
                Hej ${name},
              </p>
              <p style="margin: 15px 0 0; color: #374151; font-size: 16px; line-height: 24px;">
                Her er dagens seneste nyheder om dansk erhvervsejendomme:
              </p>
            </td>
          </tr>

          <!-- Articles -->
          ${articlesHtml}

          <!-- View All CTA -->
          <tr>
            <td style="padding: 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${BASE_URL}" style="display: inline-block; padding: 16px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Se alle nyheder
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                Du modtager denne e-mail fordi du er tilmeldt daglige nyheder fra Nyheder.
              </p>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                <a href="${BASE_URL}/preferences" style="color: #f97316; text-decoration: none;">Administrer præferencer</a>
                •
                <a href="${BASE_URL}/api/user/preferences/unsubscribe" style="color: #f97316; text-decoration: none;">Afmeld</a>
              </p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                © ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Dit daglige nyhedsoverblik
${new Date().toLocaleDateString("da-DK", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}

Hej ${name},

Her er dagens seneste nyheder om dansk erhvervsejendomme:

${articles
  .map(
    (article, index) => `
${index + 1}. ${article.title}

${article.summary || ""}

Læs mere: ${BASE_URL}/articles/${article.slug}
${article.categories ? `Kategorier: ${article.categories}` : ""}
`
  )
  .join("\n---\n")}

Se alle nyheder: ${BASE_URL}

---

Du modtager denne e-mail fordi du er tilmeldt daglige nyheder fra Nyheder.
Administrer præferencer: ${BASE_URL}/preferences
Afmeld: ${BASE_URL}/api/user/preferences/unsubscribe

© ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
  `;

  return sendEmail({
    to: email,
    subject: `📰 Dit daglige nyhedsoverblik - ${new Date().toLocaleDateString(
      "da-DK",
      { day: "numeric", month: "long" }
    )}`,
    html,
    text,
  });
}

/**
 * Send immediate notification for new article matching preferences
 */
export async function sendImmediateNotificationEmail(
  email: string,
  name: string,
  article: {
    id: string;
    title: string;
    summary: string | null;
    slug: string;
    categories: string | null;
    publishedDate: Date | null;
  }
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ny artikel: ${article.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">⚡ Ny artikel udgivet</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 24px;">
                Hej ${name},
              </p>

              <h2 style="margin: 0 0 15px; color: #111827; font-size: 24px; font-weight: 700; line-height: 32px;">
                ${article.title}
              </h2>

              ${
                article.summary
                  ? `
              <p style="margin: 0 0 25px; color: #6b7280; font-size: 16px; line-height: 24px;">
                ${article.summary}
              </p>
              `
                  : ""
              }

              ${
                article.categories
                  ? `
              <div style="margin: 0 0 25px;">
                ${article.categories
                  .split(",")
                  .map(
                    (cat) => `
                  <span style="display: inline-block; margin: 0 8px 8px 0; padding: 6px 14px; background-color: #fff7ed; color: #c2410c; font-size: 13px; font-weight: 500; border-radius: 12px;">
                    ${cat.trim()}
                  </span>
                `
                  )
                  .join("")}
              </div>
              `
                  : ""
              }

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${BASE_URL}/articles/${
    article.slug
  }" style="display: inline-block; padding: 16px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Læs artikel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                Du modtager øjeblikkelige notifikationer fra Nyheder.
              </p>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                <a href="${BASE_URL}/preferences" style="color: #f97316; text-decoration: none;">Skift til daglig sammenfatning</a>
                •
                <a href="${BASE_URL}/api/user/preferences/unsubscribe" style="color: #f97316; text-decoration: none;">Afmeld</a>
              </p>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                © ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Ny artikel udgivet

Hej ${name},

${article.title}

${article.summary || ""}

${article.categories ? `Kategorier: ${article.categories}` : ""}

Læs artikel: ${BASE_URL}/articles/${article.slug}

---

Du modtager øjeblikkelige notifikationer fra Nyheder.
Skift til daglig sammenfatning: ${BASE_URL}/preferences
Afmeld: ${BASE_URL}/api/user/preferences/unsubscribe

© ${new Date().getFullYear()} Nyheder - En del af Lokaleportalen.dk
  `;

  return sendEmail({
    to: email,
    subject: `⚡ Ny artikel: ${article.title}`,
    html,
    text,
  });
}

/**
 * Simple HTML stripper for fallback text content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, "")
    .replace(/<script[^>]*>.*<\/script>/gm, "")
    .replace(/<[^>]+>/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
