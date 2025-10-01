package org.com.taro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lucky_card")
public class LuckyCard {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "message", length = 255, nullable = false)
    private String message;

    @Column(name = "image_url", length = 255, nullable = false)
    private String imageUrl;

    public LuckyCard() {}

    public LuckyCard(Integer id, String name, String message, String imageUrl) {
        this.id = id;
        this.name = name;
        this.message = message;
        this.imageUrl = imageUrl;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}