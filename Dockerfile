# Build process
# 1. Install dependencies in temporary container
# 2. Compile front-end in temporary container
# 3. Copy compiled frontend into production container
# 4. Install production dependnecies
# 5. Run service

# TODO: Check that secrets aren't included in container
# TODO: Allow configuring frontend root via ENV
# TODO: make docker compose file too

FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run client:build


# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
