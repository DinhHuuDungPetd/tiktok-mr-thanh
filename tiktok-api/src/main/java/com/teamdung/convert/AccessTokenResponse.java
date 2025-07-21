package com.teamdung.convert;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import tiktokshop.open.sdk_java.invoke.ApiException;

import java.util.Map;

@Getter
@Slf4j
@JsonIgnoreProperties(ignoreUnknown = true)
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class AccessTokenResponse {
    // Getters
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("access_token_expire_in")
    private long accessTokenExpireIn;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("refresh_token_expire_in")
    private long refreshTokenExpireIn;

    @JsonProperty("seller_name")
    private String sellerName;

    public static AccessTokenResponse parseResponse(String responseBody) throws ApiException {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, new TypeReference<>() {});

            int code = Integer.parseInt(responseMap.get("code").toString());
            log.info("code={}", code);
            if (code != 0) {
                throw new ApiException(code, responseMap.get("message").toString());
            }
            return objectMapper.convertValue(responseMap.get("data"), AccessTokenResponse.class);
        } catch (ApiException e) {
            throw e; // Ném ngoại lệ gốc
        } catch (Exception e) {
            throw new RuntimeException("Error parsing TikTok API response", e);
        }
    }

}
