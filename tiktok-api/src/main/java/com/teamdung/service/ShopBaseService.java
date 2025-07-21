package com.teamdung.service;

import com.teamdung.entity.Order.Address;
import com.teamdung.entity.Order.OrderDetails;
import com.teamdung.entity.Order.Orders;
import com.teamdung.entity.Shop;
import com.teamdung.entity.User;
import com.teamdung.repository.OrdersRepo;
import com.teamdung.repository.ShopRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tiktokshop.open.sdk_java.api.OrderV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Order.V202309.*;
import Utils.DefaultClient;
import Utils.Enum.Role;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class ShopBaseService {

    private static final Logger logger = LoggerFactory.getLogger(ShopBaseService.class);
    private static final int THREAD_POOL_SIZE = 10; // Số luồng xử lý đồng thời
    private static final int PAGE_SIZE = 100; // Kích thước trang mặc định
    private static final long CREATE_TIME_GE = 1738489423L; // Thời gian tạo đơn hàng tối thiểu

    @Autowired
    private ShopRepo shopRepo;

    @Autowired
    private LoginService loginService;

    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    private TelegramService telegramService;

    @Value("${telegram.default.token:7841466545:AAErgah5uxcarX0DfCh_PxOdda9zvi1VHGA}")
    private String defaultTelegramToken;

    @Value("${telegram.default.chat-id:6399771143}")
    private String defaultTelegramChatId;

    @Value("${tiktokshop.app-key:6fikpg3c9k15h}")
    private String appKey;

    @Value("${tiktokshop.app-secret:559f7ecd7df57f73118f3b499c6c9d0592c84963}")
    private String appSecret;

    private final OrderV202309Api api;
    private final ExecutorService executorService;

    public ShopBaseService() {
        this.api = new OrderV202309Api(DefaultClient.getApiClient());
        this.executorService = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
    }

    public void UpdateName(Long id, String name) {
        logger.info("Cập nhật tên cho shop ID: {}, tên mới: {}", id, name);

        Shop shop = shopRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop với ID: " + id));

        User user = loginService.getAccountLogin();
        if (!user.getRole().equals(Role.ADMIN.toString()) && !user.getShopSet().contains(shop)) {
            throw new RuntimeException("Bạn không có quyền truy cập shop này!");
        }

        shop.setNote(name);
        shopRepo.save(shop);
        logger.info("Cập nhật tên shop thành công: {}", name);
    }
    @Transactional
    public void callAllOrdersByShops(List<Shop> shops) {
        logger.info("Bắt đầu lấy đơn hàng cho {} shop", shops.size());

        List<CompletableFuture<Void>> futures = shops.stream()
                .map(shop -> CompletableFuture.runAsync(() -> {
                    try {
                        callAllOrderByShop(shop);
                    } catch (ApiException e) {
                        logger.error("Lỗi khi lấy đơn hàng cho shop {}: {}", shop.getNote(), e.getMessage(), e);
                        sendTelegramNotification("Lỗi khi lấy đơn hàng cho shop " + shop.getNote() + ": " + e.getMessage());
                    }
                }, executorService))
                .collect(Collectors.toList());

        // Chờ tất cả các tác vụ hoàn thành
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        sendTelegramNotification("Hoàn tất lấy đơn hàng cho tất cả shop");
        logger.info("Hoàn tất lấy đơn hàng cho tất cả shop");
    }
    @Transactional
    public void callAllOrderByShop(Shop shop) throws ApiException {
        logger.info("Bắt đầu lấy đơn hàng cho shop: {}", shop.getNote());

        String pageToken = null;
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();

        do {
            GetOrderListRequestBody body = new GetOrderListRequestBody();
            body.setCreateTimeGe(CREATE_TIME_GE);
            GetOrderListResponse response = api.order202309OrdersSearchPost(
                    PAGE_SIZE, xTtsAccessToken, "application/json", null, pageToken, null, shopCipher, body
            );

            GetOrderListResponseData data = response.getData();
            if (data != null && data.getOrders() != null) {
                Set<Orders> ordersSet = data.getOrders().stream()
                        .map(order -> convertToOrderEntity(order, shop))
                        .collect(Collectors.toSet());
                ordersRepo.saveAll(ordersSet);
                pageToken = data.getNextPageToken();
            } else {
                pageToken = null;
            }
        } while (pageToken != null && !pageToken.isEmpty());

        sendTelegramNotification("Thành công: " + shop.getNote());
        logger.info("Hoàn tất lấy đơn hàng cho shop: {}", shop.getNote());
    }

    @Transactional
    public void callAllOrdersByOrderId(String shopId, String orderId) throws ApiException {
        if (shopId == null || shopId.trim().isEmpty() || orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("Shop ID và Order ID không được để trống");
        }

        Shop shop = shopRepo.findByShopId(shopId)
                .orElseThrow(() -> new ApiException("Shop không tồn tại với ID: " + shopId));
        logger.info("Bắt đầu xử lý đơn hàng {} cho shop {}", orderId, shop.getNote());

        try {
            GetOrderDetailResponse response = api.order202309OrdersGet(
                    List.of(orderId), shop.getAccessToken(), "application/json", shop.getCipher()
            );

            if (response == null || response.getData() == null || response.getData().getOrders() == null) {
                throw new ApiException("Không nhận được dữ liệu từ API cho đơn hàng: " + orderId);
            }

            GetOrderDetailResponseData data = response.getData();
            if (data.getOrders().isEmpty()) {
                throw new ApiException("Danh sách đơn hàng rỗng từ API cho đơn hàng: " + orderId);
            }

            GetOrderDetailResponseDataOrders order = data.getOrders().get(0);
            Orders orderCall = mapToOrders(shop, order);
            saveOrUpdateOrder(orderCall, shop);

        } catch (ApiException e) {
            logger.error("Lỗi khi xử lý đơn hàng {} cho shop {}: {}", orderId, shop.getNote(), e.getMessage());
            sendTelegramNotification("Lỗi khi xử lý đơn hàng " + shop.getNote() + ": " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi xử lý đơn hàng {} cho shop {}: {}", orderId, shop.getNote(), e.getMessage(), e);
            sendTelegramNotification("Lỗi không xác định khi xử lý đơn hàng " + shop.getNote());
            throw new ApiException(405, e.toString());
        }
    }

    private void saveOrUpdateOrder(Orders orderCall, Shop shop) throws ApiException {
        try {
            Optional<Orders> existingOrder = ordersRepo.findById(orderCall.getId());
            Orders orderToSave;
            String message;

            if (existingOrder.isPresent()) {
                orderToSave = existingOrder.get();
                updateOrderFields(orderToSave, orderCall);
                message = "Cập nhật thành công đơn hàng " + orderCall.getId() + " cho shop " + shop.getNote();
                logger.info(message);
            } else {
                orderToSave = orderCall;
                message = "Lưu thành công đơn hàng mới " + orderCall.getId() + " cho shop " + shop.getNote();
                logger.info(message);
            }

            if (orderToSave.getOrderDetailsList() != null) {
                orderToSave.getOrderDetailsList().forEach(detail -> detail.setOrders(orderToSave));
            }
            ordersRepo.save(orderToSave);

        } catch (Exception e) {
            String errorMessage = "Lỗi khi lưu/cập nhật đơn hàng " + orderCall.getId() + " cho shop " + shop.getNote();
            logger.error("{}: {}", errorMessage, e.getMessage(), e);
            sendTelegramNotification(errorMessage);
            throw new ApiException(405, e.toString());
        }
    }

    private void updateOrderFields(Orders existing, Orders orderCall) {
        existing.setPackageId(orderCall.getPackageId());
        existing.setAddress(orderCall.getAddress());
        existing.setDeliveryOptionId(orderCall.getDeliveryOptionId());
        existing.setTotalAmount(orderCall.getTotalAmount());
        existing.setShippingType(orderCall.getShippingType());
        existing.setTrackingNumber(orderCall.getTrackingNumber());
        existing.setCreateTime(orderCall.getCreateTime());
        existing.setStatus(orderCall.getStatus());
        syncOrderDetailsList(existing, orderCall.getOrderDetailsList());
    }

    private void syncOrderDetailsList(Orders existing, List<OrderDetails> newDetailsList) {
        if (newDetailsList == null) {
            newDetailsList = new ArrayList<>();
        }

        if (existing.getOrderDetailsList() == null) {
            existing.setOrderDetailsList(new ArrayList<>());
        }

        Map<String, OrderDetails> existingDetailsMap = existing.getOrderDetailsList().stream()
                .filter(detail -> detail.getId() != null)
                .collect(Collectors.toMap(OrderDetails::getId, detail -> detail));

        Map<String, OrderDetails> newDetailsMap = newDetailsList.stream()
                .filter(detail -> detail.getId() != null)
                .collect(Collectors.toMap(OrderDetails::getId, detail -> detail));

        // Xóa các phần tử không còn trong danh sách mới
        existing.getOrderDetailsList().removeIf(detail -> {
            if (detail.getId() == null) return false;
            return !newDetailsMap.containsKey(detail.getId());
        });

        // Cập nhật hoặc thêm mới
        for (OrderDetails newDetail : newDetailsList) {
            if (newDetail.getId() != null && existingDetailsMap.containsKey(newDetail.getId())) {
                OrderDetails existingDetail = existingDetailsMap.get(newDetail.getId());
                updateOrderDetailFields(existingDetail, newDetail);
            } else {
                newDetail.setOrders(existing);
                existing.getOrderDetailsList().add(newDetail);
            }
        }
    }

    private void updateOrderDetailFields(OrderDetails existingDetail, OrderDetails newDetail) {
        existingDetail.setProductId(newDetail.getProductId());
        existingDetail.setProductName(newDetail.getProductName());
        existingDetail.setSkuId(newDetail.getSkuId());
        existingDetail.setSkuName(newDetail.getSkuName());
        existingDetail.setSkuImage(newDetail.getSkuImage());
    }

    private Orders convertToOrderEntity(GetOrderListResponseDataOrders order, Shop shop) {
        Orders orderEntity = new Orders();
        orderEntity.setId(order.getId());
        orderEntity.setShop(shop);
        orderEntity.setCreateTime(order.getCreateTime());
        orderEntity.setStatus(order.getStatus());
        orderEntity.setShippingType(order.getShippingType());
        orderEntity.setTrackingNumber(order.getTrackingNumber());
        orderEntity.setDeliveryOptionId(order.getDeliveryOptionId());
        orderEntity.setTotalAmount(Objects.requireNonNull(order.getPayment()).getTotalAmount());

        List<OrderDetails> orderDetailsList = order.getLineItems().stream()
                .map(lineItem -> {
                    OrderDetails orderDetails = new OrderDetails();
                    orderDetails.setId(lineItem.getId());
                    orderDetails.setProductId(lineItem.getProductId());
                    orderDetails.setProductName(lineItem.getProductName());
                    orderDetails.setSkuId(lineItem.getSkuId());
                    orderDetails.setSkuName(lineItem.getSkuName());
                    orderDetails.setSkuImage(lineItem.getSkuImage());
                    orderDetails.setOrders(orderEntity);
                    return orderDetails;
                })
                .collect(Collectors.toList());
        orderEntity.setOrderDetailsList(orderDetailsList);

        orderEntity.setAddress(extractAddress(order));

        List<GetOrderListResponseDataOrdersPackages> packages = order.getPackages();
        if (packages != null && !packages.isEmpty()) {
            orderEntity.setPackageId(packages.get(0).getId());
        }

        return orderEntity;
    }
    private Orders mapToOrders(Shop shop, GetOrderDetailResponseDataOrders order) {
        Orders orderEntity = new Orders();
        orderEntity.setId(order.getId());
        orderEntity.setShop(shop);
        orderEntity.setCreateTime(order.getCreateTime());
        orderEntity.setStatus(order.getStatus());
        orderEntity.setShippingType(order.getShippingType());
        orderEntity.setTrackingNumber(order.getTrackingNumber());
        orderEntity.setDeliveryOptionId(order.getDeliveryOptionId());
        orderEntity.setTotalAmount(Objects.requireNonNull(order.getPayment()).getTotalAmount());

        List<OrderDetails> orderDetailsList = order.getLineItems().stream()
                .map(lineItem -> {
                    OrderDetails orderDetails = new OrderDetails();
                    orderDetails.setId(lineItem.getId());
                    orderDetails.setProductId(lineItem.getProductId());
                    orderDetails.setProductName(lineItem.getProductName());
                    orderDetails.setSkuId(lineItem.getSkuId());
                    orderDetails.setSkuName(lineItem.getSkuName());
                    orderDetails.setSkuImage(lineItem.getSkuImage());
                    orderDetails.setOrders(orderEntity);
                    return orderDetails;
                })
                .collect(Collectors.toList());
        orderEntity.setOrderDetailsList(orderDetailsList);

        orderEntity.setAddress(mapToAddress(order.getRecipientAddress()));

        List<GetOrderDetailResponseDataOrdersPackages> packages = order.getPackages();
        if (packages != null && !packages.isEmpty()) {
            orderEntity.setPackageId(packages.get(0).getId());
        }

        return orderEntity;
    }
    private Address extractAddress(GetOrderListResponseDataOrders order) {
        Address address = new Address();
        GetOrderListResponseDataOrdersRecipientAddress recipientAddress = order.getRecipientAddress();
        address.setName(recipientAddress.getName());
        address.setAddressDetail(recipientAddress.getAddressDetail());
        address.setPostalCode(recipientAddress.getPostalCode());
        address.setPhoneNumber(recipientAddress.getPhoneNumber());
        List<GetOrderListResponseDataOrdersRecipientAddressDistrictInfo> districtInfo = recipientAddress.getDistrictInfo();
        if (districtInfo != null && districtInfo.size() > 3) {
            address.setCountry(districtInfo.get(0).getAddressName());
            address.setState(districtInfo.get(1).getAddressName());
            address.setCity(districtInfo.get(3).getAddressName());
        }
        return address;
    }

    private Address mapToAddress(GetOrderDetailResponseDataOrdersRecipientAddress recipientAddress) {
        Address address = new Address();
        String country = null;
        String state = null;
        String city = null;

        List<GetOrderDetailResponseDataOrdersRecipientAddressDistrictInfo> districtInfo = recipientAddress.getDistrictInfo();
        if (districtInfo != null && !districtInfo.isEmpty()) {
            country = districtInfo.get(0).getAddressName();
            state = districtInfo.get(1).getAddressName();
            if (districtInfo.size() > 3) {
                city = districtInfo.get(3).getAddressName();
            }
        }
        address.setName(recipientAddress.getName());
        address.setAddressDetail(recipientAddress.getAddressDetail());
        address.setCountry(country);
        address.setState(state);
        address.setCity(city);
        address.setPostalCode(recipientAddress.getPostalCode());
        address.setPhoneNumber(recipientAddress.getPhoneNumber());

        return address;
    }

    private void sendTelegramNotification(String message) {
        try {
            String telegramToken = defaultTelegramToken;
            String chatId =defaultTelegramChatId;

            telegramService.sendMessage(message, telegramToken, chatId);
            logger.info("Gửi thông báo Telegram thành công: {}", message);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi thông báo Telegram: {}", e.getMessage(), e);
        }
    }


    public void refreshToken(Shop shop) {
        logger.info("Access token sắp hết hạn, đang refresh cho shop: {}", shop.getNote());
        String url = String.format(
                "https://auth.tiktok-shops.com/api/v2/token/refresh?app_key=%s&app_secret=%s&refresh_token=%s&grant_type=refresh_token",
                appKey, appSecret, shop.getRefreshToken()
        );
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && (int) responseBody.get("code") == 0) {
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    String newAccessToken = (String) data.get("access_token");
                    String newRefreshToken = (String) data.get("refresh_token");
                    String newSellerName = (String) data.get("seller_name");
                    long accessTokenExpireTimestamp = ((Number) data.get("access_token_expire_in")).longValue();
                    long refreshTokenExpireTimestamp = ((Number) data.get("refresh_token_expire_in")).longValue();
                    shop.setAccessToken(newAccessToken);
                    shop.setRefreshToken(newRefreshToken);
                    shop.setAccessTokenExpiry(accessTokenExpireTimestamp);
                    shop.setRefreshTokenExpiry(refreshTokenExpireTimestamp);
                    shop.setName(newSellerName);
                    shopRepo.save(shop);
                    logger.info("Token đã được refresh thành công cho shop: {}", shop.getNote());
                } else {
                    throw new RuntimeException("Lỗi refresh token: " + responseBody.get("message"));
                }
            } else {
                throw new RuntimeException("Không thể refresh token, HTTP Code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Lỗi khi refresh token cho shop {}: {}", shop.getNote(), e.getMessage(), e);
            throw new RuntimeException("Lỗi khi refresh token: " + e.getMessage(), e);
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void refreshAllShopsTokens() {
        long now = System.currentTimeMillis() / 1000;
        long cutoff = now + 7200; // còn dưới 2 tiếng
        List<Shop> shopsToRefresh = shopRepo.findShopsWithExpiringToken(cutoff);
        for (Shop shop : shopsToRefresh) {
            try {
                refreshToken(shop);
            } catch (Exception e) {
                logger.error("Lỗi khi refresh token cho shop {}: {}", shop.getNote(), e.getMessage(), e);
            }
        }
        logger.info("Hoàn tất refresh token cho tất cả shop");
    }
}