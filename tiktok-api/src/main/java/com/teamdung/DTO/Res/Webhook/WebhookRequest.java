package com.teamdung.DTO.Res.Webhook;

import lombok.Data;

@Data
public class WebhookRequest <T> {
    private int type;
    private String tts_notification_id;
    private String shop_id;
    private long timestamp;
    private T data;
}
