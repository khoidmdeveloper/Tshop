package com.project.tshop.order.exception;
public class InvalidJwtSecretException extends RuntimeException {
    public InvalidJwtSecretException(String message) { super(message); }
    public InvalidJwtSecretException(String message, Throwable cause) { super(message, cause); }
}
