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
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
```
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