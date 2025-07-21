package com.teamdung.controller;


import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.util.Map;

@RestController
@RequestMapping("/auth/finance")
public class FinanceRest {


    @Autowired
    FinanceService financeService;

    @GetMapping("/payments/{shopId}")
    public ResponseEntity<?> getPayments(@PathVariable Long shopId,
                                         @RequestParam(name = "create_time_lt") Long createTimeLt,
                                         @RequestParam(name = "create_time_ge") Long createTimeGe
                                         )
    {

        try {
            return ApiResponse.success("Thành công", financeService.getPayment(shopId,createTimeLt,createTimeGe));
        }catch (ApiException e) {
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage(), Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
