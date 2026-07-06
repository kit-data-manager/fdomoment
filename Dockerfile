# Stage 1: base environment for Next.js builds
FROM node:24.13.0-bullseye

# Set working directory
WORKDIR /app

# Copy package and lock files
COPY package*.json ./

# Install dependencies (exact versions)
RUN npm ci

# Copy source code (from the release)
COPY . .

# This image DOES NOT build Next.js.
# It provides the source code and dependencies ready to build later.
CMD ["/bin/bash"]
