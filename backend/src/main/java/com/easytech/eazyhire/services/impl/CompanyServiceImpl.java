package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.core.utils.StringUtils;
import com.easytech.eazyhire.models.dtos.response.CompanyDetailResponseDTO;
import com.easytech.eazyhire.models.dtos.request.CompanyFilterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyResponseDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyProfileDTO;
import com.easytech.eazyhire.models.dtos.request.OnboardingRequestDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.entities.CareerSiteEntity;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.CompanyProfileEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserStatus;
import com.easytech.eazyhire.models.mappers.CompanyMapper;
import com.easytech.eazyhire.repositories.CareerSiteRepository;
import com.easytech.eazyhire.repositories.CompanyProfileRepository;
import com.easytech.eazyhire.repositories.CompanyRepository;
import com.easytech.eazyhire.services.AuditLogService;
import com.easytech.eazyhire.services.CompanyService;
import com.easytech.eazyhire.services.EmailNotificationService;
import com.easytech.eazyhire.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");

    private final CompanyRepository companyRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CareerSiteRepository careerSiteRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final EmailNotificationService emailNotificationService;
    private final CompanyMapper companyMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponseDTO> getCompanies(CompanyFilterRequestDTO request) {
        String search = request.getSearchText() == null || request.getSearchText().isBlank()
                ? null : "%" + request.getSearchText().trim().toLowerCase(Locale.ROOT) + "%";
        return companyRepository.searchCompanies(request.getStatus(), search, request.getPageable())
                .map(companyMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDetailResponseDTO getCompanyDetail(Long id) {
        return toDetail(getCompany(id));
    }

    @Override
    public CompanyEntity createPendingCompany(RegisterRequestDTO request) {
        String taxCode = request.getTaxCode().trim();
        if (companyRepository.existsByTaxCodeIgnoreCase(taxCode)) {
            throw new CustomException(409, "Mã số thuế này đã được đăng ký. Vui lòng liên hệ hỗ trợ nếu có nhầm lẫn.");
        }

        String baseSlug = StringUtils.toSlug(request.getCompanyName());
        String slug = baseSlug;
        int suffix = 1;
        while (companyRepository.existsBySlug(slug)) slug = baseSlug + "-" + suffix++;

        return companyRepository.save(CompanyEntity.builder()
                .name(request.getCompanyName().trim()).slug(slug).taxCode(taxCode)
                .phone(trimToNull(request.getPhone())).email(normalizeEmail(request.getEmail()))
                .address(trimToNull(request.getAddress())).status(CompanyStatus.PENDING).build());
    }

    @Override
    public CompanyProfileEntity createInitialProfile(CompanyEntity company, RegisterRequestDTO request) {
        return companyProfileRepository.save(CompanyProfileEntity.builder()
                .company(company).primaryColor("#2563eb")
                .businessType(trimToNull(request.getBusinessType()))
                .industry(trimToNull(request.getIndustry())).companySize(trimToNull(request.getCompanySize()))
                .onboardingCompleted(false).profileCompleted(false).build());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileEntity getProfile(Long companyId) {
        return companyProfileRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy hồ sơ doanh nghiệp"));
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileDTO getProfileResponse(Long companyId) {
        return companyMapper.toProfile(getProfile(companyId));
    }

    @Override
    @Transactional
    public CompanyDetailResponseDTO updateProfile(Long companyId, OnboardingRequestDTO request) {
        CompanyEntity company = getCompany(companyId);
        requireActiveCompany(company);
        CompanyProfileEntity profile = getProfile(companyId);

        if (request.getCompanyName() != null) company.setName(request.getCompanyName().trim());
        if (request.getTaxCode() != null) updateTaxCode(company, request.getTaxCode());
        if (request.getPhone() != null) company.setPhone(trimToNull(request.getPhone()));
        if (request.getEmail() != null) company.setEmail(trimToNull(request.getEmail()));
        if (request.getWebsite() != null) company.setWebsite(trimToNull(request.getWebsite()));
        if (request.getAddress() != null) company.setAddress(trimToNull(request.getAddress()));
        if (request.getLogoUrl() != null) profile.setLogoUrl(trimToNull(request.getLogoUrl()));
        if (request.getBannerUrl() != null) profile.setBannerUrl(trimToNull(request.getBannerUrl()));
        if (request.getPrimaryColor() != null) profile.setPrimaryColor(trimToNull(request.getPrimaryColor()));
        if (request.getDescription() != null) profile.setDescription(trimToNull(request.getDescription()));
        if (request.getBenefits() != null) profile.setBenefits(trimToNull(request.getBenefits()));
        if (request.getBusinessType() != null) profile.setBusinessType(trimToNull(request.getBusinessType()));
        if (request.getIndustry() != null) profile.setIndustry(trimToNull(request.getIndustry()));
        if (request.getCompanySize() != null) profile.setCompanySize(trimToNull(request.getCompanySize()));

        companyRepository.save(company);
        companyProfileRepository.save(profile);
        return toDetail(company);
    }

    @Override
    @Transactional
    public CompanyDetailResponseDTO completeOnboarding(Long companyId, boolean skip) {
        CompanyEntity company = getCompany(companyId);
        requireActiveCompany(company);
        CompanyProfileEntity profile = getProfile(companyId);
        boolean complete = isProfileComplete(company, profile);
        if (!skip && !complete) {
            throw new CustomException(400, "Vui lòng hoàn thiện mô tả, lĩnh vực, quy mô, website, địa chỉ và số điện thoại công ty");
        }
        profile.setOnboardingCompleted(true);
        profile.setProfileCompleted(complete);
        companyProfileRepository.save(profile);
        return toDetail(company);
    }

    @Override
    @Transactional
    public CompanyResponseDTO updateCompanyStatus(Long companyId, Long adminId, CompanyStatus target, String reason) {
        CompanyEntity company = getCompany(companyId);
        UserEntity admin = userService.getById(adminId);
        CompanyStatus previous = company.getStatus();
        validateTransition(previous, target, reason);

        company.setStatus(target);
        if (target == CompanyStatus.ACTIVE) {
            company.setApprovedBy(admin);
            company.setApprovedAt(LocalDateTime.now());
            company.setRejectedReason(null);
            userService.updateCompanyUsersStatus(companyId, UserStatus.ACTIVE);
            ensureCareerSite(company);
            emailNotificationService.sendCompanyApproved(company.getEmail(), company.getName());
        } else if (target == CompanyStatus.REJECTED) {
            company.setRejectedReason(reason.trim());
            emailNotificationService.sendCompanyRejected(company.getEmail(), company.getName(), reason.trim());
        } else if (target == CompanyStatus.BLOCKED) {
            userService.updateCompanyUsersStatus(companyId, UserStatus.BLOCKED);
        }

        CompanyEntity saved = companyRepository.save(company);
        auditLogService.record(saved, admin, actionFor(previous, target), "COMPANY", saved.getId(),
                "{\"fromStatus\":\"" + previous + "\",\"toStatus\":\"" + target + "\"}");
        return companyMapper.toResponse(saved);
    }

    private CompanyEntity getCompany(Long companyId) {
        return companyRepository.findByIdWithDetails(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp"));
    }

    private CompanyDetailResponseDTO toDetail(CompanyEntity company) {
        CompanyProfileEntity profile = companyProfileRepository.findByCompanyId(company.getId()).orElse(null);
        CareerSiteEntity site = careerSiteRepository.findByCompanyId(company.getId()).orElse(null);
        return companyMapper.toDetail(company, profile, site, findDuplicateWarnings(company));
    }

    private List<String> findDuplicateWarnings(CompanyEntity company) {
        if (company.getStatus() != CompanyStatus.PENDING) return List.of();
        List<String> warnings = new ArrayList<>();
        for (CompanyEntity active : companyRepository.findAllByStatus(CompanyStatus.ACTIVE)) {
            if (active.getId().equals(company.getId())) continue;
            if (company.getTaxCode() != null && active.getTaxCode() != null
                    && company.getTaxCode().trim().equalsIgnoreCase(active.getTaxCode().trim())) {
                warnings.add("Mã số thuế trùng với doanh nghiệp đang hoạt động: " + active.getName());
            }
            double similarity = nameSimilarity(company.getName(), active.getName());
            if (similarity > 0.90d) {
                warnings.add("Tên doanh nghiệp giống " + Math.round(similarity * 100)
                        + "% với doanh nghiệp đang hoạt động: " + active.getName());
            }
        }
        return warnings;
    }

    private void updateTaxCode(CompanyEntity company, String rawTaxCode) {
        String taxCode = rawTaxCode.trim();
        if (!taxCode.equalsIgnoreCase(company.getTaxCode()) && companyRepository.existsByTaxCodeIgnoreCase(taxCode)) {
            throw new CustomException(409, "Mã số thuế này đã được đăng ký");
        }
        company.setTaxCode(taxCode);
    }

    private void validateTransition(CompanyStatus from, CompanyStatus to, String reason) {
        boolean valid = (from == CompanyStatus.PENDING && (to == CompanyStatus.ACTIVE || to == CompanyStatus.REJECTED))
                || (from == CompanyStatus.ACTIVE && to == CompanyStatus.BLOCKED)
                || (from == CompanyStatus.BLOCKED && to == CompanyStatus.ACTIVE);
        if (!valid) throw new CustomException(409, "Không thể chuyển trạng thái doanh nghiệp từ " + from + " sang " + to);
        if (to == CompanyStatus.REJECTED && (reason == null || reason.trim().length() < 10)) {
            throw new CustomException(400, "Lý do từ chối phải có ít nhất 10 ký tự");
        }
    }

    private void ensureCareerSite(CompanyEntity company) {
        if (careerSiteRepository.findByCompanyId(company.getId()).isPresent()) return;
        careerSiteRepository.save(CareerSiteEntity.builder().company(company)
                .siteTitle("Cơ hội nghề nghiệp tại " + company.getName())
                .tagline("Gia nhập đội ngũ tài năng của chúng tôi").accentColor("#2563eb")
                .fontFamily("Inter").showCompanyDescription(true).showBenefits(true).build());
    }

    private boolean isProfileComplete(CompanyEntity company, CompanyProfileEntity profile) {
        return hasText(profile.getDescription()) && hasText(profile.getIndustry())
                && hasText(profile.getCompanySize()) && hasText(company.getWebsite())
                && hasText(company.getAddress()) && hasText(company.getPhone());
    }

    private void requireActiveCompany(CompanyEntity company) {
        if (company.getStatus() != CompanyStatus.ACTIVE) throw new CustomException(403, "Doanh nghiệp chưa được phê duyệt");
    }

    private String actionFor(CompanyStatus previous, CompanyStatus target) {
        if (previous == CompanyStatus.BLOCKED && target == CompanyStatus.ACTIVE) {
            return "UNBLOCK_BUSINESS";
        }
        return switch (target) {
            case ACTIVE -> "APPROVE_BUSINESS";
            case REJECTED -> "REJECT_BUSINESS";
            case BLOCKED -> "BLOCK_BUSINESS";
            default -> "UPDATE_BUSINESS_STATUS";
        };
    }

    private double nameSimilarity(String first, String second) {
        String left = normalizeName(first);
        String right = normalizeName(second);
        int maximumLength = Math.max(left.length(), right.length());
        return maximumLength == 0 ? 1.0d : 1.0d - ((double) levenshteinDistance(left, right) / maximumLength);
    }

    private int levenshteinDistance(String left, String right) {
        int[] previous = new int[right.length() + 1];
        for (int index = 0; index <= right.length(); index++) previous[index] = index;
        for (int leftIndex = 1; leftIndex <= left.length(); leftIndex++) {
            int[] current = new int[right.length() + 1];
            current[0] = leftIndex;
            for (int rightIndex = 1; rightIndex <= right.length(); rightIndex++) {
                int cost = left.charAt(leftIndex - 1) == right.charAt(rightIndex - 1) ? 0 : 1;
                current[rightIndex] = Math.min(Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1),
                        previous[rightIndex - 1] + cost);
            }
            previous = current;
        }
        return previous[right.length()];
    }

    private String normalizeName(String value) {
        return DIACRITICS.matcher(Normalizer.normalize(value, Normalizer.Form.NFD)).replaceAll("")
                .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
