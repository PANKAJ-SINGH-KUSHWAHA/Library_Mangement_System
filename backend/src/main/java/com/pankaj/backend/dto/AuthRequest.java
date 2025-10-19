package com.pankaj.backend.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
