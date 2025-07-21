package com.teamdung.service;

import Utils.DefaultClient;
import Utils.Enum.EnventType;
import Utils.Enum.Role;
import Utils.GroupedLineItem;
import com.teamdung.DTO.Req.NotificationsReq;
import com.teamdung.DTO.Res.LineItemNote;
import com.teamdung.DTO.Res.NoteOrder;
import com.teamdung.DTO.Res.Webhook.*;
import com.teamdung.entity.*;
import com.teamdung.repository.CategoryRepo;
import com.teamdung.repository.ShopRepo;
import com.teamdung.repository.TelegramRepo;
import com.teamdung.repository.WebhooksRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tiktokshop.open.sdk_java.api.EventV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Event.V202309.*;
import tiktokshop.open.sdk_java.model.Order.V202309.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Service
public class WebhooksService {

    private static final int THREAD_POOL_SIZE = 3; // Số luồng xử lý đồng thời

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private LoginService loginService;

    @Autowired
    private ShopRepo shopRepo;

    @Autowired
    private ShopService shopService;

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private TelegramRepo telegramRepo;

    @Autowired
    private WebhooksRepo webhooksRepo;

    @Autowired
    private ShopBaseService shopBaseService;

    @Autowired
    private NoteOrderService noteOrderService;

    @Autowired
    private OrderSevice orderSevice;

    @Value("${api.content-type:application/json}")
    private String contentType;

    private final EventV202309Api api;
    private final ExecutorService executorService;

    public WebhooksService() {
        this.api = new EventV202309Api(DefaultClient.getApiClient());
        this.executorService = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
    }

    /**
     * Lấy danh sách tất cả webhooks.
     *
     * @return Danh sách webhooks
     */
    public List<Webhooks> getWebhooks() {
        log.info("Lấy danh sách tất cả webhooks");
        return webhooksRepo.findAll();
    }

    /**
     * Thêm webhook cho tất cả shop.
     *
     * @param url       URL của webhook
     * @param eventType Loại sự kiện
     * @return Danh sách lỗi (nếu có)
     * @throws ApiException Nếu có lỗi khi gọi API
     */
    public List<String> addWebhooksForShop(String url, EnventType eventType) throws ApiException {
        if (url == null || url.trim().isEmpty()) {
            throw new IllegalArgumentException("URL không được để trống");
        }
        if (eventType == null) {
            throw new IllegalArgumentException("EventType không được để trống");
        }

        log.info("Thêm webhook cho tất cả shop, URL: {}, EventType: {}", url, eventType);

        List<Shop> shops = shopRepo.findAll();
        List<String> errors = new ArrayList<>();

        // Xử lý song song cho từng shop
        List<CompletableFuture<Void>> futures = shops.stream()
                .map(shop -> CompletableFuture.runAsync(() -> {
                    try {
                        UpdateShopWebhookRequestBody body = new UpdateShopWebhookRequestBody();
                        body.setAddress(url);
                        body.setEventType(eventType.toString());
                        api.event202309WebhooksPut(shop.getAccessToken(), contentType, shop.getCipher(), body);
                    } catch (ApiException e) {
                        synchronized (errors) {
                            errors.add(shop.getNote() + " : " + e.getMessage());
                        }
                        log.error("Lỗi khi thêm webhook cho shop {}: {}", shop.getNote(), e.getMessage(), e);
                    }
                }, executorService))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        // Lưu webhook vào database
        CompletableFuture.runAsync(() -> {
            Optional<Webhooks> webhooks = webhooksRepo.findByEventType(eventType.toString());
            Webhooks webhook = webhooks.orElseGet(Webhooks::new);
            webhook.setUrl(url);
            webhook.setEventType(eventType.toString());
            webhooksRepo.save(webhook);
            log.info("Lưu webhook thành công, URL: {}, EventType: {}", url, eventType);
        }, executorService);

        return errors;
    }

