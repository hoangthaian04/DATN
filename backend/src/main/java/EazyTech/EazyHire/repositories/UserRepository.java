package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<UserEntity> findByGoogleId(String googleId);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.company WHERE u.id = :id")
    Optional<UserEntity> findByIdWithCompany(@Param("id") Long id);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.company WHERE u.email = :email")
    Optional<UserEntity> findByEmailWithCompany(@Param("email") String email);

    Page<UserEntity> findByRole(UserRole role, Pageable pageable);
}
