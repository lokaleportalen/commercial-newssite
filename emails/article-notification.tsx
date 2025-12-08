import {
  Button,
  Heading,
  Text,
  Img,
  Section,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface ArticleNotificationProps {
  articleTitle: string;
  articleSummary: string;
  articleUrl: string;
  articleImage?: string;
  categoryName: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
}

export const ArticleNotification = ({
  articleTitle = "Ny artikel titel",
  articleSummary = "Dette er et resumé af artiklen...",
  articleUrl,
  articleImage,
  categoryName = "Erhvervsejendomme",
  preferencesUrl,
  unsubscribeUrl,
}: ArticleNotificationProps) => {
  return (
    <EmailLayout
      preview={`Ny artikel: ${articleTitle}`}
      preferencesUrl={preferencesUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section className="mt-6 mb-2">
        <Text className="inline-block bg-orange-50 text-primary text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded m-0">
          {categoryName}
        </Text>
      </Section>

      <Heading className="text-[32px] font-bold text-gray-900 mt-4 mb-6 leading-tight">
        {articleTitle}
      </Heading>

      {articleImage && (
        <Img
          src={articleImage}
          alt={articleTitle}
          className="w-full h-auto rounded-lg my-6"
        />
      )}

      <Text className="text-lg text-gray-700 my-6 leading-relaxed">
        {articleSummary}
      </Text>

      <Button
        className="py-3.5 px-6 bg-primary rounded-md text-white text-base font-semibold no-underline text-center block my-6"
        href={articleUrl}
      >
        Læs hele artiklen
      </Button>

      <Text className="text-sm text-gray-500 mt-8 mb-0 leading-relaxed italic">
        Du modtager denne email, fordi du har valgt at modtage nye artikler med
        det samme.
      </Text>
    </EmailLayout>
  );
};

export default ArticleNotification;
