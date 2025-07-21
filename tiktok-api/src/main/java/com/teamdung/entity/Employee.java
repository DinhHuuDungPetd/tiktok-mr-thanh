package com.teamdung.entity;

import Utils.Enum.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.teamdung.DTO.Res.User.UserResponseDTO;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class Employee extends Base{

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Owner owner;

    @Transient
    @JsonProperty("user")
    public UserResponseDTO getUserDTO() {
        return UserResponseDTO.convertToDTO(this.user);
    }

}
