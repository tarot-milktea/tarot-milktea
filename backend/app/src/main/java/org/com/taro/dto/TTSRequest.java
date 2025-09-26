package org.com.taro.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * TTS 음성 변환 요청 DTO
 */
public class TTSRequest {

    @NotBlank(message = "텍스트는 필수 입력 항목입니다")
    @Size(max = 2000, message = "텍스트는 최대 2000자까지 입력 가능합니다")
    private String text;

    private String voice = "nova"; // 기본값: nova

    private String model = "gpt-4o-mini-tts"; // 기본값

    @DecimalMin(value = "0.25", message = "속도는 0.25 이상이어야 합니다")
    @DecimalMax(value = "4.0", message = "속도는 4.0 이하여야 합니다")
    private Float speed = 1.0f; // 기본값: 1.0

    public TTSRequest() {}

    public TTSRequest(String text, String voice, String model, Float speed) {
        this.text = text;
        this.voice = voice != null ? voice : "nova";
        this.model = model != null ? model : "gpt-4o-mini-tts";
        this.speed = speed != null ? speed : 1.0f;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice != null ? voice : "nova";
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model != null ? model : "gpt-4o-mini-tts";
    }

    public Float getSpeed() {
        return speed;
    }

    public void setSpeed(Float speed) {
        this.speed = speed != null ? speed : 1.0f;
    }
}