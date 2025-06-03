#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate SSL certificate for localhost
openssl req -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout certs/localhost.key \
  -out certs/localhost.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set permissions
chmod 600 certs/localhost.key
chmod 644 certs/localhost.crt

echo "SSL certificate generated successfully!"
echo "Certificate: certs/localhost.crt"
echo "Private key: certs/localhost.key" 