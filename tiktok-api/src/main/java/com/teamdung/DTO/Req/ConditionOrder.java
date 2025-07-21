package com.teamdung.DTO.Req;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConditionOrder {

    long id;
    int pageSize = 100;
    String pageToken = null;
    String sortOrder = "DESC";
    String sortField = "create_time";
    String status;
    String shippingType;
    List<String> orderIds;
}
