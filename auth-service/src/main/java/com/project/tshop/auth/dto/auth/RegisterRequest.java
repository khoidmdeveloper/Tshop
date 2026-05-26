package com.project.tshop.auth.dto.auth;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min=8) private String password;
    @NotBlank private String fullName;
    private String phone;
}
