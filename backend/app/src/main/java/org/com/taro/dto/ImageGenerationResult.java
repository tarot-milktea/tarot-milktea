package org.com.taro.dto;

public class ImageGenerationResult {
    private String imageUrl;
    private String textDescription;

    public ImageGenerationResult() {}

    public ImageGenerationResult(String imageUrl, String textDescription) {
        this.imageUrl = imageUrl;
        this.textDescription = textDescription;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTextDescription() {
        return textDescription;
    }

    public void setTextDescription(String textDescription) {
        this.textDescription = textDescription;
    }
}