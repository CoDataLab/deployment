# Frontend Dockerfile (./frontend/Dockerfile)
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using yarn
RUN npm install -g yarn && yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage - using nginx to serve static files
FROM nginx:1.25-alpine as production

# Copy built files to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Change ownership
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]