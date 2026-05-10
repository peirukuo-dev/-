FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install
RUN cd server && npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/server/package*.json ./server/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server/server.js"]