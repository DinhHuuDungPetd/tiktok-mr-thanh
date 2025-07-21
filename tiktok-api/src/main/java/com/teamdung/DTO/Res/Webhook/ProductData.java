package com.teamdung.DTO.Res.Webhook;

import lombok.Data;

@Data
public class ProductData {

    public String product_id;
    public String status;
    public String suspended_reason;
    public long update_time;
}
