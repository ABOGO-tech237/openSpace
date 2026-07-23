# ---- Build stage ----
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/openspace \
    ./cmd/main.go

# ---- Production stage ----
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Africa/Douala

COPY --from=builder /app/openspace .

RUN addgroup -S openspace && adduser -S openspace -G openspace
USER openspace

EXPOSE 8080

CMD ["./openspace"]
