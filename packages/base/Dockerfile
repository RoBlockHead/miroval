FROM denoland/deno:latest

EXPOSE 8080

WORKDIR /app

COPY . /app

RUN deno cache --unstable ./mod.ts

CMD [ "deno", "run", "--allow-all", "--unstable", "./mod.ts" ]
