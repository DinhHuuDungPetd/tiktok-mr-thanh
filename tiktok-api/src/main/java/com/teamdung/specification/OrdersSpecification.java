package com.teamdung.specification;

import com.teamdung.entity.*;
import com.teamdung.entity.Order.Address;
import com.teamdung.entity.Order.OrderDetails;
import com.teamdung.entity.Order.Orders;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class OrdersSpecification {

    // Tìm kiếm theo id (chính xác)
    public static Specification<Orders> hasId(String id) {
        return (root, query, criteriaBuilder) -> {
            if (id == null || id.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("id"), id);
        };
    }

    // Tìm kiếm theo status (chính xác)
    public static Specification<Orders> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    // Tìm kiếm theo shippingType (chính xác)
    public static Specification<Orders> hasShippingType(String shippingType) {
        return (root, query, criteriaBuilder) -> {
            if (shippingType == null || shippingType.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("shippingType"), shippingType);
        };
    }

    // Tìm kiếm theo name trong Shop (chứa chuỗi, không phân biệt hoa thường)
    public static Specification<Orders> hasShopName(String shopName) {
        return (root, query, criteriaBuilder) -> {
            if (shopName == null || shopName.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Orders, Shop> shopJoin = root.join("shop", JoinType.LEFT);
            return criteriaBuilder.like(
                    criteriaBuilder.lower(shopJoin.get("name")),
                    "%" + shopName.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Orders> hasShopIds(List<String> shopIds) {
        return (root, query, criteriaBuilder) -> {
            if (shopIds == null || shopIds.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            // Kiểm tra xem shop của đơn hàng có thuộc mảng shopIds không
            Join<Orders, Shop> shopJoin = root.join("shop", JoinType.LEFT);
            return shopJoin.get("shopId").in(shopIds);
        };
    }

    // Tìm kiếm theo userId (User là Owner)
    public static Specification<Orders> belongsToOwner(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) {
                return criteriaBuilder.conjunction();
            }
            query.distinct(true); // Tránh trùng lặp
            Join<Orders, Shop> shopJoin = root.join("shop", JoinType.LEFT);
            Join<Shop, Owner> ownerJoin = shopJoin.join("owner", JoinType.LEFT);
            Join<Owner, User> userJoin = ownerJoin.join("user", JoinType.LEFT);
            return criteriaBuilder.equal(userJoin.get("id"), userId);
        };
    }

    // Tìm kiếm theo userId (User là Employee)
    public static Specification<Orders> belongsToEmployee(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) {
                return criteriaBuilder.conjunction();
            }
            query.distinct(true); // Tránh trùng lặp

            // Subquery để tìm các shop thuộc category của employee
            Subquery<Long> shopSubquery = query.subquery(Long.class);
            Root<Category> categoryRoot = shopSubquery.from(Category.class);
            Join<Category, Employee> employeeJoin = categoryRoot.join("employeeSet", JoinType.LEFT);
            Join<Employee, User> userJoin = employeeJoin.join("user", JoinType.LEFT);
            Join<Category, Shop> shopJoinFromCategory = categoryRoot.join("shopSet", JoinType.LEFT);
            shopSubquery.select(shopJoinFromCategory.get("id"))
                    .where(criteriaBuilder.equal(userJoin.get("id"), userId));

            // Kiểm tra shop của order nằm trong danh sách shop từ subquery
            Join<Orders, Shop> shopJoin = root.join("shop", JoinType.LEFT);
            return criteriaBuilder.in(shopJoin.get("id")).value(shopSubquery);
        };
    }

    // Kết hợp tất cả các tiêu chí
    public static Specification<Orders> searchOrders(
            String id,
            String status,
            String shippingType,
            Long userId,
            String userRole,
            List<String> shopIds // Thêm tham số shopIds
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(hasId(id).toPredicate(root, query, criteriaBuilder));
            predicates.add(hasStatus(status).toPredicate(root, query, criteriaBuilder));
            predicates.add(hasShippingType(shippingType).toPredicate(root, query, criteriaBuilder));
            // Tìm kiếm theo shopIds
            predicates.add(hasShopIds(shopIds).toPredicate(root, query, criteriaBuilder));

            if (userId != null && userRole != null) {
                if ("OWNER".equalsIgnoreCase(userRole)) {
                    predicates.add(belongsToOwner(userId).toPredicate(root, query, criteriaBuilder));
                } else if ("EMPLOYEE".equalsIgnoreCase(userRole)) {
                    predicates.add(belongsToEmployee(userId).toPredicate(root, query, criteriaBuilder));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

}