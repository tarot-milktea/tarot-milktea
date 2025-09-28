package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "리더 목록 조회 응답")
public class ReaderResponse {
    
    @Schema(description = "리더 목록")
    private List<Reader> readers;

    public ReaderResponse() {}

    public ReaderResponse(List<Reader> readers) {
        this.readers = readers;
    }

    public List<Reader> getReaders() {
        return readers;
    }

    public void setReaders(List<Reader> readers) {
        this.readers = readers;
    }

    @Schema(description = "타로 리더")
    public static class Reader {
        @Schema(description = "리더 타입", example = "F")
        private String type;
        
        @Schema(description = "리더명", example = "감성 리더")
        private String name;
        
        @Schema(description = "리더 설명", example = "감정을 중시하는 따뜻한 해석을 제공합니다")
        private String description;
        
        @Schema(description = "리더 이미지 URL", example = "https://example.com/reader-f.jpg")
        private String imageUrl;

        @Schema(description = "리더 비디오 URL", example = "https://example.com/reader-f.mp4")
        private String videoUrl;

        public Reader() {}

        public Reader(String type, String name, String description, String imageUrl) {
            this.type = type;
            this.name = name;
            this.description = description;
            this.imageUrl = imageUrl;
        }

        public Reader(String type, String name, String description, String imageUrl, String videoUrl) {
            this.type = type;
            this.name = name;
            this.description = description;
            this.imageUrl = imageUrl;
            this.videoUrl = videoUrl;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    }
}