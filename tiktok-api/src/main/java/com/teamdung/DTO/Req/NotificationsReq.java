package com.teamdung.DTO.Req;

import Utils.Enum.EnventType;
import lombok.Data;

@Data
public class NotificationsReq {
    Long categoryId;
    String chatId;
    String tokenId;
    EnventType eventType;
}
