package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserDetailsServiceImpl;

import javax.validation.Valid;
import java.util.Set;

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
    public ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable(value = "id") int id) {
        userService.updateById(user, id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<User> removeUserById(@PathVariable(value = "id") int id) {
        User userToDelete = userService.getUserById(id);
        userService.removeUser(id);
        return ResponseEntity.ok(userToDelete);
    }

    private void checkUsersAccess(int id, Authentication authentication) {
        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
        String name = authentication.getName();
        User user = userService.findByName(name);
        if (user.getId() != id && !roles.contains("ROLE_ADMIN")) {
            throw new AccessDeniedException("Access denied");
        }
    }
}