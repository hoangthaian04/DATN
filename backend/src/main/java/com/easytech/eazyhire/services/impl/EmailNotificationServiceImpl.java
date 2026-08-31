package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.services.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@easytech.vn}")
    private String fromAddress;

    @Value("${app.mail.admin-recipient:admin@easytech.vn}")
    private String adminRecipient;

    @Override
    public void sendRegistrationReceived(String recipientEmail, String companyName) {
        send(recipientEmail, "EasyTech đã nhận hồ sơ đăng ký",
                "Hồ sơ doanh nghiệp " + companyName + " đang chờ quản trị viên phê duyệt.");
    }

    @Override
    public void notifyAdminOfRegistration(String companyName, String registrantEmail) {
        send(adminRecipient, "Có doanh nghiệp mới chờ phê duyệt",
                companyName + " vừa đăng ký với email " + registrantEmail + ".");
    }

    @Override
    public void sendCompanyApproved(String recipientEmail, String companyName) {
        send(recipientEmail, "Tài khoản EasyTech đã được phê duyệt",
                "Doanh nghiệp " + companyName + " đã được phê duyệt. Bạn có thể đăng nhập ngay.");
    }

    @Override
    public void sendCompanyRejected(String recipientEmail, String companyName, String reason) {
        send(recipientEmail, "Hồ sơ EasyTech chưa được phê duyệt",
                "Doanh nghiệp " + companyName + " chưa được phê duyệt.\n\n"
                        + "Lý do: " + reason + "\n\n"
                        + "Vui lòng đăng nhập EasyTech, mở trang Hồ sơ bị từ chối tại "
                        + "/registration/rejected, chỉnh sửa thông tin theo lý do trên và gửi lại hồ sơ "
                        + "để Admin xem xét lại.");
    }

    private void send(String recipient, String subject, String body) {
        if (!mailEnabled) {
            log.info("Email delivery disabled; skipped message '{}' to {}", subject, recipient);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException exception) {
            log.error("Unable to send email '{}' to {}", subject, recipient, exception);
        }
    }
}
