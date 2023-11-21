package ru.kata.spring.boot_security.demo.util;

import java.util.List;

public class ErrorResponse {

    private List<String> messageList;

    public ErrorResponse(List<String> message) {
        this.messageList = message;
    }

    public List<String> getMessageList() {
        return messageList;
    }
}
