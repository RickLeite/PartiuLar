#!/bin/bash

# Get WSL2 IP address
export WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
echo "WSL2 IP: $WSL_IP"

# Stop any running containers
docker compose down

# Start containers with the WSL IP
docker compose up -d --build

# Wait a moment for the container to start
sleep 2

# Show logs
docker compose logs -f