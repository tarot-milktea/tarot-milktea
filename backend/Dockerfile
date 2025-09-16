# Use OpenJDK 21 as base image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and configuration files
COPY gradlew ./
COPY gradle ./gradle/
COPY settings.gradle ./
COPY app/build.gradle ./app/

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY app/src ./app/src/

# Build the application
RUN ./gradlew build -x test

# Expose port 8080
EXPOSE 8080

# Run the Spring Boot application
CMD ["./gradlew", "bootRun"]