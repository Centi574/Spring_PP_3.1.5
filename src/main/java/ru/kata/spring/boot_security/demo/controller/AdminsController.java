package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RegistrationService;
import ru.kata.spring.boot_security.demo.service.UserDetailsServiceImpl;
import ru.kata.spring.boot_security.demo.util.ErrorResponse;
import ru.kata.spring.boot_security.demo.util.UserValidationException;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/api/admin")
public class AdminsController {

    private final RegistrationService registrationService;

    private final UserDetailsServiceImpl userService;

    @Autowired
    public AdminsController(RegistrationService registrationService, UserDetailsServiceImpl userService) {
        this.registrationService = registrationService;
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> printUserList() {
        List<User> allUsers = userService.getAllUsers();
        return ResponseEntity.ok(allUsers);
    }

    @GetMapping("/users/authenticatedUser")
    public ResponseEntity<User> printAuthenticatedUser() {
        User user = userService.getAuthenticatedUser();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> printAllRoles() {
        List<Role> allRoles = registrationService.getAllRoles();
        return ResponseEntity.ok(allRoles);
    }

    @PostMapping("/create")
    public ResponseEntity<User> addUser(@RequestBody @Valid User user, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {

            List<String> errorsList = new ArrayList<>();
            List<FieldError> fieldErrors = bindingResult.getFieldErrors();

            for (FieldError error: fieldErrors) {
                errorsList.add(error.getDefaultMessage());
            }
            throw new UserValidationException(errorsList);
        }

        User addedUser = registrationService.saveUser(user);
        return ResponseEntity.ok(addedUser);
    }

    @ExceptionHandler
    private ResponseEntity<ErrorResponse> handleException(UserValidationException e) {
        ErrorResponse response = new ErrorResponse(e.getMessageList());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
