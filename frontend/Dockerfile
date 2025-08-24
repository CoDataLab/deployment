FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
# Build the React app
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Set permissions
RUN chmod -R 755 /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]