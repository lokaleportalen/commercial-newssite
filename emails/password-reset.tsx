import { Button, Heading, Text, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface PasswordResetProps {
  userName: string;
  resetUrl: string;
  expirationMinutes?: number;
  // Optional content overrides from database
  heading?: string;
  greeting?: string;
  requestParagraph?: string;
  instructionsParagraph?: string;
  primaryCtaText?: string;
  warningHeading?: string;
  warningText?: string;
  linkFallbackText?: string;
  closingText?: string;
  signatureText?: string;
}

export const PasswordReset = ({
  userName = "Bruger",
  resetUrl,
  expirationMinutes = 60,
  heading = "Nulstil din adgangskode",
  greeting = "Hej {userName},",
  requestParagraph = "Vi har modtaget en anmodning om at nulstille adgangskoden til din Estatenews.dk konto.",
  instructionsParagraph = "Klik på knappen nedenfor for at nulstille din adgangskode. Dette link er kun gyldigt i {expirationMinutes} minutter af sikkerhedsmæssige årsager.",
  primaryCtaText = "Nulstil adgangskode",
  warningHeading = "Har du ikke anmodet om dette?",
  warningText = "Hvis du ikke har anmodet om at nulstille din adgangskode, kan du trygt ignorere denne email. Din adgangskode vil forblive uændret.",
  linkFallbackText = "Hvis knappen ikke virker, kan du kopiere og indsætte følgende link i din browser:",
  closingText = "Med venlig hilsen,",
  signatureText = "Estatenews.dk teamet",
}: PasswordResetProps) => {
  // Replace template variables in text
  const replaceVariables = (text: string) => {
    return text
      .replace(/{userName}/g, userName)
      .replace(/{expirationMinutes}/g, expirationMinutes.toString());
  };
  return (
    <EmailLayout preview="Nulstil din adgangskode til Estatenews.dk">
      <Heading className="text-3xl font-bold text-gray-900 mt-8 mb-6 leading-tight">
        {heading}
      </Heading>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {replaceVariables(greeting)}
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {requestParagraph}
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        {replaceVariables(instructionsParagraph)}
      </Text>

      <Button
        className="py-3.5 px-6 bg-primary rounded-md text-white text-base font-semibold no-underline text-center block my-8"
        href={resetUrl}
      >
        {primaryCtaText}
      </Button>

      <Section className="bg-orange-50 border border-orange-200 rounded-md p-4 my-8">
        <Text className="text-sm text-gray-700 leading-relaxed m-0">
          <span className="font-semibold">{warningHeading}</span>
          <br />
          {warningText}
        </Text>
      </Section>

      <Text className="text-[13px] text-gray-500 my-8 leading-relaxed break-all">
        {linkFallbackText}
        <br />
        <span className="text-primary">{resetUrl}</span>
      </Text>

      <Text className="text-base text-gray-700 my-8 leading-relaxed">
        {closingText}
        <br />
        <span className="font-semibold">{signatureText}</span>
      </Text>
    </EmailLayout>
  );
};

export default PasswordReset;
