// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import { useDebouncedState } from "@tanstack/react-pacer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Form, InlineSpinner } from "@vector-im/compound-web";
import { type ChangeEvent, useCallback, useState } from "react";
import { defineMessage, FormattedMessage } from "react-intl";
import * as v from "valibot";

import { authMetadataQuery, clientRegistration } from "@/api/auth";
import { wellKnownQuery } from "@/api/matrix";
import config from "@/config";
import { CLIENT_METADATA, REDIRECT_URI } from "@/constants";
import { useAuthStore } from "@/stores/auth";

const LoginSearchParameters = v.object({
  redirect: v.optional(v.string()),
});

export const Route = createFileRoute("/_auth/login/")({
  validateSearch: LoginSearchParameters,

  staticData: {
    breadcrumb: {
      message: defineMessage({
        id: "pages.login.title",
        description: "Title for the login page",
        defaultMessage: "Login",
      }),
    },
  },

  component: RouteComponent,
});

/**
 * 规范化服务器名称：自动添加 .mvu.cn 后缀
 * 如果输入包含 .mvu.cn，先去除它，然后重新添加
 */
const normalizeServerName = (input: string): string => {
  const trimmed = input.toLowerCase().trim();
  if (!trimmed) return "";
  
  // 如果输入包含 .mvu.cn，先去除它
  let prefix = trimmed;
  if (trimmed.endsWith(".mvu.cn")) {
    prefix = trimmed.slice(0, -7); // 去掉 ".mvu.cn" (7个字符)
  }
  
  // 如果去除后缀后为空，返回空字符串
  if (!prefix) return "";
  
  // 对所有输入都添加 .mvu.cn 后缀
  return `${prefix}.mvu.cn`;
};

/**
 * 从完整域名中提取显示值（去掉 .mvu.cn 后缀）
 */
const getDisplayValue = (fullServerName: string): string => {
  if (!fullServerName) return "";
  
  // 如果以 .mvu.cn 结尾，提取前面的部分
  if (fullServerName.endsWith(".mvu.cn")) {
    return fullServerName.slice(0, -7); // 去掉 ".mvu.cn" (7个字符)
  }
  
  // 否则返回原值
  return fullServerName;
};

