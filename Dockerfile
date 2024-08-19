# Use a base image that supports multiple architectures
FROM --platform=$TARGETPLATFORM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]