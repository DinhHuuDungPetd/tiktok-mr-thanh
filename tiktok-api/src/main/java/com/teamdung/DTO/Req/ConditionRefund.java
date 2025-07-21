package com.teamdung.DTO.Req;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConditionRefund {

    long id;
    int pageSize = 10;
    String pageToken = null;
    String sortOrder = "DESC";
    String sortField = "create_time";
    List<String> orderIds;
    List<String> returnIds;
    List<String> returnStatus;
    List<String> returnTypes;
}
