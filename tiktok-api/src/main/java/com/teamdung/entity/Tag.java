package com.teamdung.entity;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class Tag extends Base{

    private String name;

    @OneToMany(mappedBy = "tag")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Set<Shop> shops = new HashSet<>();

    @ManyToMany(mappedBy = "tagSet", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Set<Category> categorySet = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Owner owner;

}
