package com.teamdung.DTO.Req;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopReq {
    String token;
    String authCode;
    String note;
    Long categoryId;
}
