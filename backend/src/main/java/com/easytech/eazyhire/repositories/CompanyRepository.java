package com.easytech.eazyhire.repositories;

import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEntity, Long> {

    Optional<CompanyEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    boolean existsByTaxCodeIgnoreCase(String taxCode);

    List<CompanyEntity> findAllByStatus(CompanyStatus status);

    Optional<CompanyEntity> findBySubdomain(String subdomain);

    @Query("SELECT c FROM CompanyEntity c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR " +
           " LOWER(c.name) LIKE :search OR " +
           " LOWER(c.email) LIKE :search OR " +
           " LOWER(c.phone) LIKE :search)")
    Page<CompanyEntity> searchCompanies(
            @Param("status") CompanyStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM CompanyEntity c " +
           "LEFT JOIN FETCH c.profile " +
           "LEFT JOIN FETCH c.careerSite " +
           "WHERE c.id = :id")
    Optional<CompanyEntity> findByIdWithDetails(@Param("id") Long id);
}
