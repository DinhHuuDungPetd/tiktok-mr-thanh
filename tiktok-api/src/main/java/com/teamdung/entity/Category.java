package com.teamdung.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class Category extends Base {

    @Column(nullable = false)
    private String name;
    
    @Column(name = "is_active")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private boolean isActive = true;

    @Column
    private String noteUrl;

    @Column
    private Boolean autoGetLabel = false;

    @Column
    private String folderId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Owner owner;

    @OneToMany(mappedBy = "category")
    private Set<Employee> employeeSet = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "shop_categories", // Tên bảng trung gian
            joinColumns = @JoinColumn(name = "category_id"), // Khóa ngoại trỏ đến Category
            inverseJoinColumns = @JoinColumn(name = "shop_id") // Khóa ngoại trỏ đến Shop
    )
    private Set<Shop> shopSet = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinTable(
            name = "tag_categories", // Tên bảng trung gian
            joinColumns = @JoinColumn(name = "category_id"), // Khóa ngoại trỏ đến Category
            inverseJoinColumns = @JoinColumn(name = "tag_id") // Khóa ngoại trỏ đến Shop
    )
    private Set<Tag> tagSet = new HashSet<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Telegram> telegramList = new ArrayList<>();
}
