package com.teamdung.service;

import Utils.DefaultClient;
import com.teamdung.convert.AccessTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tiktokshop.open.sdk_java.api.AuthorizationV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Authorization.V202309.GetAuthorizedShopsResponse;
import tiktokshop.open.sdk_java.model.Authorization.V202309.GetAuthorizedShopsResponseDataShops;

@Slf4j
@Service
public class TiktokAuthorizationService {

    private final AuthorizationV202309Api api;
    private final RestTemplate restTemplate;

    private String grantType = "authorized_code";
    private String contentType = "application/json";

    @Value("${app.key}")
    private String appKey;
    @Value("${app.secret}")
    private String appSecret;

    public TiktokAuthorizationService() {
        this.api = new AuthorizationV202309Api(DefaultClient.getApiClient());
        this.restTemplate = new RestTemplate();
    }

    public GetAuthorizedShopsResponseDataShops getInfoShop(String accessToken) throws ApiException {
        try {
            GetAuthorizedShopsResponse response = api.authorization202309ShopsGet(accessToken, contentType);
            if (response.getData() == null || response.getData().getShops().isEmpty()) {
                throw new ApiException("Shop not found");
            }
            return response.getData().getShops().get(0);
        } catch (ApiException e) {
            throw new ApiException(e.getCode(), e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public AccessTokenResponse generateAccessToken(String auth_code) throws ApiException {
        String url = "https://auth.tiktok-shops.com/api/v2/token/get" +
                "?app_key=" + appKey +
                "&app_secret=" + appSecret +
                "&auth_code=" + auth_code +
                "&grant_type=" + grantType;
        ResponseEntity<String> tiktokResponse = restTemplate.getForEntity(url, String.class);
        return AccessTokenResponse.parseResponse(tiktokResponse.getBody());
    }

}
