package com.teamdung.service;

import Utils.DefaultClient;
import com.teamdung.entity.Shop;
import com.teamdung.entity.Webhooks;
import com.teamdung.repository.WebhooksRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.api.EventV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Event.V202309.UpdateShopWebhookRequestBody;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Service
public class WebhookBaseService {

    private static final int THREAD_POOL_SIZE = 10; // Số luồng xử lý đồng thời

    @Value("${api.content-type:application/json}")
    private String contentType;

    @Value("${telegram.chat-id:6399771143}")
    private String defaultChatId;

    @Value("${telegram.token:7841466545:AAErgah5uxcarX0DfCh_PxOdda9zvi1VHGA}")
    private String defaultToken;

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private WebhooksRepo webhooksRepo;

    private final EventV202309Api api;
    private final ExecutorService executorService;

    public WebhookBaseService() {
        this.api = new EventV202309Api(DefaultClient.getApiClient());
        this.executorService = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
    }

    /**
     * Xử lý khi thêm một shop mới, tự động thêm các webhook đã cấu hình.
     *
     * @param shop Shop cần thêm webhook
     * @throws IllegalArgumentException Nếu shop không hợp lệ
     */
    public void handleWhenAddShop(Shop shop) {
        if (shop == null || shop.getAccessToken() == null || shop.getCipher() == null || shop.getNote() == null) {
            log.error("Shop không hợp lệ: {}", shop);
            throw new IllegalArgumentException("Shop không hợp lệ");
        }

        log.info("Bắt đầu xử lý thêm webhook cho shop: {}", shop.getNote());

        List<Webhooks> webhooks = webhooksRepo.findAll();
        if (webhooks.isEmpty()) {
            log.warn("Không tìm thấy webhook nào để thêm cho shop: {}", shop.getNote());
            sendTelegramNotification("Không tìm thấy webhook nào để thêm cho shop: " + shop.getNote());
            return;
        }

        // Xử lý song song cho từng webhook
        List<CompletableFuture<Void>> futures = webhooks.stream()
                .map(webhook -> CompletableFuture.runAsync(() -> processWebhookForShop(shop, webhook), executorService))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .exceptionally(throwable -> {
                    log.error("Lỗi chung khi xử lý webhook cho shop {}: {}", shop.getNote(), throwable.getMessage(), throwable);
                    sendTelegramNotification("Lỗi chung khi xử lý webhook cho shop " + shop.getNote() + ": " + throwable.getMessage());
                    return null;
                })
                .join();
    }

    /**
     * Xử lý thêm một webhook cho shop.
     *
     * @param shop    Shop cần thêm webhook
     * @param webhook Webhook cần thêm
     */
    private void processWebhookForShop(Shop shop, Webhooks webhook) {
        try {
            UpdateShopWebhookRequestBody body = new UpdateShopWebhookRequestBody();
            body.setAddress(webhook.getUrl());
            body.setEventType(webhook.getEventType());

            api.event202309WebhooksPut(shop.getAccessToken(), contentType, shop.getCipher(), body);
            log.info("Thêm thành công webhook {} cho shop {}", webhook.getEventType(), shop.getNote());
            sendTelegramNotification("Add thành công webhook " + webhook.getEventType() + " cho shop " + shop.getNote());

        } catch (ApiException e) {
            log.error("Lỗi khi thêm webhook {} cho shop {}: {}", webhook.getEventType(), shop.getNote(), e.getMessage(), e);
            sendTelegramNotification("Lỗi khi thêm webhook " + webhook.getEventType() + " cho shop " + shop.getNote() + ": " + e.getMessage());
        }
    }

    /**
     * Gửi thông báo qua Telegram.
     *
     * @param message Nội dung thông báo
     */
    private void sendTelegramNotification(String message) {
        try {
            telegramService.sendMessage(message, defaultChatId, defaultToken);
            log.info("Gửi thông báo Telegram thành công: {}", message);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo Telegram: {}", e.getMessage(), e);
        }
    }
}