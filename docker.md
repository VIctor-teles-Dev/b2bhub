# Plano de deploy do projeto b2bhub

## Objective 
Now we need to create a dockerfile, .dockerignore and a docker-compose.yml to deploy the project b2bhub.
## Context
we're using bun and next.js so, we gonna use the bun image to create the dockerfile.

## how?
1. Create a Dockerfile
    - Using the bun image "oven/bun:1" as base image. u should pull it from 
    dockerhub. research what version ll be the best to use.
    - Copy the package.json and package-lock.json to the container
    - Install the dependencies
    - Copy the rest of the files to the container
    - Expose the port
    - Set the command to run the a

### Dockerfile
```dockerfile
# use Debian as base to allow manual Bun installation (fixes SIGILL/Illegal Instruction on some CPUs)
FROM debian:bookworm-slim AS base
WORKDIR /usr/src/app

# Install dependencies for Bun
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Install Bun Baseline
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.4" --baseline

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Install Playwright browsers
RUN bunx playwright install --with-deps chromium

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static
COPY --from=prerelease /usr/src/app/public ./public

# Setup user and permissions
RUN groupadd -r bun && useradd -r -g bun -m -d /home/bun -s /bin/bash bun
RUN chown -R bun:bun /usr/src/app

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.js" ]
```

### Why Debian + Baseline?
The official `oven/bun` image is compiled with AVX2 instructions enabled by default. On some hosts (older CPUs or certain VMs), this causes a `SIGILL` (Illegal Instruction) crash. We use `debian:bookworm-slim` and manually install the **baseline** version of Bun to ensure compatibility.
You should analyze the dockerfile and make the necessary changes to make it work.

2. Create a .dockerignore

```dockerignore
node_modules
Dockerfile*
docker-compose*
.dockerignore
.git
.gitignore
README.md
LICENSE
.vscode
Makefile
helm-charts
.env
.editorconfig
.idea
coverage*
``` 

3. Create a docker-compose.yml
- analize the project, the dockerfile and the dockerignore to create that file