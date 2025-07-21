package com.teamdung.DTO.Res.finance;


import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    String amountPaid;
    String amountHold;
    String amountProcessing;

    List<Bank> processingListBank = new ArrayList<>();
    List<Bank> paidListBank = new ArrayList<>();
}
