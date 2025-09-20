# Backend - AI-Powered Tarot Reading Service

## Project Overview

Spring Boot 3.3.5 backend service for a 타로 (Tarot) reading application that integrates with OpenAI's API to provide AI-powered tarot readings with conversation-based context and reader personality types.

## Requirements

- **Java**: 21 (configured via toolchain)
- **Gradle**: 8.10 (included via wrapper)
- **OpenAI API Key**: Required for AI tarot readings
- **MySQL**: Database for production (H2 for development)

## Key Features

- 🔮 **AI-Powered Readings**: GPT-4.1 integration via SSAFY GMS proxy
- 🎭 **Reader Personalities**: F (Feeling), T (Thinking), FT (Balanced) interpretation styles
- 📖 **Sequential Workflow**: Past → Present → Future → Summary → Score → Image generation
- 💬 **Conversation Context**: Each card interpretation builds on previous context
- 📊 **Detailed Processing**: 11-stage processing status tracking

## Build & Run

### Development Commands

```bash
# Navigate to backend directory
cd backend

# Build the project
./gradlew build

# Run the application (development mode)
./gradlew bootRun

# Run all tests
./gradlew test

# Clean build artifacts
./gradlew clean

# Build without tests
./gradlew build -x test
```

### Docker Commands

```bash
# Build Docker image
docker build -t backend-app .

# Run container
docker run -p 8080:8080 backend-app
```

## Environment Variables

Required environment variables:

```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://gms.ssafy.io/gmsapi/api.openai.com/v1  # Optional, has default
OPENAI_MODEL=gpt-4.1                                           # Optional, has default
```

## API Documentation

After running the application:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Health Check**: http://localhost:8080/actuator/health

## Project Architecture

### Package Structure

```
org.com.taro/
├── App.java                 # Main Spring Boot application class
├── config/                  # Configuration classes (CORS, OpenAI, Async)
├── controller/              # REST controllers
│   ├── ApiController.java   # Health check endpoints
│   └── TaroController.java  # Main tarot API endpoints
├── dto/                     # Data Transfer Objects
├── entity/                  # JPA entities for database mapping
├── service/                 # Business logic layer
│   ├── ai/                  # AI service integration
│   │   ├── OpenAIClient.java        # OpenAI API client
│   │   ├── TaroAiService.java       # AI tarot reading service
│   │   ├── PromptService.java       # Prompt management
│   │   └── ReaderPersonaService.java # Reader personality types
│   └── TaroService.java     # Main tarot business logic
└── repository/              # JPA repository interfaces
```

## AI Reading System

### Processing Status Flow

```
CREATED → CARDS_GENERATED → SUBMITTED →
PAST_PROCESSING → PAST_COMPLETED →
PRESENT_PROCESSING → PRESENT_COMPLETED →
FUTURE_PROCESSING → FUTURE_COMPLETED →
SUMMARY_PROCESSING → SUMMARY_COMPLETED →
IMAGE_PROCESSING → COMPLETED
```

### Reader Personality Types

- **F (Feeling)**: Emotional, intuitive, empathetic interpretations
- **T (Thinking)**: Logical, analytical, practical interpretations
- **FT (Balanced)**: Harmonized emotional + rational approach

### Conversation-Based Context

Each card interpretation builds on previous readings, creating a coherent narrative across past/present/future with consistent reader personality.

## Database Configuration

- **Production**: MySQL at `3.35.231.187:3306/taro`
- **Development**: H2 in-memory database
- **JPA/Hibernate**: With SQL logging in DEBUG mode
- **Connection Pool**: Default HikariCP

## Project Configuration

- **Java Version**: 21 (configured via toolchain)
- **Spring Boot**: 3.3.5
- **Main Package**: `org.com.taro`
- **Main Class**: `org.com.taro.App`
- **Default Port**: 8080
- **AI Model**: GPT-4.1 (1500 max tokens, 0.7 temperature)

# 빌드 및 실행

빌드와 실행은 다음 명령어로 가능합니다:

```bash
  cd backend
  docker build -t backend-app .
  docker run -p 8080:8080 backend-app
```
