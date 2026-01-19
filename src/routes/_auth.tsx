// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Text } from "@vector-im/compound-web";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";

import * as Footer from "@/components/footer";
import { WelcomeLayout } from "@/components/layout";
import logoImage from "@/icons/Logo.png";
import { useAuthStore } from "@/stores/auth";

const welcomeMessage = defineMessage({
  id: "pages.landing.description",
  defaultMessage:
    "幕屋后台管理系统",
  description: "On the landing pages, explains what the app does",
});

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const state = useAuthStore.getState();
    if (state.credentials) {
      throw redirect({ to: "/" });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  const intl = useIntl();
  return (
    <>
      <meta name="description" content={intl.formatMessage(welcomeMessage)} />
      <WelcomeLayout className="gap-10 py-10 items-center justify-center">
        <main className="flex flex-col flex-1 gap-12 items-stretch justify-center max-w-[340px]">
          {/* Logo & message */}
          <div className="flex flex-col gap-6 items-center text-center">
            <img
              src={logoImage}
              alt={intl.formatMessage({
                id: "product.title",
                defaultMessage: "幕屋后台管理系统",
                description: "The main name of the admin console",
              })}
              className="max-w-full h-auto"
            />

            <Text size="lg" className="text-black font-bold text-[30px]">
              <FormattedMessage {...welcomeMessage} />
            </Text>
          </div>

          <div>
            <Outlet />
          </div>
        </main>

        <Footer.Root>
          <Footer.Section>
            <Footer.CopyrightNotice />
          </Footer.Section>
        </Footer.Root>
      </WelcomeLayout>
    </>
  );
}
