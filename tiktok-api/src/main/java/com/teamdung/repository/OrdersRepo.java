package com.teamdung.repository;

import com.teamdung.entity.Order.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OrdersRepo extends JpaRepository<Orders, String>, JpaSpecificationExecutor<Orders> {
}
