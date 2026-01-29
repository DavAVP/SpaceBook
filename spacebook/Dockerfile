# build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_VAPID_PUBLIC
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_VAPID_PUBLIC=$VITE_VAPID_PUBLIC
RUN npm run build

# production stage
FROM nginx:stable-alpine
ENV PORT 8080
COPY --from=build /app/dist /usr/share/nginx/html
# Adjust nginx config: listen on 8080 and fallback SPA routes to index.html
RUN sed -i 's/listen[[:space:]]\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf \
	&& sed -i 's@try_files \\$uri \\$uri/ =404;@try_files \\$uri \\$uri/ /index.html;@' /etc/nginx/conf.d/default.conf || true
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
