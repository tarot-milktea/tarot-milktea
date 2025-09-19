package org.com.taro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "openai")
public class OpenAIConfig {
    
    private String apiKey;
    private String baseUrl = "https://gms.ssafy.io/gmsapi/api.openai.com/v1";
    private String model = "gpt-4.1";
    private int maxTokens = 1500;
    private double temperature = 0.7;
    private int timeoutSeconds = 30;

    // 기본 생성자
    public OpenAIConfig() {}

    // Getters and Setters
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
    
    public int getMaxTokens() { 
        return maxTokens; 
    }
    
    public void setMaxTokens(int maxTokens) { 
        this.maxTokens = maxTokens; 
    }
    
    public double getTemperature() { 
        return temperature; 
    }
    
    public void setTemperature(double temperature) { 
        this.temperature = temperature; 
    }
    
    public int getTimeoutSeconds() { 
        return timeoutSeconds; 
    }
    
    public void setTimeoutSeconds(int timeoutSeconds) { 
        this.timeoutSeconds = timeoutSeconds; 
    }

    // 디버깅을 위한 toString (API 키는 마스킹)
    @Override
    public String toString() {
        return "OpenAIConfig{" +
                "apiKey='" + (apiKey != null ? "***" : "null") + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", model='" + model + '\'' +
                ", maxTokens=" + maxTokens +
                ", temperature=" + temperature +
                ", timeoutSeconds=" + timeoutSeconds +
                '}';
    }
}