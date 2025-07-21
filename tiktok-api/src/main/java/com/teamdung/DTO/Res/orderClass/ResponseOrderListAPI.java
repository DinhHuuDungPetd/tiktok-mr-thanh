package com.teamdung.DTO.Res.orderClass;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResponseOrderListAPI<T> {
    int code;
    String message;
    ResponseOrderList<T> data;

    public ResponseOrderListAPI(String next_page_token, Integer total_count, List<T> orders, int code, String message) {
        ResponseOrderList<T> data = new ResponseOrderList<>();
        data.next_page_token = next_page_token;
        data.total_count = total_count;
        data.orders = orders;
        this.data = data;
        this.code = code;
        this.message = message;
    }

    public ResponseOrderListAPI(int code, String message) {
        this.code = code;
        this.message = message;
        data = new ResponseOrderList<>();
    }

    public ResponseOrderListAPI(int code, String message, List<T> orders) {
        this.code = code;
        this.message = message;
        data = new ResponseOrderList<>(orders);
    }

}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
class ResponseOrderList<T> {
    String next_page_token;
    Integer total_count;
    List<T> orders;

    public ResponseOrderList(List<T> orders) {
        this.orders = orders;
    }
}
