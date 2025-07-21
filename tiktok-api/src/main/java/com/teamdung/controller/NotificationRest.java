package com.teamdung.controller;

import com.teamdung.DTO.Res.Webhook.*;
import com.teamdung.service.WebhooksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification")
public class NotificationRest {

    @Autowired
    WebhooksService webhooksService;


    @PostMapping("/order")
    public ResponseEntity<?> notificationOrder(@RequestBody WebhookRequest<OrderData> request ) {
        try {
            webhooksService.handleNotificationOrder(request);
            return ResponseEntity.status(HttpStatus.OK).body("OK");
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/refund")
    public ResponseEntity<?> handleRefundWebhook(@RequestBody WebhookRequest<ReturnData> request) {
        try {
            webhooksService.handleNotificationRefund(request);
            return ResponseEntity.status(HttpStatus.OK).body("OK");
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> handleCancelWebhook(@RequestBody WebhookRequest<CancelData> request) {
        try {
            webhooksService.handleNotificationCancel(request);
            return ResponseEntity.status(HttpStatus.OK).body("OK");
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/product-fail")
    public ResponseEntity<?> handleProductFailWebhook(@RequestBody WebhookRequest<ProductData> request) {
        try {
            webhooksService.handleNotificationProductFail(request);
            return ResponseEntity.status(HttpStatus.OK).body("OK");
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
