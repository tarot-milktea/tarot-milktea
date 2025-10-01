package org.com.taro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
@Tag(name = "API Controller", description = "Sample API endpoints for frontend developers")
public class ApiController {

    @GetMapping("/health")
    @Operation(summary = "Check API health", description = "Returns the current health status of the API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "API is running successfully")
    })
    public ResponseEntity<HealthStatus> getHealth() {
        HealthStatus status = new HealthStatus("UP", "API is running successfully");
        return ResponseEntity.ok(status);
    }

    public static class HealthStatus {
        private String status;
        private String message;

        public HealthStatus(String status, String message) {
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