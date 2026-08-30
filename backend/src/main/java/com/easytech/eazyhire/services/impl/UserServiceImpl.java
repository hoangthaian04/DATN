package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.enums.UserStatus;
import com.easytech.eazyhire.repositories.UserRepository;
import com.easytech.eazyhire.services.PasswordService;
import com.easytech.eazyhire.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(normalizeEmail(email));
    }

    @Override
    public Optional<UserEntity> findByEmailWithCompany(String email) {
        return userRepository.findByEmailWithCompany(normalizeEmail(email));
    }

    @Override
    public Optional<UserEntity> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    @Override
    public UserEntity getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));
    }

    @Override
    public UserEntity getByIdWithCompany(Long userId) {
        return userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));
    }

    @Override
    public UserEntity createPendingHrAdministrator(RegisterRequestDTO request, CompanyEntity company) {
        UserEntity user = UserEntity.builder()
                .email(normalizeEmail(request.getEmail()))
                .fullName(request.getFullName().trim())
                .passwordHash(passwordService.encode(request.getPassword()))
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.PENDING)
                .company(company)
                .build();
        return userRepository.save(user);
    }

    @Override
    public UserEntity save(UserEntity user) {
        return userRepository.save(user);
    }

    @Override
    public void updateCompanyUsersStatus(Long companyId, UserStatus status) {
        List<UserEntity> users = userRepository.findAllByCompanyId(companyId);
        users.forEach(user -> user.setStatus(status));
        userRepository.saveAll(users);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
