package com.teamdung.DTO.Res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Instant timestamp;

    // Trả về thành công
    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, message, data, Instant.now()));
    }

    // Trả về lỗi với danh sách lỗi
    public static ResponseEntity<ApiResponse<Map<String, String>>> error(
            String message, Map<String, String> errors, HttpStatus status) {
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, message, errors, Instant.now()));
    }
}