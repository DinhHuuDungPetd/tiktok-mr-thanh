package com.teamdung.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.teamdung.entity.Order.Orders;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class Shop extends Base {

    @Column
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String accessToken;
    @Column
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long accessTokenExpiry;

    @Column
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long refreshTokenExpiry;
    @Column
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String refreshToken;

    @Column
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String cipher;

    @Column
    private String shopId;

    @Column
    private String name;

    @Column
    private String note;

    @ManyToOne
    @JoinColumn(name = "tag_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Tag tag;

    @ManyToMany(mappedBy = "shopSet")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Set<Category> categorySet = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Owner owner;


    @Transient
    @JsonProperty("categoryNames")
    public List<String> getCategoryNames() {
        return categorySet.stream().map(Category::getName).toList();
    }

    @Transient
    @JsonProperty("tagName")
    public String getTagName() {
        if(tag == null) {
            return null;
        }
        return tag.getName();
    }

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<Orders> ordersList = new ArrayList<>();
}
