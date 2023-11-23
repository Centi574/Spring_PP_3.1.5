package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RegistrationService;
import ru.kata.spring.boot_security.demo.util.ErrorResponse;
import ru.kata.spring.boot_security.demo.util.UserValidationException;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/registration")
public class RegistrateController {

    private final RegistrationService registrationService;

    @Autowired
    public RegistrateController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/new")
    public ResponseEntity<String> register(@RequestBody @Valid User user, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errorMessages = new ArrayList<>();
            List<FieldError> fieldErrors = bindingResult.getFieldErrors();
            for (FieldError error : fieldErrors) {
                errorMessages.add(error.getDefaultMessage());
            }
            throw new UserValidationException(errorMessages);
        }
        registrationService.performRegistration(user);
        return ResponseEntity.ok("Registration was performed");
    }

    @ExceptionHandler
    private ResponseEntity<ErrorResponse> handleException (UserValidationException e) {
        ErrorResponse response = new ErrorResponse(e.getMessageList());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
