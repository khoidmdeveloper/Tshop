package com.project.tshop.validation;

import com.project.tshop.exception.InvalidEnumValueException;

public final class ValueValidation {

    private ValueValidation() {
    }

    public static void requireOneOf(String field, String value, String... allowed) {
        String allowedValues = String.join(", ", allowed);

        if (value == null) {
            throw new InvalidEnumValueException(field + " must be one of: " + allowedValues);
        }

        for (String allowedValue : allowed) {
            if (allowedValue.equals(value)) {
                return;
            }
        }

        throw new InvalidEnumValueException(
                "Invalid value for " + field + ": '" + value + "'. Allowed: " + allowedValues
        );
    }
}
