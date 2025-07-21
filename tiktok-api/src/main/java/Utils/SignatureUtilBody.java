package Utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okio.Buffer;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class SignatureUtilBody {



    public static String build (String url, Map<String, Object> body, String appSecret) throws JsonProcessingException {
        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(
                        MediaType.parse("application/json"),
                        new ObjectMapper().writeValueAsString(body)))
                .build();
        return url + "&sign=" + getSignature(request, appSecret);
    }


    public static String getSignature(Request request, String secret) {
        HttpUrl httpUrl = request.url();
        List<String> parameterNameList = new ArrayList<>(httpUrl.queryParameterNames());

        // Loại bỏ các parameter không cần thiết: "sign" và "access_token"
        parameterNameList.removeIf(param -> "sign".equals(param) || "access_token".equals(param));

        // Sắp xếp theo thứ tự bảng chữ cái
        Collections.sort(parameterNameList);

        // Nối URL path
        StringBuilder parameterStr = new StringBuilder(httpUrl.encodedPath());
        for (String parameterName : parameterNameList) {
            // Nối theo định dạng: {key}{value}
            parameterStr.append(parameterName).append(httpUrl.queryParameter(parameterName));
        }

        // Nếu Content-Type không phải là multipart/form-data, nối thêm body (nếu có)
        String contentType = request.header("Content-Type");
        if (contentType == null || !"multipart/form-data".equalsIgnoreCase(contentType)) {
            try {
                RequestBody requestBody = request.body();
                if (requestBody != null) {
                    Buffer bodyBuffer = new Buffer();
                    requestBody.writeTo(bodyBuffer);
                    byte[] bodyBytes = bodyBuffer.readByteArray();
                    parameterStr.append(new String(bodyBytes, StandardCharsets.UTF_8));
                }
            } catch (Exception e) {
                throw new RuntimeException("failed to generate signature params", e);
            }
        }

        // Bao bọc chuỗi với secret ở đầu và cuối
        String signatureParams = secret + parameterStr + secret;

        // Trả về chữ ký đã được mã hóa bằng HMAC-SHA256
        return generateSHA256(signatureParams, secret);
    }

    private static String generateSHA256(String signatureParams, String secret) {
        try {
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKeySpec);

            byte[] hashBytes = sha256HMAC.doFinal(signatureParams.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte hashByte : hashBytes) {
                sb.append(String.format("%02x", hashByte & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("failed to generate signature result", e);
        }
    }
}
