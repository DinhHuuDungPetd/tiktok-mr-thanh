package com.teamdung.DTO.Res.Webhook;

import lombok.Data;

@Data
public class CancelData {
    public String order_id;
    public String cancellations_role;
    public String cancel_status;
    public String cancel_id;
    public long create_time;
}
