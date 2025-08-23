# Use official Node 18 image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port 8082
EXPOSE 8082

# Start the backend server
CMD ["npm", "start"]

