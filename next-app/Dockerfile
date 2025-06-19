FROM node:20.11-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app


# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
# Omit --production flag for TypeScript devDependencies
RUN npm ci

COPY src ./src
COPY public ./public
COPY private ./private
COPY next.config.js .
COPY tsconfig.json .

# Environment variables must be present at build time
ARG NEXT_PUBLIC_PUBLIC_URL
ENV NEXT_PUBLIC_PUBLIC_URL=${NEXT_PUBLIC_PUBLIC_URL}

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Next.js collects completely anonymous telemetry data about general usage
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js based on the preferred package manager
RUN npm run build

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs  /app/public ./public
COPY --from=builder --chown=nextjs:nodejs  /app/private ./private

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG NEXT_PUBLIC_PUBLIC_URL
ENV NEXT_PUBLIC_PUBLIC_URL=${NEXT_PUBLIC_PUBLIC_URL}

ENV NEXT_TELEMETRY_DISABLED=1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]
