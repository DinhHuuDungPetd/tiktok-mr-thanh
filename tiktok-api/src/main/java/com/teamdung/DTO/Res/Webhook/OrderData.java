package com.teamdung.DTO.Res.Webhook;

import lombok.Data;

@Data
public class OrderData {
    private String order_id;
    private String order_status;
    private String is_on_hold_order;
    private long update_time;
}
