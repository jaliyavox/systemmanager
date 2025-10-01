package com.autofuellanka.systemmanager.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;

public class CustomerAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (path.startsWith("/api/customers/")) {
            String[] parts = path.split("/");
            if (parts.length > 3) {
                String customerIdStr = parts[3];
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))) {
                    // must be the same customer id as token subject
                    if (auth == null || !customerIdStr.equals(auth.getName())) {
                        response.setStatus(403);
                        return false;
                    }
                }
            }
        }
        return true;
    }
}



