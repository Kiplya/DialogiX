FROM node:alpine

ARG SHARED_PATH
ENV SHARED_PATH=${SHARED_PATH}
ARG PORT
ENV PORT=${PORT}
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app
COPY ./frontend/package.json ./
EXPOSE 3000

RUN npm install

COPY ./frontend .
COPY ./shared ./shared

RUN npm run build
RUN mv dist /frontend_build