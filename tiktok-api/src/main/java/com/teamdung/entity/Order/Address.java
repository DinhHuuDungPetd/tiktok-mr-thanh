package com.teamdung.entity.Order;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String name;
    @Column
    private String postalCode;
    @Column
    private String country;
    @Column
    private String state;
    @Column
    private String city;
    @Column
    private String phoneNumber;
    @Column
    private String addressDetail;

    @OneToOne(mappedBy = "address")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Orders orders;


}
