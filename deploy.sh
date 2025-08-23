#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Prerequisites check passed"

# Create nginx configuration
print_status "Creating Nginx configuration..."
mkdir -p ./frontend/nginx
cat > ./frontend/nginx/default.conf << EOF
server {
    listen 80;
    server_name 51.75.205.211;
    
    # Serve React static files
    location / {
        root /usr/share/nginx/html;
        try_files \$uri /index.html;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://backend:8082/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Update frontend Dockerfile to include nginx config
print_status "Updating frontend Dockerfile..."
cat > ./frontend/Dockerfile << 'EOF'
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
# Copy custom nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Set permissions
RUN chmod -R 755 /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Clean up old images (optional)
print_warning "Cleaning up old Docker images..."
docker system prune -f 2>/dev/null || true

# Build and start services
print_status "Building and starting services..."
if docker-compose up --build -d; then
    print_success "Services started successfully!"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service status
print_status "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_success "All services are running!"
    
    echo ""
    echo "==================================="
    echo "🎉 Deployment completed successfully!"
    echo "==================================="
    echo "Frontend: http://51.75.205.211"
    echo "Backend API: http://51.75.205.211/api"
    echo "MongoDB: localhost:27017"
    echo ""
    echo "To check logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    echo ""
    echo "To restart services:"
    echo "  docker-compose restart"
    echo "==================================="
else
    print_error "Some services failed to start properly"
    print_status "Showing service status..."
    docker-compose ps
    print_status "Showing recent logs..."
    docker-compose logs --tail=50
    exit 1
fi

# Show container status
print_status "Container status:"
docker-compose ps