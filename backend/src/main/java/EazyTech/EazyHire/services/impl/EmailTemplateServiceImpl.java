package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.models.entities.*;
import EazyTech.EazyHire.models.enums.*;
import EazyTech.EazyHire.repositories.*;
import EazyTech.EazyHire.services.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.regex.*;

@Service @RequiredArgsConstructor
public class EmailTemplateServiceImpl implements EmailTemplateService {
    private static final Set<String> ALLOWED_VARIABLES = Set.of("candidateName", "jobTitle", "companyName", "interviewDate");
    private static final Pattern VARIABLE = Pattern.compile("\\{\\{\\s*([A-Za-z][A-Za-z0-9_]*)\\s*}}") ;
    private final EmailTemplateRepository templates;
    private final CompanyRepository companies;
    private final HiringRoundRepository rounds;
    private final AuditService audit;
    private final ObjectMapper objectMapper;

    @Override @Transactional
    public Page<EmailTemplateDTO> getTemplates(Long companyId, String keyword, EmailTemplateType type, boolean activeOnly, int page, int size) {
        ensureSeeded(companyId);
        if (page < 1 || size < 1 || size > 100) throw new CustomException(400, "Page phải từ 1 và size từ 1 đến 100.");
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<EmailTemplateEntity> result;
        if (keyword != null && !keyword.isBlank()) result = templates.findByCompanyIdAndIsDeletedFalseAndTemplateNameContainingIgnoreCase(companyId, keyword.trim(), pageable);
        else if (type != null && activeOnly) result = templates.findByCompanyIdAndIsDeletedFalseAndTypeAndIsActiveTrue(companyId, type, pageable);
        else if (type != null) result = templates.findByCompanyIdAndIsDeletedFalseAndType(companyId, type, pageable);
        else if (activeOnly) result = templates.findByCompanyIdAndIsDeletedFalseAndIsActiveTrue(companyId, pageable);
        else result = templates.findByCompanyIdAndIsDeletedFalse(companyId, pageable);
        return result.map(this::toDto);
    }

    @Override @Transactional
    public EmailTemplateDTO create(Long companyId, Long userId, EmailTemplateCreateRequestDTO request) {
        String name = required(request.getTemplateName(), "Tên mẫu email");
        if (templates.existsByCompanyIdAndIsDeletedFalseAndTemplateNameIgnoreCase(companyId, name)) throw new CustomException(409, "Tên email template đã tồn tại. Vui lòng dùng tên khác.");
        String subject = required(request.getSubject(), "Tiêu đề email");
        String body = required(request.getBodyHtml(), "Nội dung email");
        EmailTemplateEntity saved = templates.save(EmailTemplateEntity.builder().company(company(companyId)).templateName(name).type(request.getType()).subject(subject).bodyHtml(safeBody(body)).variables(variablesJson(subject, body)).templateScope(TemplateScope.CUSTOM).isActive(!Boolean.FALSE.equals(request.getIsActive())).build());
        audit.record(userId, companyId, "CREATE_EMAIL_TEMPLATE", "Tạo template: " + name);
        return toDto(saved);
    }

    @Override @Transactional
    public EmailTemplateDTO update(Long companyId, Long userId, Long templateId, EmailTemplateUpdateRequestDTO request) {
        EmailTemplateEntity entity = get(templateId, companyId);
        if (request.getBodyHtml() != null) entity.setBodyHtml(safeBody(required(request.getBodyHtml(), "Nội dung email")));
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
        entity.setVariables(variablesJson(entity.getSubject(), entity.getBodyHtml()));
        EmailTemplateEntity saved = templates.save(entity);
        audit.record(userId, companyId, "UPDATE_EMAIL_TEMPLATE", "Cập nhật template: " + entity.getTemplateName());
        return toDto(saved);
    }

    @Override @Transactional
    public void delete(Long companyId, Long userId, Long templateId) {
        EmailTemplateEntity entity = get(templateId, companyId);
        if (entity.getTemplateScope() == TemplateScope.SYSTEM) throw new CustomException(403, "Không thể xóa mẫu email mặc định của hệ thống.");
        if (rounds.existsByPassEmailTemplateIdOrFailEmailTemplateId(templateId, templateId)) throw new CustomException(409, "Không thể xóa template đang được sử dụng trong vòng tuyển dụng.");
        entity.setIsDeleted(true); templates.save(entity);
        audit.record(userId, companyId, "DELETE_EMAIL_TEMPLATE", "Xóa template: " + entity.getTemplateName());
    }

