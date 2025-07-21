package com.teamdung.service;

import Utils.DefaultClient;
import com.teamdung.DTO.Res.finance.Bank;
import com.teamdung.DTO.Res.finance.Payment;
import com.teamdung.entity.Shop;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.api.FinanceV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Finance.V202309.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class FinanceService {

    @Autowired
    ShopService shopService;

    private final FinanceV202309Api api;
    String contentType = "application/json";

    public FinanceService() {
        this.api = new FinanceV202309Api(DefaultClient.getApiClient());
    }



    private List<Bank> getPayments(Shop shop, Long createTimeLt, Long createTimeGe, String status) throws ApiException {
        String sortField = "create_time";
        String xTtsAccessToken = shop.getAccessToken();
        Object pageSize = 100;
        String pageToken = null;
        String shopCipher = shop.getCipher();

        List<Bank> banks = new ArrayList<>();
        do {
            GetPaymentsResponse response = api.finance202309PaymentsGet(
                    sortField,
                    xTtsAccessToken,
                    contentType,
                    createTimeLt,
                    pageSize,
                    pageToken,
                    null,
                    createTimeGe,
                    shopCipher
            );

            // Kiểm tra response
            if (response != null && response.getCode() == 0) {
                GetPaymentsResponseData data = response.getData();
                assert data != null;
                List<GetPaymentsResponseDataPayments> payments = data.getPayments();

                // Nếu có dữ liệu payment, thêm vào danh sách banks
                if (payments != null && !payments.isEmpty()) {
                    for (GetPaymentsResponseDataPayments paymentData : payments) {
                       if(Objects.equals(paymentData.getStatus(), status)){
                           String bankAccount = paymentData.getBankAccount();
                           Long createTime = paymentData.getCreateTime();
                           Long paidTime = paymentData.getPaidTime();
                           String amount = Objects.requireNonNull(paymentData.getAmount()).getValue();
                           String statusPay = paymentData.getStatus();

                           banks.add(Bank.builder()
                                   .amount(amount)
                                   .bankAccount(bankAccount)
                                   .createTime(createTime)
                                   .paidTime(paidTime)
                                   .status(statusPay)
                                   .build());
                       }
                    }
                }
                pageToken = data.getNextPageToken();
            } else {
                break;
            }
        } while (pageToken != null && !pageToken.isEmpty());
        return banks;
    }




    public Payment getPayment(Long shopId, Long createTimeLt, Long createTimeGe) throws ApiException {
        Shop shop = shopService.getById(shopId);

        long now = Instant.now().getEpochSecond();
        long twoWeeksAgo = Instant.now().minus(14, ChronoUnit.DAYS).getEpochSecond();

        List<Bank> paymentsProcessing = getPayments(shop, now, twoWeeksAgo, "PROCESSING");
        String totalAmountProcessing = paymentsProcessing.stream()
                .map(bank -> new BigDecimal(bank.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .toString();

        List<Bank> paymentsPaid = getPayments(shop, createTimeLt, createTimeGe, "PAID");
        String totalAmountPaid = paymentsPaid.stream()
                .map(bank -> new BigDecimal(bank.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .toString();

        return Payment.builder()
                .amountProcessing(totalAmountProcessing)
                .amountPaid(totalAmountPaid)
                .processingListBank(paymentsProcessing)
                .paidListBank(paymentsPaid)
                .build();
    }
}