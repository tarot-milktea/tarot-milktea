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

## Jenkins CI/CD 파이프라인

### 자동 배포 및 롤백 시스템

Jenkins 파이프라인은 다음과 같은 고급 기능을 제공합니다:

#### 주요 기능
- **태그 기반 이미지 관리**: 각 빌드마다 `{BUILD_NUMBER}-{GIT_COMMIT_HASH}` 형식의 고유 태그 생성
- **자동 롤백**: 빌드 실패 또는 헬스체크 실패 시 이전 성공 버전으로 자동 롤백
- **성공 버전 추적**: `/tmp/last_successful_build.txt`에 마지막 성공 빌드 태그 저장
- **이미지 정리**: 최근 3개 버전만 보관하여 디스크 공간 관리

#### 파이프라인 단계
1. **Prepare Build**: 빌드 태그 설정 및 이전 성공 태그 확인
2. **Build & Tag Image**: 고유 태그로 Docker 이미지 빌드
3. **Deploy with New Image**: 새 이미지로 서비스 배포
4. **Health Check**: 서비스 상태 확인 (실패 시 자동 롤백)
5. **Save Successful Build**: 성공 시 태그 저장 및 오래된 이미지 정리

### 수동 롤백 도구

긴급 상황이나 특정 버전으로 수동 롤백이 필요한 경우:

```bash
# 기본 사용법 (마지막 성공 버전으로 롤백)
./rollback.sh

# 특정 태그로 롤백
./rollback.sh 42-a1b2c3d

# 사용 가능한 태그 목록 확인
./rollback.sh --list

# 현재 서비스 상태 확인
./rollback.sh --status

# 도움말
./rollback.sh --help
```

#### 롤백 스크립트 특징
- **안전한 롤백**: 이미지 존재 확인 후 롤백 실행
- **자동 헬스체크**: 롤백 후 서비스 정상 동작 확인
- **상세한 로깅**: 컬러 코딩된 로그로 진행 상황 추적
- **대화형 확인**: 특정 태그 롤백 시 사용자 확인 요청

### 장애 복구 시나리오

1. **빌드 실패**: Jenkins가 자동으로 이전 성공 이미지로 롤백
2. **배포 후 헬스체크 실패**: 자동으로 이전 버전으로 롤백
3. **운영 중 문제 발견**: `./rollback.sh` 실행하여 즉시 롤백
4. **특정 버전으로 복원**: `./rollback.sh [태그]`로 원하는 버전으로 롤백

### 모니터링 및 확인

```bash
# 현재 실행 중인 컨테이너 확인
docker ps | grep backend-app

# 현재 사용 중인 이미지 확인  
docker inspect backend-app --format '{{.Config.Image}}'

# 서비스 헬스체크
curl http://localhost:8080/actuator/health

# 마지막 성공 빌드 확인
cat /tmp/last_successful_build.txt
```
