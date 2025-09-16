package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.com.taro.constants.ValidationConstants;
import java.util.List;

@Schema(description = "최종 선택 결과 전송 요청", 
        example = "{\n" +
                  "  \"categoryCode\": \"LOVE\",\n" +
                  "  \"topicCode\": \"REUNION\",\n" +
                  "  \"questionText\": \"전 연인과 재회할 가능성이 있을까요?\",\n" +
                  "  \"readerType\": \"F\",\n" +
                  "  \"selectedCards\": [\n" +
                  "    {\n" +
                  "      \"suit\": \"MAJOR\",\n" +
                  "      \"number\": \"1\",\n" +
                  "      \"position\": 1,\n" +
                  "      \"orientation\": \"upright\"\n" +
                  "    },\n" +
                  "    {\n" +
                  "      \"suit\": \"WANDS\",\n" +
                  "      \"number\": \"5\",\n" +
                  "      \"position\": 2,\n" +
                  "      \"orientation\": \"reversed\"\n" +
                  "    },\n" +
                  "    {\n" +
                  "      \"suit\": \"CUPS\",\n" +
                  "      \"number\": \"KING\",\n" +
                  "      \"position\": 3\n" +
                  "    }\n" +
                  "  ]\n" +
                  "}")
public class SubmitRequest {
    
    @Schema(description = "선택한 카테고리 코드", example = "LOVE", required = true)
    @NotBlank(message = "카테고리 코드는 필수입니다")
    @Pattern(regexp = "^(LOVE|JOB|MONEY)$", message = "유효하지 않은 카테고리 코드입니다. 사용 가능한 값: LOVE, JOB, MONEY")
    private String categoryCode;
    
    @Schema(description = "선택한 주제 코드", example = "REUNION", required = true)
    @NotBlank(message = "주제 코드는 필수입니다")
    private String topicCode;
    
    @Schema(description = "사용자가 입력한 질문", example = "전 연인과 재회할 가능성이 있을까요?", required = true)
    @NotBlank(message = "질문 텍스트는 필수입니다")
    @Size(max = 200, message = "질문은 200자 이하로 입력해주세요")
    private String questionText;
    
    @Schema(description = "선택한 리더 타입", example = "F", required = true)
    @NotBlank(message = "리더 타입은 필수입니다")
    @Pattern(regexp = "^(F|T|FT)$", message = "유효하지 않은 리더 타입입니다. 사용 가능한 값: F, T, FT")
    private String readerType;
    
    @Schema(description = "선택한 타로 카드 목록", required = true)
    @NotNull(message = "카드 선택은 필수입니다")
    @Size(min = 3, max = 3, message = "정확히 3장의 카드를 선택해야 합니다")
    @Valid
    private List<CardSelection> selectedCards;

    public SubmitRequest() {}

    public SubmitRequest(String categoryCode, String topicCode, String questionText, String readerType, List<CardSelection> selectedCards) {
        this.categoryCode = categoryCode;
        this.topicCode = topicCode;
        this.questionText = questionText;
        this.readerType = readerType;
        this.selectedCards = selectedCards;
    }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    public String getTopicCode() { return topicCode; }
    public void setTopicCode(String topicCode) { this.topicCode = topicCode; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getReaderType() { return readerType; }
    public void setReaderType(String readerType) { this.readerType = readerType; }
    public List<CardSelection> getSelectedCards() { return selectedCards; }
    public void setSelectedCards(List<CardSelection> selectedCards) { this.selectedCards = selectedCards; }

    @Schema(description = "선택한 타로 카드 정보")
    public static class CardSelection {
        @Schema(description = "카드 수트", example = "MAJOR", required = true,
                allowableValues = {"MAJOR", "WANDS", "CUPS", "SWORDS", "PENTACLES"})
        @NotBlank(message = "카드 수트는 필수입니다")
        @Pattern(regexp = "^(MAJOR|WANDS|CUPS|SWORDS|PENTACLES)$", message = "유효하지 않은 카드 수트입니다")
        private String suit;
        
        @Schema(description = "카드 번호 (메이저: 1-22, 마이너: ACE,2-10,PAGE,KNIGHT,QUEEN,KING)",
                example = "1", required = true)
        @NotBlank(message = "카드 번호는 필수입니다")
        private String number;
        
        @Schema(description = "카드 위치", example = "1", required = true)
        @Min(value = 1, message = "카드 위치는 1 이상이어야 합니다")
        @Max(value = 3, message = "카드 위치는 3 이하여야 합니다")
        private int position;
        
        @Schema(description = "카드 방향 (선택사항)", example = "upright",
                allowableValues = {"upright", "reversed"})
        @Pattern(regexp = "^(upright|reversed)$", message = "카드 방향은 upright 또는 reversed만 허용됩니다", flags = Pattern.Flag.CASE_INSENSITIVE)
        private String orientation;

        public CardSelection() {}

        public CardSelection(String suit, String number, int position, String orientation) {
            this.suit = suit;
            this.number = number;
            this.position = position;
            this.orientation = orientation;
        }

        public String getSuit() { return suit; }
        public void setSuit(String suit) { this.suit = suit; }
        public String getNumber() { return number; }
        public void setNumber(String number) { this.number = number; }
        public int getPosition() { return position; }
        public void setPosition(int position) { this.position = position; }
        public String getOrientation() { return orientation; }
        public void setOrientation(String orientation) { this.orientation = orientation; }
    }
}