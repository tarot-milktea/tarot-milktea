package org.com.taro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "API Controller", description = "Sample API endpoints for frontend developers")
public class ApiController {

    @GetMapping("/hello")
    @Operation(summary = "Get greeting message", description = "Returns a simple greeting message")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully returned greeting message")
    })
    public ResponseEntity<String> getGreeting() {
        return ResponseEntity.ok("Hello World from Spring Boot API!");
    }

    @GetMapping("/status")
    @Operation(summary = "Check API status", description = "Returns the current status of the API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "API is running successfully")
    })
    public ResponseEntity<ApiStatus> getStatus() {
        ApiStatus status = new ApiStatus("UP", "API is running successfully");
        return ResponseEntity.ok(status);
    }

    public static class ApiStatus {
        private String status;
        private String message;

        public ApiStatus(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}