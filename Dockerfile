# ---- Build stage ----
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache git ca-certificates

# Copier les fichiers de dépendances
COPY go.mod go.sum ./
RUN go mod download

# Copier le code source
COPY . .

# Compiler — binaire statique optimisé
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/openspace \
    ./cmd/main.go

# ---- Production stage ----
FROM alpine:3.19

WORKDIR /app

# Certificats SSL et timezone
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Africa/Douala

# Copier uniquement le binaire compilé
COPY --from=builder /app/openspace .

# Utilisateur non-root pour la sécurité
RUN addgroup -S openspace && adduser -S openspace -G openspace
USER openspace

EXPOSE 8080

CMD ["./openspace"]
