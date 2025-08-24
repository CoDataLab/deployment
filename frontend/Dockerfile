# ---- build Vite app ----
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .


RUN yarn build

# ---- nginx to serve + reverse proxy ----
FROM nginx:1.27-alpine

# initial config = HTTP only (80). We'll swap to SSL config after issuing cert.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Vite build output (usually "dist")
COPY --from=build /app/dist /usr/share/nginx/html

# share webroot with certbot for http-01 challenges
RUN mkdir -p /var/www/certbot
# Do not bake certs in image; mount them from volumes
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
