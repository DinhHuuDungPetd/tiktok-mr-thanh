package com.teamdung.repository;

import com.teamdung.entity.Webhooks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebhooksRepo extends JpaRepository<Webhooks, Long> {


    Optional<Webhooks> findByEventType(String eventType);
}
