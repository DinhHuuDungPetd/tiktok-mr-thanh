package com.teamdung.service;

import com.teamdung.entity.Order.Orders;
import com.teamdung.entity.User;
import com.teamdung.repository.OrdersRepo;
import com.teamdung.specification.OrdersSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class OrderInDataBaseService {

    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    LoginService loginService;


    public List<Orders> searchOrders(
            String id,
            String status,
            String shippingType,
            String shopIds
    ) {
        User user = loginService.getAccountLogin();

        List<String> shopIdList = null;
        if (shopIds != null && !shopIds.isEmpty()) {
            shopIdList = Arrays.stream(shopIds.split(","))
                    .map(String::trim)
                    .toList();
        }
        return ordersRepo.findAll(
                OrdersSpecification.searchOrders(
                        id,
                        status,
                        shippingType,
                        user.getId(),
                        user.getRole(),
                        shopIdList
                )
        );
    }

    // Hỗ trợ phân trang
    public Page<Orders> searchOrdersWithPage(
            String id,
            String status,
            String shippingType,
            String shopIds,
            Pageable pageable
    ) {
        User user = loginService.getAccountLogin();
        List<String> shopIdList = null;
        if (shopIds != null && !shopIds.isEmpty()) {
            shopIdList = Arrays.stream(shopIds.split(","))
                    .map(String::trim)
                    .toList();
        }
        return ordersRepo.findAll(
                OrdersSpecification.searchOrders(
                        id,
                        status,
                        shippingType,
                        user.getId(),
                        user.getRole(),
                        shopIdList
                ),
                pageable
        );
    }
}
