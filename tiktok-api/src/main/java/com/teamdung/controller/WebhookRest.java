package com.teamdung.controller;

import Utils.Enum.EnventType;
import com.teamdung.DTO.Req.NotificationsReq;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.entity.Webhooks;
import com.teamdung.service.WebhooksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.util.Map;

@RestController
@RequestMapping("/auth/webhook")
public class WebhookRest {

    @Autowired
    WebhooksService webhooksService;

    @GetMapping("/list")
    public ResponseEntity<?> getList() {
        return ApiResponse.success("Thành công", webhooksService.getWebhooks());
    }


    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody Webhooks webhooks) {

        try {
            return ApiResponse.success("Update webhook",  webhooksService.addWebhooksForShop(webhooks.getUrl(), EnventType.valueOf(webhooks.getEventType())));
        }catch (ApiException | RuntimeException e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update-notification")
    public ResponseEntity<?> updateNotification(@RequestBody NotificationsReq notificationsReq) {
        try {
            webhooksService.addNotifications(notificationsReq);
            return ApiResponse.success("Update notification", null);
        }catch (RuntimeException e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/delete-notification")
    public ResponseEntity<?> deleteNotification(@RequestBody Map<String, String> nap) {
        try {
            Long categoryId = Long.parseLong(nap.get("categoryId"));
            EnventType eventType = EnventType.valueOf(nap.get("eventType"));
            webhooksService.deleteTelegram(categoryId, eventType);
            return ApiResponse.success("Delete notification", null);
        }catch (RuntimeException e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error("Lỗi", Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
