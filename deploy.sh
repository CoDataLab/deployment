#!/bin/bash
# setup-files.sh - Creates all necessary configuration files

echo "📁 Creating directory structure..."
mkdir -p nginx/conf.d nginx/logs certbot/conf certbot/www backend frontend

echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database Service
  mongodb:
    image: mongo:7.0
    container_name: mern_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: adminpassword123
      MONGO_INITDB_DATABASE: mydb
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    ports:
      - "27017:27017"
    networks:
      - mern_network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/mydb --quiet
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Node.js Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mern_backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=8082
      - MONGODB_URI=mongodb://badisjl99:123951Ba008@mongodb:27017/mydb
      - JWT_SECRET=your-super-secret-jwt-key-here
      - CORS_ORIGIN=https://codatalab.cloud
    ports:
      - "8082:8082"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - mern_network
    volumes:
      - ./backend:/app
      - /app/node_modules
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8082/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # React Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: mern_frontend
    restart: unless-stopped
    environment:
      - VITE_API_URL=https://codatalab.cloud/api
      - VITE_NODE_ENV=production
    volumes:
      - frontend_build:/app/dist
    networks:
      - mern_network

  # Nginx Reverse Proxy with SSL
  nginx:
    image: nginx:1.25-alpine
    container_name: mern_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - frontend_build:/var/www/html:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - mern_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Certbot for SSL certificates
  certbot:
    image: certbot/certbot:latest
    container_name: mern_certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --force-renewal --email your-email@example.com -d codatalab.cloud -d www.codatalab.cloud --agree-tos
    networks:
      - mern_network

volumes:
  mongodb_data:
    driver: local
  frontend_build:
    driver: local

networks:
  mern_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

echo "📝 Creating nginx/nginx.conf..."
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

echo "📝 Creating nginx/conf.d/default.conf..."
cat > nginx/conf.d/default.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name codatalab.cloud www.codatalab.cloud;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name codatalab.cloud www.codatalab.cloud;

    # SSL Certificate configuration
    ssl_certificate /etc/letsencrypt/live/codatalab.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codatalab.cloud/privkey.pem;
    
    # SSL optimization
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE+RSAGCM:ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:!aNULL:!MD5:!DSS;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory for React app
    root /var/www/html;
    index index.html;

    # Client max body size
    client_max_body_size 10M;

    # API routes - proxy to Node.js backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend:8082/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React app - handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache control for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ~$ {
        deny all;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

echo "📝 Creating init-mongo.js..."
cat > init-mongo.js << 'EOF'
// MongoDB initialization script
db = db.getSiblingDB('mydb');

db.createUser({
  user: 'badisjl99',
  pwd: '123951Ba008',
  roles: [
    {
      role: 'readWrite',
      db: 'mydb'
    },
    {
      role: 'dbAdmin',
      db: 'mydb'
    }
  ]
});

print('Database mydb initialized successfully');
print('User badisjl99 created with readWrite and dbAdmin roles');

// Create sample collections with indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

print('Created indexes for users collection');

// Insert a sample document to ensure collection exists
db.users.insertOne({
  name: "System User",
  email: "system@codatalab.cloud",
  role: "admin",
  createdAt: new Date(),
  isActive: true
});

print('Sample user document created');
print('MongoDB initialization completed successfully');
EOF

echo "📝 Creating backend/Dockerfile..."
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8082

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8082/health || exit 1

# Start the application
CMD ["npm", "start"]
EOF

echo "📝 Creating frontend/Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
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
EOF

echo "📝 Creating frontend/nginx.conf..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
EOF

echo "📝 Creating .env file..."
cat > .env << 'EOF'
# Environment Variables
# Update these values for your production deployment

# Database Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=adminpassword123
MONGODB_URI=mongodb://badisjl99:123951Ba008@mongodb:27017/mydb

# Backend Configuration
NODE_ENV=production
PORT=8082
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
CORS_ORIGIN=https://codatalab.cloud

# Frontend Configuration
VITE_API_URL=https://codatalab.cloud/api
VITE_NODE_ENV=production

# SSL Configuration
SSL_EMAIL=your-email@example.com
DOMAIN_NAME=codatalab.cloud
EOF

echo "📝 Setting proper permissions..."
chmod +x deploy.sh setup-files.sh
chmod 644 docker-compose.yml nginx/nginx.conf nginx/conf.d/default.conf init-mongo.js .env
chmod 644 backend/Dockerfile frontend/Dockerfile frontend/nginx.conf

echo ""
echo "✅ All configuration files created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and update your email address"
echo "2. Make sure your backend and frontend code is in the respective folders"
echo "3. Run: ./deploy.sh"
echo ""
echo "📁 Created files:"
echo "   ├── docker-compose.yml"
echo "   ├── init-mongo.js" 
echo "   ├── .env"
echo "   ├── nginx/"
echo "   │   ├── nginx.conf"
echo "   │   └── conf.d/default.conf"
echo "   ├── backend/"
echo "   │   └── Dockerfile"
echo "   └── frontend/"
echo "       ├── Dockerfile"
echo "       └── nginx.conf"
echo ""
echo "⚠️  Important: Update the email address in .env before running deploy.sh"