#!/bin/bash

# MERN Stack Deployment Script
echo "🚀 Starting MERN Stack Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create SSL directory if it doesn't exist
print_status "Creating SSL directory..."
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f "ssl/codatalab.cloud.crt" ] || [ ! -f "ssl/codatalab.cloud.key" ]; then
    print_warning "SSL certificates not found in ssl/ directory."
    print_warning "Please add your SSL certificates:"
    print_warning "  - ssl/codatalab.cloud.crt"
    print_warning "  - ssl/codatalab.cloud.key"
    print_warning "For now, creating self-signed certificates for testing..."
    
    # Generate self-signed certificate for testing
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/codatalab.cloud.key \
        -out ssl/codatalab.cloud.crt \
        -subj "/C=TN/ST=Tunis/L=Tunis/O=CodeataLab/OU=IT Department/CN=codatalab.cloud"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old Docker images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old Docker images..."
    docker-compose down --rmi all --volumes --remove-orphans
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test MongoDB connection
print_status "Testing MongoDB connection..."
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')" mydb

# Test backend health
print_status "Testing backend health..."
sleep 10
curl -f http://localhost:8082/api/health || print_warning "Backend health check failed"

# Test frontend
print_status "Testing frontend..."
curl -f http://localhost:3000 || print_warning "Frontend health check failed"

# Test Nginx
print_status "Testing Nginx..."
curl -f http://localhost/health || print_warning "Nginx health check failed"

print_status "Deployment completed! 🎉"
print_status "Your application should be available at:"
print_status "  - Frontend: https://codatalab.cloud"
print_status "  - API: https://codatalab.cloud/api"
print_status "  - MongoDB: localhost:27017"

print_status "To view logs, use:"
print_status "  docker-compose logs -f [service_name]"

print_status "To stop services, use:"
print_status "  docker-compose down"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"