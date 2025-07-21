package com.teamdung.entity.Order;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.teamdung.entity.Shop;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"id"})
public class Orders {
    @Id
    private String id;
    @Column
    private String deliveryOptionId;
    @Column
    private String totalAmount;
    @Column
    private String packageId;
    @Column
    private String shippingType;
    @Column
    private String status ;
    @Column
    private String trackingNumber;
    @Column
    private Long createTime;

    @OneToOne(cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetails> orderDetailsList = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "shop_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Shop shop;

    @Transient
    @JsonProperty("shopId")
    public Long getShopId() {
        return shop.getId();
    }
    @Transient
    @JsonProperty("shopNote")
    public String getShopNote() {
        return shop.getNote();
    }


}
