FROM golang

WORKDIR /app

COPY go.mod ./
COPY go.sum ./

ENV GO_FLAGS=-insecure

RUN go mod download

COPY *.go ./

ENV PRODUCTION true

RUN go build -o main

CMD ["./main"]