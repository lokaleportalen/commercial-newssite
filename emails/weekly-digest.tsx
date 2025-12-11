import {
  Button,
  Heading,
  Text,
  Img,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

// Email-specific Article type (used in email templates)
interface EmailArticle {
  id: string;
  title: string;
  summary: string;
  slug: string;
  image?: string;
  categoryName: string;
}

interface WeeklyDigestProps {
  userName: string;
  articles: EmailArticle[];
  baseUrl: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  weekStart: string;
  weekEnd: string;
  // Optional content overrides from database
  heading?: string;
  greeting?: string;
  introParagraph?: string;
  noArticlesMessage?: string;
  articleCtaText?: string;
  footerText?: string;
  finalCtaText?: string;
}

export const WeeklyDigest = ({
  userName = "Bruger",
  articles = [],
  baseUrl,
  preferencesUrl,
  unsubscribeUrl,
  weekStart,
  weekEnd,
  heading = "Ugens nyheder om erhvervsejendomme",
  greeting = "Hej {userName},",
  introParagraph = "Her er ugens vigtigste nyheder inden for den danske erhvervsejendomsbranche ({weekStart} - {weekEnd}):",
  noArticlesMessage = "Der er ingen nye artikler i denne uge, der matcher dine præferencer.",
  articleCtaText = "Læs mere",
  footerText = "Du modtager denne ugentlige oversigt baseret på dine præferencer. Du kan til enhver tid ændre dine indstillinger eller afmelde dig.",
  finalCtaText = "Se alle artikler på Estate News",
}: WeeklyDigestProps) => {
  // Replace template variables in text
  const replaceVariables = (text: string) => {
    return text
      .replace(/{userName}/g, userName)
      .replace(/{weekStart}/g, weekStart)
      .replace(/{weekEnd}/g, weekEnd);
  };
  return (
    <EmailLayout
      preview={`Ugens erhvervsejendomsnyheder (${weekStart} - ${weekEnd})`}
      preferencesUrl={preferencesUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-6 leading-tight break-words">
        {heading}
      </Heading>

      <Text className="text-base text-gray-700 my-4 leading-relaxed break-words">
        {replaceVariables(greeting)}
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed break-words">
        {replaceVariables(introParagraph)}
      </Text>

      {articles.length === 0 ? (
        <Text className="text-base text-gray-500 my-8 text-center italic">
          {noArticlesMessage}
        </Text>
      ) : (
        articles.map((article, index) => (
          <React.Fragment key={article.id}>
            {index > 0 && <Hr className="border-gray-200 my-8" />}
            <Section className="my-8">
              <Text className="inline-block bg-orange-50 text-primary text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded mb-3 mt-0 break-words">
                {article.categoryName}
              </Text>

              <Heading className="text-lg sm:text-[22px] font-bold text-gray-900 mt-2 mb-4 leading-snug break-words">
                {article.title}
              </Heading>

              {article.image && (
                <Img
                  src={article.image}
                  alt={article.title}
                  className="w-full max-w-full h-auto rounded-lg my-4"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}

              <Text className="text-sm sm:text-[15px] text-gray-700 my-4 leading-relaxed break-words">
                {article.summary}
              </Text>

              <Button
                className="py-3 px-6 bg-primary rounded-md text-white text-sm font-semibold no-underline text-center inline-block mt-4 mb-0 break-words"
                href={`${baseUrl}/artikler/${article.slug}`}
              >
                {articleCtaText}
              </Button>
            </Section>
          </React.Fragment>
        ))
      )}

      <Hr className="border-gray-200 my-10" />

      <Text className="text-sm text-gray-500 my-6 text-center leading-relaxed break-words">
        {footerText}
      </Text>

      <Button
        className="py-3.5 px-4 sm:px-6 bg-white border-2 border-primary rounded-md text-primary text-sm sm:text-base font-semibold no-underline text-center block my-8 break-words"
        href={`${baseUrl}/artikler`}
      >
        {finalCtaText}
      </Button>
    </EmailLayout>
  );
};

export default WeeklyDigest;
