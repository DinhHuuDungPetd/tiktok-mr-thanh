package com.teamdung.service;

import Utils.DefaultClient;
import Utils.Enum.Role;
import com.teamdung.DTO.Req.ConditionOrder;
import com.teamdung.DTO.Req.ConditionRefund;
import com.teamdung.DTO.Req.ShopReq;
import com.teamdung.DTO.Res.orderClass.OrderDTO;
import com.teamdung.DTO.Res.orderClass.ResponseOrderListAPI;
import com.teamdung.convert.AccessTokenResponse;
import com.teamdung.entity.*;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.repository.ShopRepo;
import com.teamdung.repository.TagRepo;
import jakarta.transaction.Transactional;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.api.OrderV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Authorization.V202309.GetAuthorizedShopsResponseDataShops;
import tiktokshop.open.sdk_java.model.Order.V202309.*;
import tiktokshop.open.sdk_java.model.ReturnRefund.V202309.SearchReturnsResponse;
import tiktokshop.open.sdk_java.model.ReturnRefund.V202309.SearchReturnsResponseDataReturnOrders;

import java.nio.file.AccessDeniedException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Service
public class ShopService {

    @Autowired
    private TiktokAuthorizationService tiktokAuthorizationService;
    @Autowired
    private UserSevice userSevice;
    @Autowired
    ShopRepo shopRepo;
    @Autowired
    LoginService loginService;

    @Lazy
    @Autowired
    CategoryService categoryService;
    @Autowired
    OrderRefundService orderRefundService;
    @Autowired
    TagRepo tagRepo;

    @Autowired
    WebhookBaseService webhookBaseService;

    @Autowired
    ShopBaseService shopBaseService;

    private String contentType = "application/json";

    private final OrderV202309Api api;

    public ShopService() {
        this.api = new OrderV202309Api(DefaultClient.getApiClient());
    }

    public Shop getById(Long shopId) {
        return shopRepo.findById(shopId)
                .orElseThrow(()-> new ResourceNotFoundException("Shop không tồn tại!"));
    }

    @Transactional
    public Shop addShop(ShopReq shopReq) throws ApiException, AccessDeniedException {

        Owner owner = userSevice.findByToken(shopReq.getToken());
        AccessTokenResponse accessTokenResponse = tiktokAuthorizationService
                .generateAccessToken(shopReq.getAuthCode());
        GetAuthorizedShopsResponseDataShops response = tiktokAuthorizationService
                .getInfoShop(accessTokenResponse.getAccessToken());
        Optional<Shop> shopOp = shopRepo.findByShopId(response.getId());
        Shop shop = shopOp.orElse(new Shop()); // Nếu không có shop, tạo mới
        shop.setShopId(response.getId());
        shop.setCipher(response.getCipher());
        shop.setName(response.getName());
        shop.setAccessToken(accessTokenResponse.getAccessToken());
        shop.setAccessTokenExpiry(accessTokenResponse.getAccessTokenExpireIn());
        shop.setRefreshToken(accessTokenResponse.getRefreshToken());
        shop.setRefreshTokenExpiry(accessTokenResponse.getRefreshTokenExpireIn());
        shop.setOwner(owner);
        shop.setNote(shopReq.getNote());
        shopRepo.save(shop);
        Category category = categoryService.getByIdOp(shopReq.getCategoryId()).orElse(null);
        if (category != null) {
            categoryService.addShopIntoCategoryWithOwner(shop, category, owner);
        }
        webhookBaseService.handleWhenAddShop(shop);
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CompletableFuture.runAsync(() -> {
            try {
                shopBaseService.callAllOrderByShop(shop);
            } catch (ApiException e) {
                throw new RuntimeException("Lỗi khi gọi các đơn hàng cho shop: " + e.getMessage(), e);
            }
        }, executorService).exceptionally(e -> {
            System.err.println("Lỗi trong CompletableFuture: " + e.getMessage());
            return null;
        });
        executorService.shutdown();
        return shop;
    }
    public Set<Shop> getShopsByUserLogin() {
        User user = loginService.getAccountLogin();
        if(user.getRole().equals(Role.ADMIN.toString())) {
            return new HashSet<>(shopRepo.findAll());
        }
        return user.getShopSet();
    }

    public Object getOrdersList(ConditionOrder condition) throws ApiException, AccessDeniedException {
        if(condition.getOrderIds() == null || condition.getOrderIds().isEmpty()){
            return getOrderListNoSearch(condition);
        }
        return getOrdersDetails(condition);
    }

    @Transactional
    public void addTag(Long shopId, Long tagId){
        Shop shop = shopRepo.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Not found shop"));
        Tag tag = tagId == 0 ? null : tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Not found tag"));
        User user = loginService.getAccountLogin();

        if(!user.getRole().equals(Role.ADMIN.toString())) {
            if(!user.getShopSet().contains(shop)) {
                throw new RuntimeException("Bạn không có quyền sửa shop!");
            }
            if(!user.getTagSet().contains(tag) && tagId != 0) {
                throw new RuntimeException("Bạn không có quyền truy cập tag!");
            }
        }
        shop.setTag(tag);
        if(tagId != 0) {
            Set<Category> categorySet = shop.getCategorySet();
            categorySet.forEach((category) -> {
                if(!category.getTagSet().contains(tag)) {
                    category.getTagSet().add(tag);
                    tag.getCategorySet().add(category);
                }
            });
            tagRepo.save(tag);
        }
        shopRepo.save(shop);
    }

