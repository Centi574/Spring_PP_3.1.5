package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RegistrationService;
import ru.kata.spring.boot_security.demo.service.UserDetailsServiceImpl;

import java.util.List;

@Controller
@RequestMapping(value = "/admin")
public class AdminsController {

    private final RegistrationService registrationService;

    private final UserDetailsServiceImpl userService;

    @Autowired
    public AdminsController(RegistrationService registrationService, UserDetailsServiceImpl userService) {
        this.registrationService = registrationService;
        this.userService = userService;
    }

    @GetMapping("/allUsers")
    public String printUserList(ModelMap model) {
        List<User> userList = userService.getAllUsers();
        model.addAttribute("userList", userList);
        return "allUsers";
    }

    @GetMapping(value = "/new")
    public String addUser(@ModelAttribute("user") User user) {
        return "new";
    }

    @PostMapping()
    public String saveUser(@ModelAttribute User user) {
        registrationService.saveUser(user);
        return "redirect:/admin/allUsers";
    }
}
