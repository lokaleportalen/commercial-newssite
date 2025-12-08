import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface WelcomeEmailProps {
  userName: string;
  preferencesUrl: string;
  articlesUrl: string;
  unsubscribeUrl: string;
}

export const WelcomeEmail = ({
  userName = "Bruger",
  preferencesUrl,
  articlesUrl,
  unsubscribeUrl,
}: WelcomeEmailProps) => {
  return (
    <EmailLayout
      preview="Velkommen til Estate News - Din kilde til erhvervsejendomsnyheder"
      preferencesUrl={preferencesUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading className="text-3xl font-bold text-gray-900 mt-8 mb-6 leading-tight">
        Velkommen til Estate News!
      </Heading>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Hej {userName},
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Tak fordi du tilmeldte dig Estate News. Vi er glade for at have dig med
        i vores fællesskab af erhvervsejendomsinteresserede.
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Du vil modtage ugentlige nyheder om den danske erhvervsejendomsbranche
        - alt fra nye projekter og transaktioner til markedstendenser og
        analyser.
      </Text>

      <Button
        className="py-3.5 px-6 bg-primary rounded-md text-white text-base font-semibold no-underline text-center block my-6"
        href={articlesUrl}
      >
        Læs de nyeste artikler
      </Button>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Du kan til enhver tid tilpasse dine præferencer og vælge hvilke
        kategorier du ønsker at modtage nyheder om.
      </Text>

      <Button
        className="py-3.5 px-6 bg-white border-2 border-primary rounded-md text-primary text-base font-semibold no-underline text-center block my-6"
        href={preferencesUrl}
      >
        Administrer præferencer
      </Button>

      <Text className="text-base text-gray-700 my-8 leading-relaxed">
        Vi glæder os til at holde dig opdateret!
        <br />
        <span className="font-semibold">Estate News teamet</span>
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
