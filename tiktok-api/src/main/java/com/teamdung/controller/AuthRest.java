package com.teamdung.controller;

import com.teamdung.DTO.Req.LoginReq;
import com.teamdung.DTO.Req.ShopReq;
import com.teamdung.DTO.Res.ApiResponse;
import com.teamdung.DTO.Res.TokenResponse;
import com.teamdung.entity.Shop;
import com.teamdung.repository.ShopRepo;
import com.teamdung.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@RestController
@RequestMapping("/")
public class AuthRest {

    @Autowired
    private LoginService loginService;

    @Autowired
    WebhooksService webhooksService;

    @Autowired
    CategoryService categoryService;


    @Autowired
    ShopService shopService;

    @Autowired
    ShopBaseService shopBaseService;

    @PostMapping("/login")
    public ResponseEntity<?> loginHandle(@RequestBody(required = true ) LoginReq loginReq) {
        try{
            TokenResponse tokenResponse = loginService.authentication(loginReq);
            return ApiResponse.success("Login thành công!", tokenResponse);

        }catch (AuthenticationException e){
            return ApiResponse.error(
                    "Tài khoản hoặc mật khẩu không đúng!",
                    Map.of("error",e.getMessage()),
                    HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(
                    "An error occurred",
                    Map.of("error",e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/list-in-tiktok-shop")
    public ResponseEntity<?> getList() throws ApiException {
        return ApiResponse.success("Thành công", webhooksService.getWebhooksForShop());
    }

    @GetMapping("/get-category-by-token")
    public ResponseEntity<?> getCategoryByToken(@RequestParam(name = "token", defaultValue = "") String token){
        try{
            return ApiResponse.success("Login thành công!", categoryService.getListByToken(token));

        }catch (Exception e){
            return ApiResponse.error(
                    "An error occurred",
                    Map.of("error",e.getMessage()),
                    HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/add-shop")
    public ResponseEntity<?> addShop(@RequestBody ShopReq shop){
        try {
            return ApiResponse.success("Thêm shop thành công!", shopService.addShop(shop));
        }catch (ApiException | AccessDeniedException e){
            return ApiResponse.error(
                    "An error occurred",
                    Map.of("error",e.getMessage()),
                    HttpStatus.CONFLICT);
        }catch (Exception e){
            return ApiResponse.error(
                    "An error occurred",
                    Map.of("error",e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Autowired
    ShopRepo shopRepo;

    @Autowired
    TelegramService telegramService;

    @GetMapping("/call-data")
    public ResponseEntity<?> callData() {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CompletableFuture.runAsync(() -> {
            List<Shop> list = shopRepo.findAll();
            executorService.submit(() -> {
                try {
                    shopBaseService.callAllOrdersByShops(list);
                    Thread.sleep(2000);
                } catch (Exception e) {
                    e.printStackTrace();
                    telegramService.sendMessage(e.getMessage(), "7841466545:AAErgah5uxcarX0DfCh_PxOdda9zvi1VHGA", "6399771143");
                }
            });
            executorService.shutdown();
        });
        return ResponseEntity.ok("Thành công!");
    }

    @GetMapping("/call-data-by-order-id")
    public ResponseEntity<?> callDataByOrderId(@RequestParam String orderId, @RequestParam String shopId) throws ApiException {
        shopBaseService.callAllOrdersByOrderId(shopId, orderId);
        return ResponseEntity.ok("Thành công!");
    }

    @GetMapping("/ref")
    public ResponseEntity<?> ref(){
        shopBaseService.refreshAllShopsTokens();
        return ApiResponse.success("succ", null);
    }

    @GetMapping("/tele-test")
    public String teleTest(){
        telegramService.testService();
        return "Succ";
    }
}
