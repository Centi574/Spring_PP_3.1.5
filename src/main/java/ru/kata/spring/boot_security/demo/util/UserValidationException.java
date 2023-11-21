package ru.kata.spring.boot_security.demo.util;

import java.util.List;

public class UserValidationException extends RuntimeException {

    private List<String> messageList;

    public UserValidationException(List<String> messages) {
        this.messageList = messages;
    }

    public List<String> getMessageList() {
        return messageList;
    }
}
