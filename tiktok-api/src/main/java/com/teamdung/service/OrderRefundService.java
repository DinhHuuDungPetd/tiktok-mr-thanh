package com.teamdung.service;

import Utils.DefaultClient;
import Utils.Enum.Role;
import com.teamdung.DTO.Req.ConditionRefund;
import com.teamdung.entity.Shop;
import com.teamdung.entity.User;
import com.teamdung.repository.ShopRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.api.ReturnRefundV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.ReturnRefund.V202309.SearchReturnsRequestBody;
import tiktokshop.open.sdk_java.model.ReturnRefund.V202309.SearchReturnsResponse;

import java.nio.file.AccessDeniedException;

@Service
public class OrderRefundService {

    @Autowired
    ShopRepo shopRepo;
    @Autowired
    LoginService loginService;

    private final ReturnRefundV202309Api api;
    private String contentType = "application/json";

    public OrderRefundService() {
        this.api = new ReturnRefundV202309Api(DefaultClient.getApiClient());
    }

    public SearchReturnsResponse getReturnsSearch(ConditionRefund condition) throws ApiException, AccessDeniedException {
        Shop shop = shopRepo.findById(condition.getId())
                .orElseThrow(() -> new RuntimeException("Not found shop"));

        User user = loginService.getAccountLogin();

        if(!user.getRole().equals(Role.ADMIN.toString())) {
            if(!user.getShopSet().contains(shop)) {
                throw new AccessDeniedException("Bạn không có quyền truy cập!");
            }
        }
        SearchReturnsRequestBody body = new SearchReturnsRequestBody();
        body.setOrderIds(condition.getOrderIds());
        body.setReturnIds(condition.getReturnIds());
        body.setReturnStatus(condition.getReturnStatus());
        body.setReturnTypes(condition.getReturnTypes());

        SearchReturnsResponse response = api.returnRefund202309ReturnsSearchPost(
                shop.getAccessToken(),
                contentType,
                condition.getSortField(),
                condition.getSortOrder(),
                String.valueOf(condition.getPageSize()),
                condition.getPageToken(),
                shop.getCipher(),
                body);

        return response;
    }



}
