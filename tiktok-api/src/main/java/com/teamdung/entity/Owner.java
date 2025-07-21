package com.teamdung.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class Owner extends Base{


    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(unique = true)
    private String uniqueId;

    @Column
    private String teamName;


    @OneToMany(mappedBy = "owner")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Set<Category> categorySet = new HashSet<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Shop> shopSet = new HashSet<>();

    @OneToMany(mappedBy = "owner")
    private Set<Employee> employeeSet = new HashSet<>();

    @OneToMany(mappedBy = "owner")
    private Set<Tag> tagSet = new HashSet<>();

}
