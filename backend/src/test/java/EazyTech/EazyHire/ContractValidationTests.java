package EazyTech.EazyHire;

import EazyTech.EazyHire.models.dtos.ChangePasswordRequestDTO;
import EazyTech.EazyHire.models.dtos.CompanyStatusRequestDTO;
import EazyTech.EazyHire.models.dtos.RegisterRequestDTO;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ContractValidationTests {

    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void registrationRequiresBusinessContractFields() {
        RegisterRequestDTO request = new RegisterRequestDTO();
        request.setEmail("hr@easytech.vn");
        request.setPassword("Password1");
        request.setFullName("Nguyễn Văn A");
        request.setCompanyName("EasyTech");
        request.setTaxCode("0123456789");
        request.setPhone("0901234567");
        request.setAddress("Hà Nội");

        var invalidFields = validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .toList();

        assertThat(invalidFields).contains("subdomain", "industry", "companySize", "description");
    }

    @Test
    void passwordContractRejectsMoreThanSeventyTwoCharacters() {
        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO();
        request.setCurrentPassword("OldPassword1");
        request.setNewPassword("A1" + "x".repeat(71));
        request.setConfirmPassword(request.getNewPassword());

        assertThat(validator.validate(request)).anyMatch(
                violation -> violation.getPropertyPath().toString().equals("newPassword")
        );
    }

    @Test
    void companyStatusContractRequiresSupportedStatus() {
        CompanyStatusRequestDTO request = new CompanyStatusRequestDTO();
        assertThat(validator.validate(request)).isNotEmpty();

        request.setStatus(CompanyStatus.ACTIVE);
        assertThat(validator.validate(request)).isEmpty();
    }
}
