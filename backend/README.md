# Backend - Spring Boot Application

## Requirements

- **Java**: 17 or later
- **Gradle**: 9.0.0 (included via wrapper)

## Build & Run

### Build the project

```bash
./gradlew build
```

### Run the application

```bash
./gradlew bootRun
```

### Run tests

```bash
./gradlew test
```

### Clean build artifacts

```bash
./gradlew clean
```

## API Documentation

After running the application, Swagger UI is available at:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/v3/api-docs.yaml

## Project Configuration

- **Java Version**: 17 (configured via toolchain)
- **Spring Boot**: 3.3.5
- **Main Package**: `org.com.taro`
- **Main Class**: `org.com.taro.App`
- **Default Port**: 8080

# 빌드 및 실행

빌드와 실행은 다음 명령어로 가능합니다:

```bash
  cd backend
  docker build -t backend-app .
  docker run -p 8080:8080 backend-app
```
