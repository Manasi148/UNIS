package com.unis.auth;

import com.unis.common.ApiResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CsrfController {

    @GetMapping("/csrf")
    public ApiResponse<Map<String, String>> getCsrfToken(CsrfToken csrfToken) {
        if (csrfToken == null) {
            return ApiResponse.success(Map.of("token", "", "headerName", "X-XSRF-TOKEN", "parameterName", "_csrf"));
        }
        return ApiResponse.success(Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName()
        ));
    }
}
