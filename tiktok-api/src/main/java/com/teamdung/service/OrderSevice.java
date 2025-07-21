package com.teamdung.service;

import Utils.DefaultClient;
import com.teamdung.DTO.Req.shipping.ShippingService;
import com.teamdung.DTO.Req.shipping.Tracking;
import com.teamdung.entity.Shop;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tiktokshop.open.sdk_java.api.FulfillmentV202309Api;
import tiktokshop.open.sdk_java.api.LogisticsV202309Api;
import tiktokshop.open.sdk_java.invoke.ApiException;
import tiktokshop.open.sdk_java.model.Fulfillment.V202309.*;
import tiktokshop.open.sdk_java.model.Logistics.V202309.GetShippingProvidersResponse;

import java.util.List;

@Service
public class OrderSevice {

    private final FulfillmentV202309Api api;
    private final LogisticsV202309Api apiLogis;

    @Autowired
    ShopService shopService;

    String contentType = "application/json";


    public OrderSevice() {
        this.api = new FulfillmentV202309Api(DefaultClient.getApiClient());
        this.apiLogis = new LogisticsV202309Api(DefaultClient.getApiClient());
    }

    public GetEligibleShippingServiceResponse  getShippingServices(ShippingService shippingService) throws ApiException {
        if(shippingService.getOrderId() == null){
            throw new RuntimeException("orderId is null");
        }
        String orderId = shippingService.getOrderId();

        Shop shop = shopService.getById(shippingService.getShopId());
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();

        GetEligibleShippingServiceRequestBodyDimension dimension = null;
        if(shippingService.getDimension() != null){
            dimension = new GetEligibleShippingServiceRequestBodyDimension();
            dimension.setHeight(shippingService.getDimension().getHeight());
            dimension.setWidth(shippingService.getDimension().getWidth());
            dimension.setUnit(shippingService.getDimension().getUnit());
            dimension.setLength(shippingService.getDimension().getLength());
        }

        GetEligibleShippingServiceRequestBodyWeight weight = null;
        if(shippingService.getWeight() != null){
            weight = new GetEligibleShippingServiceRequestBodyWeight();
            weight.setValue(shippingService.getWeight().getValue());
            weight.setUnit(shippingService.getWeight().getUnit());
        }

        GetEligibleShippingServiceRequestBody body = new GetEligibleShippingServiceRequestBody();
        body.setDimension(dimension);
        body.setWeight(weight);

        return api.fulfillment202309OrdersOrderIdShippingServicesQueryPost(
                orderId,
                xTtsAccessToken,
                contentType,
                shopCipher,
                body
        );
    }

    public CreatePackagesResponse createLabel( ShippingService shippingService) throws ApiException {
        if(shippingService.getOrderId() == null){
            throw new RuntimeException("orderId is null");
        }
        if(shippingService.getShippingServiceId() == null){
            throw new RuntimeException("shipping service id is null");
        }

        String orderId = shippingService.getOrderId();
        Shop shop = shopService.getById(shippingService.getShopId());
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();

        CreatePackagesRequestBodyDimension dimension = null;
        if(shippingService.getDimension() != null){
            dimension = new CreatePackagesRequestBodyDimension();
            dimension.setHeight(shippingService.getDimension().getHeight());
            dimension.setWidth(shippingService.getDimension().getWidth());
            dimension.setUnit(shippingService.getDimension().getUnit());
            dimension.setLength(shippingService.getDimension().getLength());
        }

        CreatePackagesRequestBodyWeight weight = null;
        if(shippingService.getWeight() != null){
            weight = new CreatePackagesRequestBodyWeight();
            weight.setValue(shippingService.getWeight().getValue());
            weight.setUnit(shippingService.getWeight().getUnit());
        }

        CreatePackagesRequestBody body = new CreatePackagesRequestBody();
        body.setOrderId(orderId);
        body.setDimension(dimension);
        body.setWeight(weight);
        body.setShippingServiceId(shippingService.getShippingServiceId());

        return api.fulfillment202309PackagesPost(xTtsAccessToken, contentType, shopCipher, body);
    }

    public GetPackageShippingDocumentResponse getLabel(String packageId, Long shopId ) throws ApiException {
        String documentType = "SHIPPING_LABEL";
        Shop shop = shopService.getById(shopId);
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();
        String documentSize = "A6";
        return api
                .fulfillment202309PackagesPackageIdShippingDocumentsGet(
                        packageId,
                        documentType,
                        xTtsAccessToken,
                        contentType,
                        documentSize,
                        "",
                        shopCipher
                );
    }

    public GetShippingProvidersResponse getShippingProviders(Long shopId, String deliveryOptionId ) throws ApiException {
        if(deliveryOptionId == null){
            throw new RuntimeException("orderId is null");
        }

        Shop shop = shopService.getById(shopId);
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();

        return apiLogis
                .logistics202309DeliveryOptionsDeliveryOptionIdShippingProvidersGet(
                        deliveryOptionId,
                        xTtsAccessToken,
                        contentType,
                        shopCipher
                );
    }

    public UpdateShippingInfoResponse addTrack(Tracking tracking) throws ApiException {
        if(tracking.getOrderId() == null){
            throw new RuntimeException("orderId is null");
        }
        if(tracking.getTrackingId() == null){
            throw new RuntimeException("shipping service id is null");
        }

        String orderId = tracking.getOrderId();
        Shop shop = shopService.getById(tracking.getShopId());
        String xTtsAccessToken = shop.getAccessToken();
        String shopCipher = shop.getCipher();

        UpdateShippingInfoRequestBody body = new UpdateShippingInfoRequestBody();
        body.setTrackingNumber(tracking.getTrackingId());
        body.setShippingProviderId(tracking.getShippingId());

        return api
                .fulfillment202309OrdersOrderIdShippingInfoUpdatePost(
                        orderId,
                        xTtsAccessToken,
                        contentType,
                        shopCipher,
                        body
                );
    }

    public String getUrlLabelAuto(Long shopId, String orderId){
        try {
            ShippingService sp = new ShippingService();
            sp.setShopId(shopId);
            sp.setOrderId(orderId);
            GetEligibleShippingServiceResponse responseShipping = getShippingServices(sp);
            GetEligibleShippingServiceResponseDataShippingServices shippingService = responseShipping.getData().getShippingServices().get(0);
            String idSp = shippingService.getId();
            sp.setShippingServiceId(idSp);
            CreatePackagesResponse crLB = createLabel(sp);
            CreatePackagesResponseData dataCrLB = crLB.getData();
            String pkId = dataCrLB.getPackageId();
            GetPackageShippingDocumentResponse label = getLabel(pkId, shopId);
            GetPackageShippingDocumentResponseData data = label.getData();
            String url = data.getDocUrl();
            return url;
        }catch (Exception ex){
            ex.printStackTrace();
            return null;
        }
    }

}
