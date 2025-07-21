package com.teamdung.DTO.Res;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import tiktokshop.open.sdk_java.model.Order.V202309.GetOrderListResponseDataOrders;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomOrderListResponse extends GetOrderListResponseDataOrders {
}
