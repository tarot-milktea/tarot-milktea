package org.com.taro.exception;

public class TaroServiceException extends RuntimeException {
    public TaroServiceException(String message) {
        super(message);
    }

    public TaroServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}