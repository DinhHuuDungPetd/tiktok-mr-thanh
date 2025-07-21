package com.teamdung.DTO.Req.shipping;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dimension {
    String height;
    String length;
    String unit;
    String width;
}
