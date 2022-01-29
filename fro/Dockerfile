# Three stages: install dependencies, build production, and serve.

FROM node:17-alpine3.15 AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

FROM node:17-alpine3.15 AS build

WORKDIR /app

# My question is, does the earlier "COPY ." command understand that
# the later node_modules folder would be copied from deps?

# The answer: No, I inspect the container and I see node_modules!
# It seems to be that this command is supposed to work even without
# The host computer running node_modules itself.
COPY . ./
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build

FROM node:17-alpine3.15 AS run

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
