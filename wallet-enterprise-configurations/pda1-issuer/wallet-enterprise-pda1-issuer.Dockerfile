# Builder stage
FROM node:16-bullseye-slim AS builder
WORKDIR /app


COPY wallet-enterprise/ .
RUN rm -rf src/configuration/
COPY ./wallet-enterprise-configurations/pda1-issuer/src/configuration/ src/configuration/
COPY ./wallet-enterprise-configurations/pda1-issuer/public/styles/styles.css public/styles/styles.css
COPY ./wallet-enterprise-configurations/pda1-issuer/views/index.pug views/index.pug
COPY ./wallet-enterprise-configurations/pda1-issuer/views/header.pug views/header.pug

RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install && yarn build

# Production stage
FROM node:16-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/.npmrc .
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/views/ ./views/
COPY ./wallet-enterprise-configurations/pda1-issuer/datasets/ /datasets/


RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install --production

ENV NODE_ENV production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]