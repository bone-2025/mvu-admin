# syntax=docker/dockerfile:1.4

# SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
#
# SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

FROM --platform=$BUILDPLATFORM docker.io/library/node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build
# Compress static assets for better performance
RUN find /app/dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" -o -name "*.woff" -o -name "*.woff2" \) ! -name "*.gz" -exec gzip -k {} \;
RUN ln -s /tmp/index.runtime.html dist/

FROM ghcr.io/nginx/nginx-unprivileged:1.29.3-alpine-slim

COPY --from=builder /app/dist /dist
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/replace-config.sh /docker-entrypoint.d/replace-config.sh

EXPOSE 8080
