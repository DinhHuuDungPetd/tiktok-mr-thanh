package com.teamdung.DTO.Res;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {

    private String accessToken;
    private String email;
    private String role;
    private String fullName;
    private long expiration;
    private String teamName;
}

