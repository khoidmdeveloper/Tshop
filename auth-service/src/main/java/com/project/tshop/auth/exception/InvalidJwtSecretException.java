package com.project.tshop.auth.exception;

public class InvalidJwtSecretException extends RuntimeException {
    public InvalidJwtSecretException(String message) { super(message); }
    public InvalidJwtSecretException(String message, Throwable cause) { super(message, cause); }
}
