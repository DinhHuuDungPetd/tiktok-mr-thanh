package com.teamdung.DTO.Req.shipping;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Weight {
    String unit;
    String value;
}
