package com.teamdung.DTO.Res.orderClass;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO <T>{

    @JsonUnwrapped
    T order;
    String return_status;
    String return_type;
    String return_reason_text;
}