function RouteComponent() {
  const { redirect } = Route.useSearch();
  const initialServerName = config.serverName ?? "";
  const [serverNameInput, setServerNameInput] = useState(
    getDisplayValue(initialServerName),
  );
  const [fullServerName, setFullServerName] = useState(
    normalizeServerName(initialServerName),
  );
  const [debouncedServerName, setDebouncedServerName, debouncer] =
    useDebouncedState(
      normalizeServerName(initialServerName),
      {
        wait: 250,
      },
      (state) => ({ isPending: state.isPending }),
    );

  const handleServerNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      let inputValue = event.target.value.trim();
      
      // 如果用户输入了 .mvu.cn，自动去除这部分，只保留前缀
      if (inputValue.toLowerCase().endsWith(".mvu.cn")) {
        inputValue = inputValue.slice(0, -7).trim();
      }
      
      // 更新输入框显示值（只显示前缀）
      setServerNameInput(inputValue);
      
      // 规范化并存储完整域名
      const normalized = normalizeServerName(inputValue);
      setFullServerName(normalized);
      setDebouncedServerName(normalized);
    },
    [setDebouncedServerName],
  );

  const startAuthorizationSession = useAuthStore(
    (store) => store.startAuthorizationSession,
  );

  // Step 1: discovery the server root using the well-known document
  const {
    data: wellKnown,
    isFetching: isWellKnownFetching,
    isError: isWellKnownError,
  } = useQuery({
    ...wellKnownQuery(debouncedServerName),
    enabled: !!debouncedServerName.trim(),
    retry: false,
  });
  const synapseRoot = wellKnown?.["m.homeserver"].base_url;

  // Step 2: discover the auth metadata
  const {
    data: authMetadata,
    isFetching: isAuthMetadataFetching,
    isError: isAuthMetadataError,
  } = useQuery({
    ...authMetadataQuery(synapseRoot || ""),
    enabled: !!synapseRoot,
    retry: false,
  });

  // Step 3: register the client against the server
  const {
    data: clientMetadata,
    isFetching: isClientMetadataFetching,
    isError: isClientMetadataError,
  } = useQuery({
    queryKey: ["clientRegistration", authMetadata?.registration_endpoint],
    queryFn: ({ signal }) =>
      clientRegistration(
        authMetadata?.registration_endpoint || "",
        CLIENT_METADATA,
        signal,
      ),
    enabled: !!authMetadata?.registration_endpoint,
    retry: false,
  });

  const { mutate: startAuthorization } = useMutation({
    mutationFn: async (variables: {
      serverName: string;
      authorizationEndpoint: string;
      clientId: string;
      redirect: string | undefined;
    }) => {
      const session = await startAuthorizationSession(
        variables.serverName,
        variables.clientId,
        variables.redirect,
      );

      const parameters = new URLSearchParams({
        response_type: "code",
        client_id: variables.clientId,
        redirect_uri: REDIRECT_URI,
        scope:
          "urn:matrix:org.matrix.msc2967.client:api:* urn:mas:admin urn:synapse:admin:*",
        state: session.state,
        code_challenge: session.codeChallenge,
        code_challenge_method: "S256",
      });

      const url = new URL(variables.authorizationEndpoint);
      url.search = parameters.toString();
      globalThis.window.location.href = url.toString();
    },
  });

  // Create authorize URL if we have all the data
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      if (!debouncedServerName.trim() || !authMetadata || !clientMetadata) {
        return;
      }

      startAuthorization({
        serverName: debouncedServerName,
        authorizationEndpoint: authMetadata.authorization_endpoint,
        clientId: clientMetadata.client_id,
        redirect,
      });
    },
    [
      debouncedServerName,
      authMetadata,
      clientMetadata,
      startAuthorization,
      redirect,
    ],
  );

  const isError =
    isWellKnownError || isAuthMetadataError || isClientMetadataError;
  const isLoading =
    (isWellKnownFetching ||
      isAuthMetadataFetching ||
      isClientMetadataFetching ||
      debouncer.state.isPending) &&
    serverNameInput !== "";
  const isReady = !!clientMetadata && !debouncer.state.isPending;

  return (
    <Form.Root onSubmit={onSubmit}>
      <Form.Field name="serverName" serverInvalid={isError}>
        <Form.Label>
          <FormattedMessage
            id="pages.login.server_name"
            description="Label for the server name field"
            defaultMessage="Server name"
          />
        </Form.Label>
        <Form.TextControl
          value={serverNameInput}
          readOnly={config.serverName !== null}
          onChange={handleServerNameChange}
          autoCapitalize="none"
          type="text"
          size={1}
        />
        {isWellKnownError && (
          <Form.ErrorMessage>
            <FormattedMessage
              id="pages.login.errors.no_well_known"
              defaultMessage="Failed to load the server's well-known document. The server name may be invalid."
              description="Error message on the login page when we couldn't fetch the well-known document at https://{serverName}/.well-known/matrix/client"
            />
          </Form.ErrorMessage>
        )}
        {isAuthMetadataError && (
          <Form.ErrorMessage>
            <FormattedMessage
              id="pages.login.errors.no_auth_metadata"
              defaultMessage="Failed to load the server's auth metadata. Synapse may be unreachable or not configured to use 幕屋后台管理系统."
              description="Error message on the login page when we couldn't fetch the auth metadata, indicating that either Synapse is down, or not configured to use MAS"
            />
          </Form.ErrorMessage>
        )}
        {isClientMetadataError && (
          <Form.ErrorMessage>
            <FormattedMessage
              id="pages.login.errors.no_client_metadata"
              defaultMessage="Failed to register the client. 幕屋后台管理系统 may be unreachable or misconfigured."
              description="Error message on the login page when we couldn't register the client against the auth metadata, indicating that either MAS is down, or refusing the client registration for some reason"
            />
          </Form.ErrorMessage>
        )}
      </Form.Field>

      <Form.Submit disabled={!isReady}>
        {isLoading && <InlineSpinner />}
        <FormattedMessage
          id="pages.login.get_started"
          defaultMessage="Get started"
          description="On the login page, this starts the authorization process"
        />
      </Form.Submit>
    </Form.Root>
  );
}
