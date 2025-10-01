#!/bin/bash

# Backend 배포 자동화 스크립트
set -e

# Git pull
echo "Git pull 중..."
git pull

# Gradle 빌드
echo "Gradle 빌드 중..."
./gradlew clean build

# Docker Compose 실행
echo "Docker Compose 실행 중..."
docker-compose down
docker-compose up -d --build

echo "배포 완료!"
echo "애플리케이션: http://localhost:8080"