package org.com.taro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "gemini")
public class GeminiConfig {

    private String apiKey;
    private String baseUrl = "https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com";
    private String model = "gemini-2.0-flash-exp-image-generation";
    private int timeoutSeconds = 60;

    public GeminiConfig() {}

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    @Override
    public String toString() {
        return "GeminiConfig{" +
                "apiKey='" + (apiKey != null ? "***" : "null") + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", model='" + model + '\'' +
                ", timeoutSeconds=" + timeoutSeconds +
                '}';
    }
}