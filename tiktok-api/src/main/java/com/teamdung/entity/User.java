package com.teamdung.entity;

import Utils.Enum.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;


@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, of = {})
public class User extends Base implements UserDetails {

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "OWNER" hoặc "EMPLOYEE"

    @Column(nullable = false)
    private Boolean isActive = true;

    @OneToOne(mappedBy = "user")
    private Owner owner;

    @OneToOne(mappedBy = "user")
    private Employee employee;


    @Transient
    private Set<Tag> tagSet = new HashSet<>();

    @Transient
    @JsonProperty("shopSet")
    public Set<Shop> getShopSet() {
        if(role.equals(Role.OWNER.toString())) {
            return owner.getShopSet();
        }
        if(role.equals(Role.EMPLOYEE.toString())) {
            return employee.getCategory().getShopSet();
        }
        return new HashSet<>();
    }


    @Transient
    @JsonProperty("tagSet")
    public Set<Tag> getTagSet() {
        if(role.equals(Role.OWNER.toString())) {
            return owner.getTagSet();
        }
        if(role.equals(Role.EMPLOYEE.toString())) {
            return employee.getCategory().getTagSet();
        }
        return new HashSet<>();
    }

    @Transient
    @JsonProperty("teamName")
    public String getTeamName() {
        if(role.equals(Role.OWNER.toString())) {
            return owner.getTeamName();
        }
        if(role.equals(Role.EMPLOYEE.toString())) {
            return employee.getOwner().getTeamName();
        }
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of( new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
