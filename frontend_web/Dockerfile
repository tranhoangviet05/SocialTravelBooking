# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Build args
ARG VITE_API_URL
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET

# Chỉ ghi đè ENV nếu ARG không rỗng
RUN if [ -n "$VITE_API_URL" ]; then echo "VITE_API_URL=$VITE_API_URL" >> .env.production; fi && \
    if [ -n "$VITE_REVERB_APP_KEY" ]; then echo "VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY" >> .env.production; fi && \
    if [ -n "$VITE_REVERB_HOST" ]; then echo "VITE_REVERB_HOST=$VITE_REVERB_HOST" >> .env.production; fi && \
    if [ -n "$VITE_REVERB_PORT" ]; then echo "VITE_REVERB_PORT=$VITE_REVERB_PORT" >> .env.production; fi && \
    if [ -n "$VITE_REVERB_SCHEME" ]; then echo "VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME" >> .env.production; fi && \
    if [ -n "$VITE_CLOUDINARY_CLOUD_NAME" ]; then echo "VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME" >> .env.production; fi && \
    if [ -n "$VITE_CLOUDINARY_UPLOAD_PRESET" ]; then echo "VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET" >> .env.production; fi

RUN npm run build -- --mode production

# Serve stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]