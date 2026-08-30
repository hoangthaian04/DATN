package com.easytech.eazyhire.services;

public interface EmailNotificationService {
    void sendRegistrationReceived(String recipientEmail, String companyName);

    void notifyAdminOfRegistration(String companyName, String registrantEmail);

    void sendCompanyApproved(String recipientEmail, String companyName);

    void sendCompanyRejected(String recipientEmail, String companyName, String reason);
}
