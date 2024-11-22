# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /opt/wa_service

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the application dependencies
RUN npm install
RUN apt update && apt install -y chromium

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# EXPOSE 3000

# Command to run the application
# CMD ["node", "./bin/.js"]
