package com.project.tshop.auth.validation;

public class ValueValidation {
    public static void requireOneOf(String field, String value, String... allowed) {
        for (String v : allowed) {
            if (v.equals(value)) return;
        }
        throw new IllegalArgumentException("Invalid value for " + field + ": " + value);
    }
}
