import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

export const EmailLayout = ({
  preview,
  children,
  unsubscribeUrl,
  preferencesUrl,
}: EmailLayoutProps) => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#E87722",
                "primary-foreground": "#ffffff",
              },
            },
          },
        }}
      >
        <Head>
          <Preview>{preview}</Preview>
        </Head>
        <Body className="bg-gray-50 m-auto font-sans">
          <Container className="mb-16 mx-auto p-0 max-w-[600px] bg-white">
            {/* Header */}
            <Section className="bg-primary p-4 sm:p-8 rounded-t-lg">
              <Text className="text-2xl sm:text-3xl font-bold text-white text-center m-0 tracking-tight">
                Estate News
              </Text>
            </Section>

            {/* Content */}
            <Section className="px-4 sm:px-10 py-6">{children}</Section>

            {/* Footer */}
            {(preferencesUrl || unsubscribeUrl) && (
              <>
                <Hr className="border-gray-200 my-5" />
                <Section className="px-4 sm:px-10 pb-6">
                  <Text className="text-[11px] text-gray-400 text-center m-2 break-words">
                    {preferencesUrl && (
                      <>
                        <Link
                          href={preferencesUrl}
                          className="text-gray-400 no-underline hover:text-gray-600"
                        >
                          Skift emailindstillinger
                        </Link>
                        {unsubscribeUrl && " • "}
                      </>
                    )}
                    {unsubscribeUrl && (
                      <Link
                        href={unsubscribeUrl}
                        className="text-gray-400 no-underline hover:text-gray-600"
                      >
                        Afmeld alle emails
                      </Link>
                    )}
                  </Text>
                  <Text className="text-[11px] text-gray-400 text-center mt-4 mb-0">
                    © {new Date().getFullYear()} Estate News. Alle rettigheder
                    forbeholdes.
                  </Text>
                </Section>
              </>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
