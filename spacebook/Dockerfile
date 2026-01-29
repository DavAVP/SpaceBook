# build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_VAPID_PUBLIC_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# production stage
FROM nginx:stable-alpine
ENV PORT 8080
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
