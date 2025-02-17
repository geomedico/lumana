FROM node:20-bullseye AS service-a

# Ensure Corepack is fully updated
RUN npm install -g corepack@latest

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
