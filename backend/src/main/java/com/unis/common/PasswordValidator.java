package com.unis.common;

public final class PasswordValidator {

    public static final String POLICY_MESSAGE = 
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.";

    private PasswordValidator() {}

    public static boolean isValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSymbol = false;

        for (int i = 0; i < password.length(); i++) {
            char c = password.charAt(i);
            if (Character.isUpperCase(c)) {
                hasUpper = true;
            } else if (Character.isLowerCase(c)) {
                hasLower = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            } else if (!Character.isWhitespace(c)) {
                hasSymbol = true;
            }
        }

        return hasUpper && hasLower && hasDigit && hasSymbol;
    }

    public static void validate(String password) {
        if (!isValid(password)) {
            throw new BadRequestException(POLICY_MESSAGE);
        }
    }
}
