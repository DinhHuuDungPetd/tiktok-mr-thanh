package Utils;

import tiktokshop.open.sdk_java.model.Order.V202309.GetOrderDetailResponseDataOrdersLineItems;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GroupedLineItem {

    private GetOrderDetailResponseDataOrdersLineItems lineItem;
    private int count;

    // Constructor
    public GroupedLineItem(GetOrderDetailResponseDataOrdersLineItems lineItem, int count) {
        this.lineItem = lineItem;
        this.count = count;
    }

    // Getters and Setters
    public GetOrderDetailResponseDataOrdersLineItems getLineItem() {
        return lineItem;
    }


    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    @Override
    public String toString() {
        return "GroupedLineItem{" +
                "lineItem=" + lineItem +
                ", count=" + count +
                '}';
    }

    public static List<GroupedLineItem> groupLineItemsBySkuId(List<GetOrderDetailResponseDataOrdersLineItems> lineItems) {
        Map<String, GroupedLineItem> groupedMap = new HashMap<>();

        for (GetOrderDetailResponseDataOrdersLineItems item : lineItems) {
            String skuId = item.getSkuId();
            if (groupedMap.containsKey(skuId)) {
                GroupedLineItem groupedItem = groupedMap.get(skuId);
                groupedItem.setCount(groupedItem.getCount() + 1);
            } else {
                groupedMap.put(skuId, new GroupedLineItem(item, 1));
            }
        }
        return new ArrayList<>(groupedMap.values());
    }
}
