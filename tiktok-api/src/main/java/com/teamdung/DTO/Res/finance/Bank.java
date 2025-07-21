package com.teamdung.DTO.Res.finance;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {
    String bankAccount;
    String amount;

    Long createTime;
    Long paidTime;

    String status;

}
