#!/bin/bash
# File: setup-nginx.sh

# Create directories
mkdir -p ./nginx/ssl
mkdir -p ./nginx/conf.d

# Copy the Nginx configuration
cat > ./nginx/conf.d/default.conf << 'EOF'
# /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name codatalab.cloud;
    
    # This location block is important for Let's Encrypt certificate renewal
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name codatalab.cloud;

    # --- THIS IS THE CRUCIAL FIX ---
    # Point to your real Let's Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/codatalab.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codatalab.cloud/privkey.pem;

    # Include the recommended security settings from Let's Encrypt/Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (React App)
    location / {
        root /var/www/react-build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Node.js)
    location /api/ {
        proxy_pass http://backend:8082/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Storage Service API (Python/FastAPI)
    location /api/storage/ {
        proxy_pass http://storage:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
}
EOF

# Generate self-signed SSL certificate for development
# Only generate if they don't exist to avoid overwriting
if [ ! -f "./nginx/ssl/key.pem" ] || [ ! -f "./nginx/ssl/cert.pem" ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./nginx/ssl/key.pem \
    -out ./nginx/ssl/cert.pem \
    -subj "/CN=codatalab.cloud"
  echo "Generated new self-signed SSL certificates."
else
  echo "SSL certificates already exist. Skipping generation."
fi


echo "Nginx configuration has been set up."