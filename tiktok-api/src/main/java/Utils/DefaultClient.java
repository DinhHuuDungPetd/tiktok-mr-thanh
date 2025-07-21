package Utils;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import tiktokshop.open.sdk_java.invoke.ApiClient;
import tiktokshop.open.sdk_java.invoke.Configuration;

import java.lang.reflect.Method;
import java.util.Map;

public class DefaultClient {

    private static final RestTemplate restTemplate = new RestTemplate();


    public static ApiClient getApiClient() {
        String appKey = "6gfl9omrkcetf" ;
        String appSecret = "06628b0f3df3fc400663de3a752cdc807fdefebf";
        return Configuration.getDefaultApiClient()
                .setAppkey(appKey)
                .setSecret(appSecret)
                .setBasePath("https://open-api.tiktokglobalshop.com");
    }


    public static ResponseEntity<?> ApiClientCustom(String url, Map<String, Object> body, String token, HttpMethod method) {
        try {
            String appSecret = "559f7ecd7df57f73118f3b499c6c9d0592c84963";
            String appKey = "6fikpg3c9k15h" ;


            url = url + "&app_key=" + appKey + "&timestamp=" + TimeUtils.getTimestampNow();
            String fullUrl = SignatureUtilBody.build(url,body,appSecret);
            System.out.println(fullUrl);
            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-tts-access-token",token); // Thêm token vào header

            // Tạo HttpEntity
            HttpEntity<?> entity;

            // Xử lý theo phương thức HTTP
            switch (method.toString()) {
                case "GET":
                    // Thêm query parameters vào URL nếu có
                    if (body != null && !body.isEmpty()) {
                        StringBuilder queryString = new StringBuilder("?");
                        for (Map.Entry<String, Object> entry : body.entrySet()) {
                            queryString.append(entry.getKey())
                                    .append("=")
                                    .append(entry.getValue())
                                    .append("&");
                        }
                        // Xóa ký tự "&" cuối cùng
                        fullUrl += queryString.substring(0, queryString.length() - 1);
                    }
                    entity = new HttpEntity<>(headers);
                    return restTemplate.exchange(fullUrl, method, entity, String.class);

                case "POST":
                    // Gửi body dưới dạng JSON
                    entity = new HttpEntity<>(body, headers);
                    return restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);

                case "PUT":
                    entity = new HttpEntity<>(body, headers);
                    return restTemplate.exchange(fullUrl, HttpMethod.PUT, entity, String.class);

                case "DELETE":
                    entity = new HttpEntity<>(headers);
                    return restTemplate.exchange(fullUrl, HttpMethod.DELETE, entity, String.class);

                default:
                    throw new IllegalArgumentException("Phương thức HTTP không được hỗ trợ: " + method);
            }
        } catch (Exception e) {
            // Xử lý lỗi
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gọi API: " + e.getMessage());
        }
    }
}
