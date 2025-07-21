package com.teamdung.securytiConfig;

import com.teamdung.service.JWTService;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class CustomPreFilter extends OncePerRequestFilter {

    @Autowired
    JWTService jwtService;
    @Autowired
    CustomUserDetailsService customUserDetailsService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // Lấy token từ cookie với tên "access-token"
        String token = request.getHeader("access-token");

        String path = request.getRequestURI();

        if (StringUtils.isBlank(token) &&  path.startsWith("/auth")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Missing token");
            return;
        }

        if (StringUtils.isBlank(token) || !path.startsWith("/auth") ) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extract(token);
            if (StringUtils.isNotEmpty(email) || SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                if (jwtService.isValid(token, userDetails)) {
                    SecurityContext contextHolder = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    contextHolder.setAuthentication(authenticationToken);
                    SecurityContextHolder.setContext(contextHolder);
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