    /**
     * Lấy thông tin webhook của tất cả shop.
     *
     * @return Map chứa thông tin webhook và danh sách lỗi
     * @throws ApiException Nếu có lỗi khi gọi API
     */
    public Map<String, Object> getWebhooksForShop() throws ApiException {
        log.info("Lấy thông tin webhook của tất cả shop");

        List<Shop> shops = shopRepo.findAll();
        List<String> errors = new ArrayList<>();
        Map<String, Object> responses = new HashMap<>();

        List<CompletableFuture<Void>> futures = shops.stream()
                .map(shop -> CompletableFuture.runAsync(() -> {
                    try {
                        GetShopWebhooksResponse response = api.event202309WebhooksGet(
                                shop.getAccessToken(), contentType, shop.getCipher()
                        );
                        synchronized (responses) {
                            responses.put(shop.getNote(), response);
                        }
                    } catch (ApiException e) {
                        synchronized (errors) {
                            errors.add(shop.getNote() + " : " + e.getMessage());
                        }
                        log.error("Lỗi khi lấy webhook cho shop {}: {}", shop.getNote(), e.getMessage(), e);
                    }
                }, executorService))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        responses.put("error", errors);
        return responses;
    }

    /**
     * Xóa webhook của một shop.
     *
     * @param shopId    ID của shop
     * @param eventType Loại sự kiện
     * @return Kết quả xóa webhook
     * @throws ApiException Nếu có lỗi khi gọi API
     */
    public DeleteShopWebhookResponse deleteWebhooksForShop(Long shopId, EnventType eventType) throws ApiException {
        if (shopId == null) {
            throw new IllegalArgumentException("Shop ID không được để trống");
        }
        if (eventType == null) {
            throw new IllegalArgumentException("EventType không được để trống");
        }

        log.info("Xóa webhook cho shop ID: {}, EventType: {}", shopId, eventType);

        Shop shop = shopRepo.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop không tồn tại với ID: " + shopId));

        DeleteShopWebhookRequestBody body = new DeleteShopWebhookRequestBody();
        body.setEventType(eventType.toString());
        DeleteShopWebhookResponse response = api.event202309WebhooksDelete(
                shop.getAccessToken(), contentType, shop.getCipher(), body
        );

        log.info("Xóa webhook thành công cho shop ID: {}, EventType: {}", shopId, eventType);
        return response;
    }

    /**
     * Thêm thông báo cho một danh mục.
     *
     * @param notificationsReq Yêu cầu thêm thông báo
     * @throws RuntimeException Nếu không có quyền hoặc có lỗi
     */
    public void addNotifications(NotificationsReq notificationsReq) {
        if (notificationsReq == null || notificationsReq.getCategoryId() == null ||
                notificationsReq.getEventType() == null || notificationsReq.getTokenId() == null ||
                notificationsReq.getChatId() == null) {
            throw new IllegalArgumentException("Thông tin thông báo không được để trống");
        }

        log.info("Thêm thông báo cho danh mục ID: {}, EventType: {}", notificationsReq.getCategoryId(), notificationsReq.getEventType());

        Category category = categoryRepo.findById(notificationsReq.getCategoryId())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy danh mục với ID: " + notificationsReq.getCategoryId()));

        User user = loginService.getAccountLogin();
        validateUserPermission(user, category);

        String message = String.format(
                "Check thành công với thông báo %s cho danh mục %s",
                notificationsReq.getEventType(), category.getName()
        );

        boolean check = telegramService.sendMessage(
                message, notificationsReq.getTokenId().trim(), notificationsReq.getChatId().trim()
        );
        if (!check) {
            throw new RuntimeException("Có lỗi xảy ra khi gửi thông báo Telegram");
        }

        Telegram telegram = category.getTelegramList().stream()
                .filter(item -> item.getEventType().equals(notificationsReq.getEventType().toString().trim()))
                .findFirst()
                .orElse(new Telegram());

        telegram.setChatId(notificationsReq.getChatId().trim());
        telegram.setToken(notificationsReq.getTokenId().trim());
        telegram.setCategory(category);
        telegram.setEventType(notificationsReq.getEventType().toString());
        telegramRepo.save(telegram);

        log.info("Thêm thông báo thành công cho danh mục ID: {}", notificationsReq.getCategoryId());
    }

