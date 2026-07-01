FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY prisma/ ./prisma/
RUN pnpm install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/
RUN npx prisma generate
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
