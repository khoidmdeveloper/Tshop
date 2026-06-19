# Stage build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_VND_EXCHANGE_RATE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VND_EXCHANGE_RATE=$VITE_VND_EXCHANGE_RATE
RUN npm run build

# Stage runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
