package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserDetailsServiceImpl;
import ru.kata.spring.boot_security.demo.util.ErrorResponse;
import ru.kata.spring.boot_security.demo.util.UserValidationException;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/api/user")
public class UsersController {

    private final UserDetailsServiceImpl userService;

    @Autowired
    public UsersController(UserDetailsServiceImpl userService) {
        this.userService = userService;
    }

    @GetMapping()
    public ResponseEntity<User> defaultUserPage() {
        User authenticatedUser = userService.getAuthenticatedUser();
        return ResponseEntity.ok(authenticatedUser);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<User> showUserById(@PathVariable(value = "id") int id) {
        User userById = userService.getUserById(id);
        return ResponseEntity.ok(userById);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<User> updateUser(@RequestBody @Valid User user, BindingResult bindingResult, @PathVariable(value = "id") int id) {

        if (bindingResult.hasErrors()) {
            List<String> errorsList = new ArrayList<>();
            List<FieldError> fieldErrors = bindingResult.getFieldErrors();

            for (FieldError error : fieldErrors) {
                String message = error.getDefaultMessage();
                errorsList.add(message + ";");
            }
            throw new UserValidationException(errorsList);
        }

        userService.updateById(user, id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> removeUserById(@PathVariable(value = "id") int id) {
        userService.removeUser(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @ExceptionHandler
    private ResponseEntity<ErrorResponse> handleException(UserValidationException e) {
        ErrorResponse response = new ErrorResponse(e.getMessageList());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}