    /**
     * Xóa thông báo Telegram của một danh mục.
     *
     * @param categoryId ID của danh mục
     * @param eventType  Loại sự kiện
     * @throws RuntimeException Nếu không có quyền hoặc không tìm thấy danh mục
     */
    public void deleteTelegram(Long categoryId, EnventType eventType) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Category ID không được để trống");
        }
        if (eventType == null) {
            throw new IllegalArgumentException("EventType không được để trống");
        }

        log.info("Xóa thông báo Telegram cho danh mục ID: {}, EventType: {}", categoryId, eventType);

        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy danh mục với ID: " + categoryId));

        User user = loginService.getAccountLogin();
        validateUserPermission(user, category);

        Telegram telegram = category.getTelegramList().stream()
                .filter(item -> item.getEventType().equals(eventType.toString().trim()))
                .findFirst()
                .orElse(null);

        if (telegram == null) {
            log.warn("Không tìm thấy thông báo Telegram cho danh mục ID: {}, EventType: {}", categoryId, eventType);
            return;
        }

        telegram.setChatId(null);
        telegram.setToken(null);
        telegram.setCategory(category);
        telegramRepo.save(telegram);

        log.info("Xóa thông báo Telegram thành công cho danh mục ID: {}", categoryId);
    }

    /**
     * Xử lý thông báo đơn hàng từ webhook.
     *
     * @param request Yêu cầu webhook
     */
    @Transactional
    public void handleNotificationOrder(WebhookRequest<OrderData> request) {
        if (request == null || request.getShop_id() == null || request.getData() == null) {
            log.error("Yêu cầu webhook không hợp lệ: {}", request);
            return;
        }

        String shopId = request.getShop_id();
        String orderId = request.getData().getOrder_id();
        String orderStatus = request.getData().getOrder_status();
        log.info("Xử lý thông báo đơn hàng, Shop ID: {}, Order ID: {}, Status: {}", shopId, orderId, orderStatus);

        Shop shop = getShop(shopId);

        CompletableFuture<Void> notificationFuture = CompletableFuture.runAsync(() -> {
            if ("ON_HOLD".equals(orderStatus)) {
                sendOrderNotification(shop, orderId, "On hold", EnventType.ORDER_STATUS_CHANGE);
            } else {
                processOrderDetails(shop, shopId, orderId, orderStatus);
            }
        }, executorService);

        CompletableFuture<Void> orderUpdateFuture = CompletableFuture.runAsync(() -> {
            try {
                shopBaseService.callAllOrdersByOrderId(shopId, orderId);
            } catch (ApiException e) {
                log.error("Lỗi khi gọi API đơn hàng, Shop ID: {}, Order ID: {}", shopId, orderId, e);
            }
        }, executorService);

        CompletableFuture.allOf(notificationFuture, orderUpdateFuture).join();
    }

    /**
     * Xử lý thông báo hoàn tiền từ webhook.
     *
     * @param request Yêu cầu webhook
     */
    @Transactional
    public void handleNotificationRefund(WebhookRequest<ReturnData> request) {
        if (request == null || request.getShop_id() == null || request.getData() == null) {
            log.error("Yêu cầu webhook không hợp lệ: {}", request);
            return;
        }

        String shopId = request.getShop_id();
        String orderId = request.getData().getOrder_id();
        String returnStatus = request.getData().getReturn_status();
        log.info("Xử lý thông báo hoàn tiền, Shop ID: {}, Order ID: {}, Status: {}", shopId, orderId, returnStatus);

        Shop shop = getShop(shopId);

        if ("RETURN_OR_REFUND_REQUEST_PENDING".equals(returnStatus)) {
            String message = String.format(
                    "<b>Thông báo ĐƠN HÀNG REFUND</b>\n" +
                            "<b>Tài khoản:</b> <i>%s</i>\n" +
                            "<b>Mã đơn hàng:</b> <code>%s</code>\n" +
                            "<b>Trạng thái:</b> <code>%s</code>\n" +
                            "<b>Loại:</b> <code>%s</code>\n" +
                            "Vui lòng kiểm tra ngay!\n",
                    shop.getNote(), orderId, "RETURN_OR_REFUND_REQUEST_PENDING", request.getData().getReturn_type()
            );
            sendNotification(shop, message, EnventType.RETURN_STATUS_CHANGE);
        }
    }

    /**
     * Xử lý thông báo hủy đơn hàng từ webhook.
     *
     * @param request Yêu cầu webhook
     */
    @Transactional
    public void handleNotificationCancel(WebhookRequest<CancelData> request) {
        if (request == null || request.getShop_id() == null || request.getData() == null) {
            log.error("Yêu cầu webhook không hợp lệ: {}", request);
            return;
        }

        String shopId = request.getShop_id();
        String orderId = request.getData().getOrder_id();
        String cancelStatus = request.getData().getCancel_status();
        log.info("Xử lý thông báo hủy đơn hàng, Shop ID: {}, Order ID: {}, Status: {}", shopId, orderId, cancelStatus);

        Shop shop = getShop(shopId);

        if ("CANCELLATION_REQUEST_PENDING".equals(cancelStatus)) {
            String message = String.format(
                    "<b>Thông báo ĐƠN HÀNG CANCEL</b>\n" +
                            "<b>Tài khoản:</b> <i>%s</i>\n" +
                            "<b>Mã đơn hàng:</b> <code>%s</code>\n" +
                            "<b>Trạng thái:</b> <code>%s</code>\n" +
                            "<b>Do:</b> <code>%s</code>\n" +
                            "Vui lòng kiểm tra ngay!\n",
                    shop.getNote(), orderId, "CANCELLATION_REQUEST_PENDING", request.getData().getCancellations_role()
            );
            sendNotification(shop, message, EnventType.CANCELLATION_STATUS_CHANGE);
        }
    }

    /**
     * Xử lý thông báo sản phẩm thất bại từ webhook.
     *
     * @param request Yêu cầu webhook
     */
    @Transactional
    public void handleNotificationProductFail(WebhookRequest<ProductData> request) {
        if (request == null || request.getShop_id() == null || request.getData() == null) {
            log.error("Yêu cầu webhook không hợp lệ: {}", request);
            return;
        }

        String shopId = request.getShop_id();
        String productId = request.getData().getProduct_id();
        String productStatus = request.getData().getStatus();
        log.info("Xử lý thông báo sản phẩm thất bại, Shop ID: {}, Product ID: {}, Status: {}", shopId, productId, productStatus);

        Shop shop = getShop(shopId);

        if ("PRODUCT_AUDIT_FAILURE".equals(productStatus)) {
            String message = String.format(
                    "<b>Thông báo sản phẩm bị fail</b>\n" +
                            "<b>Tài khoản:</b> <i>%s</i>\n" +
                            "<b>Id sản phẩm:</b> <code>%s</code>\n" +
                            "<b>Lý do:</b> <code>%s</code>\n" +
                            "Vui lòng kiểm tra ngay!\n",
                    shop.getNote(), productId, request.getData().getSuspended_reason()
            );
            sendNotification(shop, message, EnventType.PRODUCT_STATUS_CHANGE);
        }
    }

    /**
     * Gửi thông báo đơn hàng.
     *
     * @param shop      Shop liên quan
     * @param orderId   ID của đơn hàng
     * @param status    Trạng thái đơn hàng
     * @param eventType Loại sự kiện
     */
    private void sendOrderNotification(Shop shop, String orderId, String status, EnventType eventType) {
        String message = String.format(
                "<b>Thông báo đơn hàng mới</b> 📦\n" +
                        "<b>Tài khoản:</b> <i>%s</i>\n" +
                        "<b>Mã đơn hàng:</b> <code>%s</code>\n" +
                        "<b>Trạng thái:</b> <i>%s</i>\n" +
                        "Vui lòng kiểm tra ngay!\n",
                shop.getNote(), orderId, status
        );
        sendNotification(shop, message, eventType);
    }

    /**
     * Gửi thông báo Telegram.
     *
     * @param shop      Shop liên quan
     * @param message   Nội dung thông báo
     * @param eventType Loại sự kiện
     */
    private void sendNotification(Shop shop, String message, EnventType eventType) {
        List<Telegram> telegrams = getTelegramsByType(shop, eventType.toString());
        telegrams.forEach(telegram -> {
            try {
                telegramService.sendMessage(message, telegram.getToken(), telegram.getChatId());
                log.info("Gửi thông báo Telegram thành công: {}", message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo Telegram cho shop {}: {}", shop.getNote(), e.getMessage(), e);
            }
        });
    }

    /**
     * Xử lý chi tiết đơn hàng.
     *
     * @param shop       Shop liên quan
     * @param shopId     ID của shop
     * @param orderId    ID của đơn hàng
     * @param orderStatus Trạng thái đơn hàng
     */
    private void processOrderDetails(Shop shop, String shopId, String orderId, String orderStatus) {
        try {
            GetOrderDetailResponse response = shopService.getOrdersDetails(shopId, orderId);
            if (response == null || response.getCode() != 0) {
                log.warn("Không nhận được dữ liệu chi tiết đơn hàng, Shop ID: {}, Order ID: {}", shopId, orderId);
                return;
            }

            GetOrderDetailResponseDataOrders orders = response.getData().getOrders().get(0);
            String createdAt = getNowDateTime();
            String account = shop.getNote();
            String totalAmount = orders.getPayment().getTotalAmount();
            String address = formatAddress(orders.getRecipientAddress());
            NoteOrder noteOrder = new NoteOrder();
            noteOrder.setAccount(account);
            noteOrder.setCreatedAt(createdAt);
            noteOrder.setAddress(address);
            noteOrder.setTotalPrice(totalAmount);
            noteOrder.setOrderId(orderId);
            noteOrder.setStatus(orderStatus);

            List<LineItemNote> lineItemNoteList = new ArrayList<>();
            List<GroupedLineItem> groupedLineItems = GroupedLineItem.groupLineItemsBySkuId(orders.getLineItems());

            for (GroupedLineItem groupedLineItem : groupedLineItems) {
                LineItemNote lineItemNote = new LineItemNote();
                lineItemNote.setImageUrl(groupedLineItem.getLineItem().getSkuImage());
                lineItemNote.setProductName(groupedLineItem.getLineItem().getProductName());
                lineItemNote.setProductSKUName(groupedLineItem.getLineItem().getSkuName());
                lineItemNote.setQuantity(groupedLineItem.getCount());
                lineItemNoteList.add(lineItemNote);
            }

            noteOrder.setLineItemNoteList(lineItemNoteList);
            processNoteOrder(shop, orders, orderStatus, noteOrder);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý chi tiết đơn hàng, Shop ID: {}, Order ID: {}", shopId, orderId, e);
        }
    }

    /**
     * Xử lý ghi chú đơn hàng.
     *
     * @param shop        Shop liên quan
     * @param orders      Dữ liệu đơn hàng
     * @param orderStatus Trạng thái đơn hàng
     * @param noteOrder   Ghi chú đơn hàng
     */

     private void processNoteOrder(Shop shop, GetOrderDetailResponseDataOrders orders, String orderStatus, NoteOrder noteOrder) {
        for (Category category : shop.getCategorySet()) {

            if (category.getNoteUrl() == null || category.getNoteUrl().trim().isEmpty()) {
                continue;
            }
            try {
                if (category.getAutoGetLabel() && "TIKTOK".equals(orders.getShippingType()) && "AWAITING_SHIPMENT".equals(orderStatus)) {
                    String label = orderSevice.getUrlLabelAuto(shop.getId(), noteOrder.getOrderId());
                    String url = GoogleDriveUploader.uploadFileFromUrl(label, noteOrder.getOrderId(), category.getFolderId());
                    noteOrder.setUrlLabel(url);
                }
                noteOrderService.note(noteOrder, category.getNoteUrl());
            } catch (Exception e) {
                log.error("Lỗi khi xử lý ghi chú đơn hàng, Order ID: {}, Category: {}", noteOrder.getOrderId(), category.getName(), e);
            }
        }
    }

    /**
     * Lấy shop theo ID và tải dữ liệu liên quan.
     *
     * @param shopId ID của shop
     * @return Shop
     * @throws RuntimeException Nếu không tìm thấy shop
     */
    public Shop getShop(String shopId) {
        Shop shop = shopRepo.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Shop không tồn tại với ID: " + shopId));

        if (shop.getCategorySet() != null) {
            shop.getCategorySet().forEach(category -> {
                if (category.getTelegramList() != null) {
                    category.getTelegramList().size(); // Buộc tải telegramList
                }
            });
        }
        return shop;
    }

    /**
     * Lấy danh sách Telegram theo loại sự kiện.
     *
     * @param shop Shop liên quan
     * @param type Loại sự kiện
     * @return Danh sách Telegram
     */
    private List<Telegram> getTelegramsByType(Shop shop, String type) {
        return shop.getCategorySet().stream()
                .flatMap(category -> category.getTelegramList().stream())
                .filter(telegram -> telegram.getEventType() != null && telegram.getEventType().equals(type))
                .collect(Collectors.toList());
    }

    /**
     * Lấy ngày hiện tại dưới dạng chuỗi.
     *
     * @return Ngày hiện tại (MM/dd/yyyy)
     */
    public String getNowDateTime() {
        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
        return currentDate.format(formatter);
    }

    /**
     * Định dạng địa chỉ từ dữ liệu API.
     *
     * @param address Dữ liệu địa chỉ
     * @return Địa chỉ đã định dạng
     */
    private String formatAddress(GetOrderDetailResponseDataOrdersRecipientAddress address) {
        if (address == null) {
            return "";
        }

        StringBuilder formattedAddress = new StringBuilder();
        formattedAddress.append(address.getFirstName()).append(" ").append(address.getLastName()).append("\n");
        formattedAddress.append(address.getPhoneNumber()).append("\n");
        formattedAddress.append(address.getAddressDetail()).append("\n");

        String city = "";
        String state = "";
        String country = "";
        for (GetOrderDetailResponseDataOrdersRecipientAddressDistrictInfo info : address.getDistrictInfo()) {
            switch (info.getAddressLevelName()) {
                case "City":
                    city = info.getAddressName();
                    break;
                case "State":
                    state = info.getAddressName();
                    break;
                case "Country":
                    country = info.getAddressName();
                    break;
            }
        }

        formattedAddress.append(city).append(", ").append(state).append(", ").append(country).append("\n\n");
        formattedAddress.append(address.getPostalCode());
        return formattedAddress.toString();
    }

    /**
     * Kiểm tra quyền của người dùng.
     *
     * @param user     Người dùng
     * @param category Danh mục
     * @throws RuntimeException Nếu không có quyền
     */
    private void validateUserPermission(User user, Category category) {
        if (user.getRole().equals(Role.EMPLOYEE.toString())) {
            throw new RuntimeException("Bạn không có quyền!");
        }

        if (user.getRole().equals(Role.OWNER.toString())) {
            Owner owner = category.getOwner();
            if (!Objects.equals(user.getOwner().getId(), owner.getId())) {
                throw new RuntimeException("Bạn không có quyền!");
            }
        }
    }
}