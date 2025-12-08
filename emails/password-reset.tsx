import { Button, Heading, Text, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface PasswordResetProps {
  userName: string;
  resetUrl: string;
  expirationMinutes?: number;
}

export const PasswordReset = ({
  userName = "Bruger",
  resetUrl,
  expirationMinutes = 60,
}: PasswordResetProps) => {
  return (
    <EmailLayout preview="Nulstil din adgangskode til Estate News">
      <Heading className="text-3xl font-bold text-gray-900 mt-8 mb-6 leading-tight">
        Nulstil din adgangskode
      </Heading>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Hej {userName},
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Vi har modtaget en anmodning om at nulstille adgangskoden til din
        Estate News konto.
      </Text>

      <Text className="text-base text-gray-700 my-4 leading-relaxed">
        Klik på knappen nedenfor for at nulstille din adgangskode. Dette link
        er kun gyldigt i {expirationMinutes} minutter af sikkerhedsmæssige
        årsager.
      </Text>

      <Button
        className="py-3.5 px-6 bg-primary rounded-md text-white text-base font-semibold no-underline text-center block my-8"
        href={resetUrl}
      >
        Nulstil adgangskode
      </Button>

      <Section className="bg-orange-50 border border-orange-200 rounded-md p-4 my-8">
        <Text className="text-sm text-gray-700 leading-relaxed m-0">
          <span className="font-semibold">Har du ikke anmodet om dette?</span>
          <br />
          Hvis du ikke har anmodet om at nulstille din adgangskode, kan du
          trygt ignorere denne email. Din adgangskode vil forblive uændret.
        </Text>
      </Section>

      <Text className="text-[13px] text-gray-500 my-8 leading-relaxed break-all">
        Hvis knappen ikke virker, kan du kopiere og indsætte følgende link i
        din browser:
        <br />
        <span className="text-primary">{resetUrl}</span>
      </Text>

      <Text className="text-base text-gray-700 my-8 leading-relaxed">
        Med venlig hilsen,
        <br />
        <span className="font-semibold">Estate News teamet</span>
      </Text>
    </EmailLayout>
  );
};

export default PasswordReset;
