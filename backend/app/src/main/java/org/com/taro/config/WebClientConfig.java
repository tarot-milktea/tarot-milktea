package org.com.taro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Autowired
    private OpenAIConfig openAIConfig;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(openAIConfig.getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + openAIConfig.getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(1024 * 1024)) // 1MB 버퍼 크기
                .build();
    }
}