package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "주제 조회 응답")
public class TopicResponse {
    
    @Schema(description = "대주제 목록")
    private List<Category> categories;

    public TopicResponse() {}

    public TopicResponse(List<Category> categories) {
        this.categories = categories;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    @Schema(description = "카테고리 (대주제)")
    public static class Category {
        @Schema(description = "카테고리 코드", example = "LOVE")
        private String code;
        
        @Schema(description = "카테고리명", example = "연애")
        private String name;
        
        @Schema(description = "카테고리 설명", example = "연애와 관련된 고민")
        private String description;
        
        @Schema(description = "중주제 목록")
        private List<Topic> topics;

        public Category() {}

        public Category(String code, String name, String description, List<Topic> topics) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.topics = topics;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<Topic> getTopics() { return topics; }
        public void setTopics(List<Topic> topics) { this.topics = topics; }
    }

    @Schema(description = "주제 (중주제)")
    public static class Topic {
        @Schema(description = "주제 코드", example = "REUNION")
        private String code;
        
        @Schema(description = "주제명", example = "재회")
        private String name;
        
        @Schema(description = "주제 설명", example = "전 연인과의 재회에 대한 고민")
        private String description;
        
        @Schema(description = "질문 예시 목록 (사용자는 직접 입력 가능)")
        private List<String> sampleQuestions;

        public Topic() {}

        public Topic(String code, String name, String description, List<String> sampleQuestions) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.sampleQuestions = sampleQuestions;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getSampleQuestions() { return sampleQuestions; }
        public void setSampleQuestions(List<String> sampleQuestions) { this.sampleQuestions = sampleQuestions; }
    }

}