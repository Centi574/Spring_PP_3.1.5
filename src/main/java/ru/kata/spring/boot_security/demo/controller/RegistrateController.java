package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RegistrationService;

@Controller
@RequestMapping("/registration")
public class RegistrateController {

    private final RegistrationService registrationService;

    @Autowired
    public RegistrateController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping()
    public String registrationPage(@ModelAttribute("user") User user) {
        return "registration";
    }

    @PostMapping()
    public String register(@ModelAttribute("user") User user, BindingResult bindingResult, Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("registrationError", "Ошибка валидации. Пожалуйста, проверьте введенные данные.");
            return "registration";
        }
        try {
            registrationService.performRegistration(user);
            model.addAttribute("successRegistration", "Регистрация прошла успешно");
            return "redirect:/login";
        } catch (Exception e) {
            model.addAttribute("registrationError", "Ошибка при регистрации");
            return "registration";
        }
    }
}
