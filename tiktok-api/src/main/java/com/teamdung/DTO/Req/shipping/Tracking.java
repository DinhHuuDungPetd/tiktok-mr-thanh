package com.teamdung.DTO.Req.shipping;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tracking {
    Long shopId;
    String orderId;
    String trackingId;
    String shippingId;
}
