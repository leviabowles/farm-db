# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Extract version from package.json
ARG REACT_APP_VERSION="0.1.0"
ENV REACT_APP_VERSION=${REACT_APP_VERSION}

# Build the React app for production
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
# Copy the build output from the build stage to the nginx html folder
COPY --from=build-stage /app/build /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
