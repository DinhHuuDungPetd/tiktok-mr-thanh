package com.teamdung.controller;

import com.teamdung.DTO.Req.ConditionOrder;
import com.teamdung.DTO.Req.ConditionRefund;
import com.teamdung.DTO.Req.ShopReq;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.service.OrderRefundService;
import com.teamdung.service.ShopBaseService;
import com.teamdung.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.util.Map;

@RestController
@RequestMapping("/auth/shop")
public class ShopRest {

    @Autowired
    ShopService shopService;

    @Autowired
    ShopBaseService shopBaseService;
    @Autowired
    OrderRefundService orderRefundService;

    @PostMapping
    public ResponseEntity<?> addShop(@RequestBody ShopReq shop) {
        System.out.println(shop.getAuthCode());
        try {
            return ResponseEntity.ok(shopService.addShop(shop));
        }catch (ApiException e){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("code",e.getCode(), "mgs", e.getMessage()));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatusCode.valueOf(500))
                    .body(e);
        }
    }

    @GetMapping("/list-shop")
    public ResponseEntity<?> getShopList() {
        try{
            return ApiResponse.success("Thành công", shopService.getShopsByUserLogin());
        }catch (Exception e){
            return ApiResponse.error(
                    "An error occurred",
                    Map.of("error",e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/list-orders")
    public ResponseEntity<?> listOrders(@RequestBody ConditionOrder conditionOrder) {
        try {
            return ResponseEntity.ok(shopService.getOrdersList(conditionOrder));
        }catch (ApiException | RuntimeException e){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("code",HttpStatus.CONFLICT.value(), "mgs", e.getMessage()));
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR) ;
        }

    }

    @PostMapping("/list-refund")
    public ResponseEntity<?> listRefund(@RequestBody ConditionRefund conditionRefund) {
        try {
            return ResponseEntity.ok(orderRefundService.getReturnsSearch(conditionRefund));
        }catch (ApiException | RuntimeException e){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("code",HttpStatus.CONFLICT.value(), "mgs", e.getMessage()));
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR) ;
        }

    }

    @PutMapping("/add-tag/{shopId}")
    public ResponseEntity<?> addTag(@RequestBody Map<String, Long> tag, @PathVariable Long shopId) {
        try {
            Long tagId = tag.get("tagId");
            shopService.addTag(shopId,tagId);
            return ApiResponse.success("Chỉnh sửa thành công", null);
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR) ;
        }

    }

    @PutMapping("/update-name/{id}")
    public ResponseEntity<?> updateShopName(@RequestBody Map<String, String> shopNameMap, @PathVariable Long id) {
        try {
            String shoppName = shopNameMap.get("shopName");
            shopBaseService.UpdateName(id,shoppName);
            return ApiResponse.success("Chỉnh sửa thành công", null);
        }catch (RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR) ;
        }

    }
}
