package com.unis.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email or username is required")
    @JsonAlias({"email", "username"})
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    private String loginMode = "STUDENT";

    public LoginRequest() {
    }

    public LoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
        this.loginMode = "STUDENT";
    }

    public LoginRequest(String identifier, String password, String loginMode) {
        this.identifier = identifier;
        this.password = password;
        this.loginMode = loginMode;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLoginMode() {
        return loginMode;
    }

    public void setLoginMode(String loginMode) {
        this.loginMode = loginMode;
    }
}
