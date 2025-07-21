package com.teamdung.repository;

import com.teamdung.entity.Telegram;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelegramRepo extends JpaRepository<Telegram, Long> {
}
