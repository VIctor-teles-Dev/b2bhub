# Use Debian as base to allow manual Bun installation
FROM debian:bookworm-slim AS base
WORKDIR /usr/src/app

# Install dependencies for Bun and common tools
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Install Bun Baseline (compatible with older CPUs / Docker environments)
# We use a specific version to ensure stability, or "latest"
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.4" --baseline

# Prepare dev dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile 

# Prepare prod dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Prerelease stage: Build the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Install Node.js for the build step (Turbopack has compatibility issues with Bun)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Playwright browsers and dependencies
RUN npx playwright install --with-deps chromium

ENV NODE_ENV=production
# Use Node.js for build (Turbopack+Bun causes ChunkLoadError)
RUN npm run build

# Release stage
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static
COPY --from=prerelease /usr/src/app/public ./public

# Copy Playwright browsers cache from prerelease
COPY --from=prerelease /root/.cache/ms-playwright /root/.cache/ms-playwright
# Also copy to bun user home if we switch user, but we are root in debian by default unless we add user.
# Let's run as a non-root user for security, similar to original dockerfile

# Create bun user since debian doesn't have it by default
RUN groupadd -r bun && useradd -r -g bun -m -d /home/bun -s /bin/bash bun

# Copy playwright cache to bun user location
RUN mkdir -p /home/bun/.cache/ms-playwright && \
    cp -r /root/.cache/ms-playwright/* /home/bun/.cache/ms-playwright/ && \
    chown -R bun:bun /home/bun/.cache

# Install system dependencies for Chromium (again, because this is a clean stage from base)
RUN apt-get update && apt-get install -y libglib2.0-0 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxcb1 libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 && rm -rf /var/lib/apt/lists/*

# Set permissions
RUN chown -R bun:bun /usr/src/app

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.js" ]
