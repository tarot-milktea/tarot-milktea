package org.com.taro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "topics")
public class Topic {

    @Id
    @Column(name = "code", length = 20, nullable = false)
    private String code;

    @Column(name = "category_code", length = 20, nullable = false)
    private String categoryCode;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_code", referencedColumnName = "code", insertable = false, updatable = false)
    private Category category;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TopicSampleQuestion> sampleQuestions;

    public Topic() {}

    public Topic(String code, String categoryCode, String name, String description) {
        this.code = code;
        this.categoryCode = categoryCode;
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<TopicSampleQuestion> getSampleQuestions() {
        return sampleQuestions;
    }

    public void setSampleQuestions(List<TopicSampleQuestion> sampleQuestions) {
        this.sampleQuestions = sampleQuestions;
    }
}