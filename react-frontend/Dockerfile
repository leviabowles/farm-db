FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Install dependencies (npm install works without lock file) and cache layers.
RUN npm install

# Copy the rest of the source code.
COPY . .

EXPOSE 3000



CMD ["npm", "start"]