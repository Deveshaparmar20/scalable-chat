# Build stage
FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

# Serve stage
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
