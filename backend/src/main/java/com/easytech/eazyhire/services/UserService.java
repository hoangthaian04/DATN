package com.easytech.eazyhire.services;

import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.UserStatus;

import java.util.Optional;

public interface UserService {
    boolean existsByEmail(String email);

    Optional<UserEntity> findByEmailWithCompany(String email);

    Optional<UserEntity> findByGoogleId(String googleId);

    UserEntity getById(Long userId);

    UserEntity getByIdWithCompany(Long userId);

    UserEntity createPendingHrAdministrator(RegisterRequestDTO request, CompanyEntity company);

    UserEntity save(UserEntity user);

    void updateCompanyUsersStatus(Long companyId, UserStatus status);
}
