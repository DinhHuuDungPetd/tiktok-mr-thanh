package com.teamdung.repository;

import com.teamdung.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ShopRepo extends JpaRepository<Shop, Long> {

    Optional<Shop> findByShopId(String shopId);

    @Query(value = "SELECT * FROM shop WHERE access_token_expiry <= :cutoff", nativeQuery = true)
    List<Shop> findShopsWithExpiringToken(@Param("cutoff") long cutoff);
}
