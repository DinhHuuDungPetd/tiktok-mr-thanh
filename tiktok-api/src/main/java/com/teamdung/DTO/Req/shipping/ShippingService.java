package com.teamdung.DTO.Req.shipping;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShippingService {
    String orderId;
    Long shopId;
    Weight weight;
    Dimension dimension;
    String shippingServiceId;
}
