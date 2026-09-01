# syntax=docker/dockerfile:1

FROM python:3.11-slim AS api

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

RUN groupadd --system hina && useradd --system --gid hina --home-dir /app hina
COPY pyproject.toml README.md ./
COPY src ./src
RUN python -m pip install --no-cache-dir .

RUN mkdir -p /data && chown hina:hina /data
USER hina
VOLUME ["/data"]
EXPOSE 8787
CMD ["hina-dashboard-api"]

FROM node:22-alpine AS dashboard-build
WORKDIR /app
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci
COPY dashboard ./
RUN npm run build

FROM nginx:1.27-alpine AS dashboard
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=dashboard-build /app/dist /usr/share/nginx/html
EXPOSE 80
