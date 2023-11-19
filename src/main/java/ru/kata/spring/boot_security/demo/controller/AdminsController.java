package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RegistrationService;
import ru.kata.spring.boot_security.demo.service.UserDetailsServiceImpl;

import java.util.List;
import java.util.logging.Logger;

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

    @CrossOrigin
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
    public ResponseEntity<User> addUser(@RequestBody UserRequestDTO userRequestDTO) {
        User newUser = new User();
        newUser.setUsername(userRequestDTO.getUsername());
        newUser.setSurname(userRequestDTO.getSurname());
        newUser.setPassword(userRequestDTO.getPassword());

        User addedUser = registrationService.saveUser(newUser, userRequestDTO.getRoles());
        return ResponseEntity.ok(addedUser);
    }
}
