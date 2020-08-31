FROM nginx:1.19.1-alpine

RUN apk --no-cache add nodejs-current npm && \
      mkdir /app

COPY . /app

WORKDIR /app

RUN cp generate-site-in-docker.sh /etc/periodic/15min/ && \
      npm ci
