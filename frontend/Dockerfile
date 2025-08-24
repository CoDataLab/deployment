# ===== Build Stage =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application source code
COPY . .


ENV VITE_HOST_API=/api
RUN yarn build

# ===== Production Stage =====
FROM nginx:stable-alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx will automatically serve the index.html file from this directory
# Expose port 80
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]