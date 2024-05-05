FROM oven/bun:1 as base
  WORKDIR /usr/src/app

FROM base AS install-dev
  RUN mkdir -p /temp/dev
  COPY package.json bun.lockb /temp/dev/
  RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS install-production
  RUN mkdir -p /temp/production
  COPY package.json bun.lockb /temp/production/
  RUN cd /temp/production && bun install --frozen-lockfile --production

FROM base AS prerelease
  COPY --from=install-dev /temp/dev/node_modules node_modules
  COPY . .
  ENV NODE_ENV=production
  # Might be good idea to bundle backend into single file, but this doesn't seem to work for some reason
  # RUN bun build --target=bun server/index.ts --outdir ./server/dist
  RUN bun run client:build

FROM base AS release
  ENV NODE_ENV=production
  ENV KATUKO_FRONTEND_FILES_PATH=./client

  COPY --from=install-production /temp/production/node_modules node_modules
  COPY --from=prerelease /usr/src/app/package.json .
  COPY --from=prerelease /usr/src/app/drizzle.config.ts .
  COPY --from=prerelease /usr/src/app/entrypoint.sh .
  COPY --from=prerelease /usr/src/app/server ./server
  COPY --from=prerelease /usr/src/app/shared ./shared
  COPY --from=prerelease /usr/src/app/client/dist ./client
  
  RUN bun install --frozen-lockfile --production
  RUN chown -R bun:bun /usr/src/app
  RUN chmod 755 /usr/src/app

  USER bun
  EXPOSE 8440/tcp
  ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]
