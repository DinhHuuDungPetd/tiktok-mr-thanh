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
public class OrderDetails {

    @Id
    private String id;
    @Column
    private String productName;
    @Column
    private String skuName;
    @Column
    private String skuImage;
    @Column
    private String productId;
    @Column
    private String skuId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Orders orders;

}
