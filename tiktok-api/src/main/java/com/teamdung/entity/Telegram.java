package com.teamdung.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;


@Entity
@Table
@Getter
@Setter
@Service
@AllArgsConstructor
@NoArgsConstructor
public class Telegram extends Base {

    @Column
    private String chatId;

    @Column
    private String token;

    @Column
    private String eventType;


    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Category category;
}
