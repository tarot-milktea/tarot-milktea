package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "세션 생성 요청")
public class CreateSessionRequest {
    
    @Schema(description = "사용자 닉네임 (선택사항)", example = "타로마니아")
    private String nickname;

    public CreateSessionRequest() {}

    public CreateSessionRequest(String nickname) {
        this.nickname = nickname;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}