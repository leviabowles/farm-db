# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build the React app for production
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
# Copy the build output from the build stage to the nginx html folder
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
