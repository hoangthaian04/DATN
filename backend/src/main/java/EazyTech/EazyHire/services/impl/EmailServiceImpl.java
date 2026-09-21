package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final MailSender mailSender;

    @Value("${app.mail-from:${spring.mail.username:no-reply@easyhire.local}}")
    private String fromEmail;

    @Override
    public boolean sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("Email sent to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            return false;
        }
    }
}
