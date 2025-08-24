# ---- build stage (optional if TS) ----
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# If you have TypeScript, uncomment the next stage lines:
# COPY tsconfig.json ./
# COPY src ./src
# RUN yarn build

# ---- runtime ----
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app

# copy dep tree
COPY --from=deps /app/node_modules ./node_modules
# copy app sources
COPY . .

# If your backend has a build step, do it here (otherwise remove):
# RUN yarn build

EXPOSE 8082
CMD ["npm","start"]
