package com.teamdung.repository;

import com.teamdung.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OwnerRepo extends JpaRepository<Owner, Long> {
    @Query("SELECT ow FROM Owner ow WHERE ow.uniqueId = :token ")
    Optional<Owner> findByToken(String token);
}