    public ResponseOrderListAPI<OrderDTO<GetOrderListResponseDataOrders>> getOrderListNoSearch(
            ConditionOrder condition
    ) throws ApiException, AccessDeniedException {
        Shop shop = shopRepo.findById(condition.getId())
                .orElseThrow(() -> new RuntimeException("Not found shop"));

        User user = loginService.getAccountLogin();

        if(!user.getRole().equals(Role.ADMIN.toString())) {
            if(!user.getShopSet().contains(shop)) {
                throw new AccessDeniedException("Bạn không có quyền truy cập!");
            }
        }

        GetOrderListRequestBody body = new GetOrderListRequestBody();
        body.setOrderStatus(condition.getStatus());
        body.setShippingType(condition.getShippingType());
        GetOrderListResponse response = api.order202309OrdersSearchPost(
                condition.getPageSize(),
                shop.getAccessToken(),
                contentType,
                condition.getSortOrder(),
                condition.getPageToken(),
                condition.getSortField(),
                shop.getCipher(),
                body
        );

        return processOrderResponseList(
                response.getCode(),
                response.getMessage(),
                response.getData() != null ? response.getData().getOrders() : null,
                response.getData() != null ? response.getData().getNextPageToken() : null,
                response.getData() != null ? response.getData().getTotalCount() : 0,
                shop.getId()
        );
    }

    public ResponseOrderListAPI<OrderDTO<GetOrderDetailResponseDataOrders>> getOrdersDetails(
            ConditionOrder condition
    ) throws ApiException, AccessDeniedException {
        Shop shop = shopRepo.findById(condition.getId())
                .orElseThrow(() -> new RuntimeException("Not found shop"));

        User user = loginService.getAccountLogin();
        if(!user.getRole().equals(Role.ADMIN.toString())) {
            if(!user.getShopSet().contains(shop)) {
                throw new AccessDeniedException("Bạn không có quyền truy cập!");
            }
        }

        GetOrderDetailResponse response = api.order202309OrdersGet(
                condition.getOrderIds(),
                shop.getAccessToken(),
                contentType,
                shop.getCipher()
        );

        return processOrderResponseDetail(
                response.getCode(),
                response.getMessage(),
                response.getData() != null ? response.getData().getOrders() : null,
                null, 0, shop.getId());
    }

    public  GetOrderDetailResponse getOrdersDetails (String shopId, String orderId) throws ApiException, AccessDeniedException {
        Shop shop = shopRepo.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Not found shop"));

        return api.order202309OrdersGet(
                List.of(orderId),
                shop.getAccessToken(),
                contentType,
                shop.getCipher()
        );
    }

    private ResponseOrderListAPI<OrderDTO<GetOrderListResponseDataOrders>> processOrderResponseList(
            int code, String message, List<GetOrderListResponseDataOrders> orders,
            String nextPageToken, int totalCount, long shopId) throws ApiException, AccessDeniedException {

        return processOrderResponseInternal(code, message, orders, nextPageToken, totalCount, shopId);
    }
    private ResponseOrderListAPI<OrderDTO<GetOrderDetailResponseDataOrders>> processOrderResponseDetail(
            int code, String message, List<GetOrderDetailResponseDataOrders> orders,
            String nextPageToken, int totalCount, long shopId) throws ApiException, AccessDeniedException {

        return processOrderResponseInternal(code, message, orders, nextPageToken, totalCount, shopId);
    }

    private <T> ResponseOrderListAPI<OrderDTO<T>> processOrderResponseInternal(
            int code,
            String message,
            List<T> orders,
            String nextPageToken,
            int totalCount,
            long shopId
    ) throws ApiException, AccessDeniedException {

        if (orders == null || orders.isEmpty()) {
            return new ResponseOrderListAPI<>(code, message);
        }

        List<String> orderIds = orders.stream()
                .map(this::getOrderId)
                .filter(Objects::nonNull)
                .toList();

        ConditionRefund conditionRefund = ConditionRefund.builder()
                .id(shopId)
                .orderIds(orderIds)
                .build();

        SearchReturnsResponse returnsResponse = orderRefundService.getReturnsSearch(conditionRefund);
        List<SearchReturnsResponseDataReturnOrders> refunds =
                returnsResponse.getData() != null ? returnsResponse.getData().getReturnOrders() : Collections.emptyList();

        List<OrderDTO<T>> list = new ArrayList<>();

        for (T order : orders) {
            String orderId = getOrderId(order);

            List<String> returnStatuses = new ArrayList<>();
            List<String> returnTypes = new ArrayList<>();
            List<String> returnReasons = new ArrayList<>();

            for (SearchReturnsResponseDataReturnOrders refund : refunds) {
                if (orderId.equals(refund.getOrderId())) {
                    if (!returnStatuses.contains(refund.getReturnStatus())) {
                        returnStatuses.add(refund.getReturnStatus());
                    }
                    if (!returnTypes.contains(refund.getReturnType())) {
                        returnTypes.add(refund.getReturnType());
                    }
                    if (refund.getReturnReasonText() != null && !returnReasons.contains(refund.getReturnReasonText())) {
                        returnReasons.add(refund.getReturnReasonText());
                    }
                }
            }

            String returnStatus = String.join(", ", returnStatuses);
            String returnType = String.join(", ", returnTypes);
            String returnReason = String.join(" | ", returnReasons);

            list.add(new OrderDTO<>(order, returnStatus, returnType, returnReason));
        }

        return nextPageToken != null
                ? new ResponseOrderListAPI<>(nextPageToken, totalCount, list, code, message)
                : new ResponseOrderListAPI<>(code, message, list);
    }


    private <T> String getOrderId(T order) {
        if (order instanceof GetOrderListResponseDataOrders dataOrders) {
            return dataOrders.getId();
        } else if (order instanceof GetOrderDetailResponseDataOrders dataOrders) {
            return dataOrders.getId();
        }
        return null;
    }



}
