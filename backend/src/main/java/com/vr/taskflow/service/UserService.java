package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.user.UpdateUserRequest;
import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.UserMapper;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       UserMapper userMapper,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        User updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }
}

