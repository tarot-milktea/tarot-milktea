package org.com.taro.service.ai;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.service.ai.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TaroAiService {
    @Autowired
    private OpenAIClient openAIClient;

    @Autowired
    private PromptService promptService;

    // @Async("taroTaskExecutor")를 붙이면, 아래 메서드는 요청이 들어와도 메인 스레드가 기다리지 않고 바로 응답을 줄 수 있어.
    // 즉, 이 메서드는 별도의 작업 스레드(taroTaskExecutor에서 관리하는)에서 실행돼서, 시간이 오래 걸리는 작업(예: AI API 호출)을 비동기로 처리할 수 있어.
    // 이렇게 하면 서버가 동시에 여러 요청을 효율적으로 처리할 수 있고, 사용자는 기다림 없이 바로 응답을 받을 수 있어.
    // "taroTaskExecutor"는 보통 Spring의 설정(@Configuration) 클래스에서 ThreadPoolTaskExecutor로 직접 만들어서 Bean으로 등록해야 해.
    /**
     * 여기선 어떤 작업을 해야해?
     * - 사용자가 제출한 SubmitRequest를 받아서, AI 해석 결과(문자열)를 비동기로 생성해야 해.
     * 
     * 어디서 뭘 가져와야 하는지 확인해줘.
     * 1. 프롬프트 생성: PromptService에서 프롬프트 생성 메서드 필요 (예: createPrompt(SubmitRequest))
     * 2. OpenAI API 호출: OpenAIClient에서 프롬프트를 넘겨서 결과를 받아오는 메서드 필요 (예: getInterpretation(String prompt))
     * 3. 응답 파싱 및 검증: OpenAIClient에서 받은 결과를 검증/파싱
     * 4. 예외 처리: OpenAI API 호출 실패 시 기본 메시지 등 폴백 처리 필요
     */
    @Async("taroTaskExecutor")
    public CompletableFuture<String> generateInterpretation(SubmitRequest request) {   
        // 1. 프롬프트 생성: PromptService에서 프롬프트 생성
        //    (PromptService에 createPrompt(SubmitRequest) 메서드가 구현되어 있어야 함)
        String prompt = promptService.createPrompt(request);

        // 2. OpenAI API 호출: OpenAIClient에서 프롬프트를 넘겨서 해석 결과 받아오기
        //    (OpenAIClient에 getInterpretation(String prompt) 같은 메서드가 필요)
        String interpretation;
        try {
            interpretation = openAIClient.getInterpretation(prompt);
        } catch (Exception e) {
            // 4. 예외 처리: API 실패 시 폴백 메시지 반환
            interpretation = "AI 해석을 가져오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.";
        }

        /**
         * log.info("AI 해석 생성 시작 - 스레드: {}", Thread.currentThread().getName());
           // ... 기존 로직
           log.info("AI 해석 생성 완료 - 스레드: {}", Thread.currentThread().getName());
           return CompletableFuture.completedFuture(interpretation);
         */

        // 3. 응답 파싱 및 검증: (여기선 단순 문자열로 가정, 실제로는 JSON 파싱 등 필요할 수 있음)
        return CompletableFuture.completedFuture(interpretation);
    }
    
    public String generateReaderMessage(String readerType, String interpretation) {
        return interpretation;
        // 리더 타입별 맞춤 메시지 생성
    }
}
