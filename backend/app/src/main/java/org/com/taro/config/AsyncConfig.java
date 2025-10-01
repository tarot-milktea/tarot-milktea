package org.com.taro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import java.util.concurrent.Executor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name="taroTaskExecutor")
    public Executor taroTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // AI API 호출에 최적화된 스레드 풀 설정
        executor.setCorePoolSize(2);        // 기본 활성 스레드 수 (동시 AI 요청 2개)
        executor.setMaxPoolSize(5);         // 최대 스레드 수 (피크 시 5개까지)
        executor.setQueueCapacity(100);     // 대기 큐 크기 (100개 요청까지 대기)
        executor.setKeepAliveSeconds(60);   // 유휴 스레드 유지 시간 (60초)
        
        // 스레드 이름 설정 (로그에서 식별하기 쉽도록)
        executor.setThreadNamePrefix("TaroAI-");
        
        // 애플리케이션 종료 시 스레드 풀 정리
        executor.setWaitForTasksToCompleteOnShutdown(true);  // 진행 중인 작업 완료 대기
        executor.setAwaitTerminationSeconds(20);             // 최대 20초 대기
        
        // 거부 정책: 큐가 가득 찰 때 호출자 스레드에서 직접 실행
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.initialize();

        return executor;
    }
}
