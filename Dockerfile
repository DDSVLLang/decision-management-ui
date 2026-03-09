# ------------------------------------------------------------
# 1) Build Stage
# ------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./

# Dependencies
RUN npm install
COPY . .
RUN npm run build



# ------------------------------------------------------------
# 2) Nginx Stage
# ------------------------------------------------------------
FROM nginx:alpine

# Custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]