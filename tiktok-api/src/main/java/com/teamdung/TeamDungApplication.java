package com.teamdung;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TeamDungApplication {
    public static void main(String[] args) {
        SpringApplication.run(TeamDungApplication.class, args);
    }
}
