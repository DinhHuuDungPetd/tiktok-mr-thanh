package com.teamdung.DTO.Res.Webhook;

import lombok.Data;

@Data
public class ReturnData {
    private String order_id;
    private String return_role;
    private String return_type;
    private String return_status;
    private String returnId;
    private long createTime;
    private long updateTime;
}