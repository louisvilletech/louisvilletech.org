FROM node:13.14.0-alpine

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN cp generate-site-in-docker /etc/periodic/15min/ && \
      npm ci

CMD ["exec", "crond", "-f"]
