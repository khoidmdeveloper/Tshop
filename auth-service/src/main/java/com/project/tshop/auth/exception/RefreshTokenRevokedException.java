package com.project.tshop.auth.exception;
public class RefreshTokenRevokedException extends RuntimeException {
    public RefreshTokenRevokedException(String message) { super(message); }
}
