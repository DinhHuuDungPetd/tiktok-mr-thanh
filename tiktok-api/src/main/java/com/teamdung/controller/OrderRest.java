package com.teamdung.controller;

import com.teamdung.DTO.Req.shipping.ShippingService;
import com.teamdung.DTO.Req.shipping.Tracking;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.service.OrderSevice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Logistics.V202309.GetShippingProvidersResponse;

import java.util.Map;

@RestController
@RequestMapping("/auth/order")
public class OrderRest {


    @Autowired
    OrderSevice orderService;

    @PostMapping("/get-shipping-service")
    public ResponseEntity<?> getShippingService(@RequestBody ShippingService shippingService){
        try {
            return ApiResponse.success("Thành công", orderService.getShippingServices(shippingService));
        } catch (ResourceNotFoundException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (ApiException | RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create-label")
    public ResponseEntity<?> createLabel(@RequestBody ShippingService shippingService){
        try {
            return ApiResponse.success("Thành công", orderService.createLabel(shippingService));
        } catch (ResourceNotFoundException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (ApiException | RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/add-tracking")
    public ResponseEntity<?> addTracking(@RequestBody Tracking tracking){
        try {
            return ApiResponse.success("Thành công", orderService.addTrack(tracking));
        } catch (ResourceNotFoundException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (ApiException | RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/get-label")
    public ResponseEntity<?> getLabel(@RequestParam(name = "package_id", required = true) String packageId,
                                      @RequestParam(name = "shop_id", required = true) Long shopId
                                      ) throws ApiException {
        try {
            return ApiResponse.success("Thành công", orderService.getLabel(packageId, shopId));
        } catch (ResourceNotFoundException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (ApiException | RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-shipping-providers")
    public ResponseEntity<?> getShippingProviders(@RequestParam(name = "delivery_option_id", required = true) String deliveryOptionId,
                                      @RequestParam(name = "shop_id", required = true) Long shopId
    ) throws ApiException {
        try {
            return ApiResponse.success("Thành công", orderService.getShippingProviders(shopId,deliveryOptionId));
        } catch (ResourceNotFoundException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (ApiException | RuntimeException e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        } catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



}
