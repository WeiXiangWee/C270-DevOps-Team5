# Use the official Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["node", "app.js"]