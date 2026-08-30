package com.easytech.eazyhire.repositories;

import com.easytech.eazyhire.models.entities.CareerSiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerSiteRepository extends JpaRepository<CareerSiteEntity, Long> {
    Optional<CareerSiteEntity> findByCompanyId(Long companyId);
}
