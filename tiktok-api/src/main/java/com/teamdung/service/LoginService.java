package com.teamdung.service;

import com.teamdung.DTO.Req.LoginReq;
import com.teamdung.DTO.Res.TokenResponse;
import com.teamdung.entity.User;
import com.teamdung.exception.ResourceNotFoundException;
import com.teamdung.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    @Autowired
    UserRepo userRepo;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JWTService jwtService;

    public User getAccountLogin(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepo.findByEmail(authentication.getName())
                .orElseThrow(()-> new RuntimeException("Bạn cần login trước!"));
    }

    public TokenResponse authentication(LoginReq accountRequest){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(accountRequest.getEmail(),accountRequest.getPassword())
        );
        User account = userRepo
                .findByEmail(accountRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Not found account!"));
        long expirationTime = System.currentTimeMillis() + 1000 * 60 * 60;
        return TokenResponse.builder()
                .accessToken(jwtService.generateToken(account))
                .email(account.getEmail())
                .fullName(account.getName())
                .role(account.getRole())
                .expiration(expirationTime)
                .teamName(account.getTeamName())
                .build();
    }
}
