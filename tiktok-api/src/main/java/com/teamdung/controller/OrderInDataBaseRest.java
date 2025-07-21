package com.teamdung.controller;

import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.entity.Order.Orders;
import com.teamdung.service.OrderInDataBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class OrderInDataBaseRest {

    @Autowired
    OrderInDataBaseService orderInDataBaseService;

    @GetMapping("/orders")
    public List<Orders> searchOrders(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String shippingType,
            @RequestParam(required = false) String shopIds
    ) {
        return orderInDataBaseService.searchOrders(
                id,
                status,
                shippingType,
                shopIds
        );
    }

    @GetMapping("/orders/page")
    public ResponseEntity<?> searchOrdersWithPage(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String shippingType,
            @RequestParam(required = false) String shopIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createTime");
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.success("Get data thành công",
                orderInDataBaseService.searchOrdersWithPage(
                        id,
                        status,
                        shippingType,
                        shopIds,
                        pageable
                )
        );
    }
}
