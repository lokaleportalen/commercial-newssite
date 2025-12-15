import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface WelcomeEmailProps {
  userName: string;
  preferencesUrl: string;
  articlesUrl: string;
  unsubscribeUrl: string;
  // Optional content overrides from database
  heading?: string;
  greeting?: string;
  introParagraph?: string;
  descriptionParagraph?: string;
  primaryCtaText?: string;
  preferencesInfoParagraph?: string;
  secondaryCtaText?: string;
  closingText?: string;
  signatureText?: string;
}

export const WelcomeEmail = ({
  userName = "Bruger",
  preferencesUrl,
  articlesUrl,
  unsubscribeUrl,
  heading = "Velkommen til Estatenews.dk!",
  greeting = "Hej {userName},",
  introParagraph = "Tak fordi du tilmeldte dig Estatenews.dk. Vi er glade for at have dig med i vores fællesskab af erhvervsejendomsinteresserede.",
  descriptionParagraph = "Du vil modtage ugentlige nyheder om den danske erhvervsejendomsbranche - alt fra nye projekter og transaktioner til markedstendenser og analyser.",
  primaryCtaText = "Læs de nyeste artikler",
  preferencesInfoParagraph = "Du kan til enhver tid tilpasse dine præferencer og vælge hvilke kategorier du ønsker at modtage nyheder om.",
  secondaryCtaText = "Administrer præferencer",
  closingText = "Vi glæder os til at holde dig opdateret!",
  signatureText = "Estatenews.dk teamet",
}: WelcomeEmailProps) => {
  // Replace template variables in text
  const replaceVariables = (text: string) => {
    return text.replace(/{userName}/g, userName);
  };

  return (
    <EmailLayout
      preview="Velkommen til Estatenews.dk - Din kilde til erhvervsejendomsnyheder"
      preferencesUrl={preferencesUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading className="text-3xl font-bold text-gray-900 mt-8 mb-6 leading-tight">
        {heading}
      </Heading>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {replaceVariables(greeting)}
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {introParagraph}
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {descriptionParagraph}
      </Text>

      <Button
        className="py-3.5 px-6 bg-primary rounded-md text-white text-base font-semibold no-underline text-center block my-6"
        href={articlesUrl}
      >
        {primaryCtaText}
      </Button>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {preferencesInfoParagraph}
      </Text>

      <Button
        className="py-3.5 px-6 bg-white border-2 border-primary rounded-md text-primary text-base font-semibold no-underline text-center block my-6"
        href={preferencesUrl}
      >
        {secondaryCtaText}
      </Button>

      <Text className="text-base text-gray-700 my-8 leading-relaxed">
        {closingText}
        <br />
        <span className="font-semibold">{signatureText}</span>
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
