package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.auth.AuthResponse;
import com.vr.taskflow.dto.auth.LoginRequest;
import com.vr.taskflow.dto.auth.RegisterRequest;
import com.vr.taskflow.entity.Role;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.repository.RoleRepository;
import com.vr.taskflow.repository.UserRepository;
import com.vr.taskflow.security.JwtTokenProvider;
import com.vr.taskflow.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("Email is already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException("Username is already taken", HttpStatus.CONFLICT);
        }

        Role memberRole = roleRepository.findByName("MEMBER")
                .orElseThrow(() -> new ApiException(ErrorMessages.ROLE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR));

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRoles(Set.of(memberRole));

        User saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getEmail());

        UserPrincipal principal = UserPrincipal.from(saved);
        String token = jwtTokenProvider.generateToken(principal);

        return buildAuthResponse(token, saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(ErrorMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.of(token, user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(), roles);
    }
}