    @Override @Transactional(readOnly = true)
    public void validateRoundTemplate(Long companyId, Long templateId, EmailTemplateType expectedType) {
        if (templateId == null) return;
        EmailTemplateEntity entity = get(templateId, companyId);
        if (!Boolean.TRUE.equals(entity.getIsActive()) || entity.getType() != expectedType) throw new CustomException(400, "Email template được chọn không hợp lệ cho vòng tuyển dụng.");
    }

    private EmailTemplateEntity get(Long id, Long companyId) { return templates.findByIdAndCompanyIdAndIsDeletedFalse(id, companyId).orElseThrow(() -> new CustomException(404, "Không tìm thấy Email Template.")); }
    private CompanyEntity company(Long id) { return companies.findById(id).orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp.")); }
    private String required(String value, String name) { if (value == null || value.trim().isEmpty()) throw new CustomException(400, name + " không được để trống."); return value.trim(); }
    private String safeBody(String body) { if (Pattern.compile("(?i)<\\s*script|on[a-z]+\\s*=|javascript:").matcher(body).find()) throw new CustomException(400, "Nội dung email chứa HTML không an toàn."); return body; }
    private String variablesJson(String subject, String body) { Set<String> names = new LinkedHashSet<>(); Matcher m = VARIABLE.matcher(subject + "\n" + body); while (m.find()) { if (!ALLOWED_VARIABLES.contains(m.group(1))) throw new CustomException(400, "Biến " + m.group(1) + " không được hỗ trợ."); names.add(m.group(1)); } try { return objectMapper.writeValueAsString(names); } catch (Exception e) { throw new CustomException(500, "Không thể xử lý biến email.", e); } }
    private List<String> variables(String json) { try { return objectMapper.readValue(json, new TypeReference<List<String>>() {}); } catch (Exception e) { return List.of(); } }
    private EmailTemplateDTO toDto(EmailTemplateEntity e) { return EmailTemplateDTO.builder().id(e.getId()).templateName(e.getTemplateName()).type(e.getType()).subject(e.getSubject()).bodyHtml(e.getBodyHtml()).variables(variables(e.getVariables())).templateScope(e.getTemplateScope()).isActive(e.getIsActive()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build(); }
    private void ensureSeeded(Long companyId) {
        CompanyEntity company = company(companyId);
        seed(company, EmailTemplateType.APPLICATION_RECEIVED, "Xác nhận nhận hồ sơ", "Xác nhận ứng tuyển vị trí {{jobTitle}}", "Xin chào {{candidateName}}, chúng tôi đã nhận được hồ sơ của bạn tại {{companyName}}.");
        seed(company, EmailTemplateType.PASS, "Thông báo đạt vòng", "Kết quả tuyển dụng tại {{companyName}}", "Xin chào {{candidateName}}, chúc mừng bạn đã vượt qua vòng tuyển dụng cho vị trí {{jobTitle}}.");
        seed(company, EmailTemplateType.FAIL, "Thông báo không đạt", "Kết quả tuyển dụng tại {{companyName}}", "Xin chào {{candidateName}}, cảm ơn bạn đã ứng tuyển vị trí {{jobTitle}}.");
        seed(company, EmailTemplateType.INTERVIEW_INVITE, "Mời phỏng vấn", "Thư mời phỏng vấn vị trí {{jobTitle}}", "Xin chào {{candidateName}}, mời bạn tham gia phỏng vấn vào {{interviewDate}}.");
        seed(company, EmailTemplateType.OFFER, "Thư mời nhận việc", "Offer từ {{companyName}}", "Xin chào {{candidateName}}, chúng tôi trân trọng gửi thư mời nhận việc.");
    }
    private void seed(CompanyEntity company, EmailTemplateType type, String name, String subject, String body) { if (!templates.existsByCompanyIdAndIsDeletedFalseAndTypeAndTemplateScope(company.getId(), type, TemplateScope.SYSTEM)) templates.save(EmailTemplateEntity.builder().company(company).templateName(name).type(type).subject(subject).bodyHtml(body).variables(variablesJson(subject, body)).templateScope(TemplateScope.SYSTEM).build()); }
}
