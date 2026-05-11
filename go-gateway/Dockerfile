# Build stage
FROM golang:1.25.9-alpine AS builder

WORKDIR /app

# Copy go mod and sum files (if they exist, else this step can be adjusted)
COPY go.mod go.sum* ./
RUN go mod download || true

# Copy the rest of the source code
COPY . .

# Build the Go application
# Assuming the entry point is cmd/api/main.go as specified
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/gateway ./cmd/api/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Add CA certificates for HTTPS requests if needed
RUN apk --no-cache add ca-certificates

# Copy the compiled binary from the builder stage
COPY --from=builder /app/gateway .

# Expose the port the app runs on
EXPOSE 3030

# Command to run the application
CMD ["./gateway"]
