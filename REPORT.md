# HireAI Secure Recruitment Platform

## 1. Cover Page
Project Title: HireAI Secure Recruitment Platform
Module: ST6005CEM Security Coursework 2
Student Name: [Your Name]
Submission Date: 2026-07-06

## 2. Abstract
HireAI is a secure recruitment platform that connects job seekers and recruiters while demonstrating strong cybersecurity practices. The system implements secure authentication, role-based authorization, password policy enforcement, session hardening, upload protections, activity logging, and internal penetration testing evidence.

## 3. Table of Contents
1. Introduction
2. Software Details
3. Design and Implementation
4. Secure Development Practices
5. Internal Penetration Testing
6. Proof of Concept
7. Conclusion
8. References

## 4. Table of Figures
- Figure 1: System architecture diagram
- Figure 2: Authentication flow
- Figure 3: Vulnerability remediation workflow

## 5. Table of Abbreviations
- MFA: Multi-Factor Authentication
- RBAC: Role-Based Access Control
- XSS: Cross-Site Scripting
- CSRF: Cross-Site Request Forgery
- CVSS: Common Vulnerability Scoring System

## 6. Introduction
The project addresses the need for a secure and trustworthy recruitment platform where candidates can apply for jobs and recruiters can manage hiring workflows. Security was treated as a core requirement throughout development.

## 7. Software Details
The application uses React for the frontend and Node.js with Express for the backend. MongoDB stores user, job, company, assessment, and activity data. The server uses JWT-based authentication, bcrypt hashing, rate limiting, helmet, MongoDB sanitisation, and CSRF protection.

## 8. Design and Implementation
The system is designed around secure-by-design principles:
- Authentication: strong password policy, lockout, rate limiting, and MFA support.
- Authorization: role-based access controls for candidate, HR, and admin roles.
- Session management: HTTP-only secure cookies and logout invalidation.
- Input validation: request validation and XSS protection.
- File handling: restricted upload types and size limits.
- Logging: audit activity logs for authentication and security events.

## 9. Secure Development
The project was developed incrementally and pushed to GitHub with a meaningful commit history. Docker support and a CI workflow were added to improve reproducibility and automated validation.

## 10. Internal Penetration Testing
The application was reviewed using white-box testing, source code inspection, and manual API testing. The testing covered authentication, authorization, input validation, session handling, and file upload handling.

## 11. Proof of Concept
A proof-of-concept video should demonstrate:
- application overview
- implemented security controls
- two exploited vulnerabilities before fixes
- remediations and retesting

## 12. Conclusion
HireAI demonstrates how secure development practices can be integrated into a full-stack web application. The platform includes authentication hardening, authorization layers, logging, and modern deployment support.

## 13. References
- OWASP Foundation. (2021). OWASP Top 10.
- NIST. (2023). Digital Identity Guidelines.
- OWASP ASVS. (2023). Application Security Verification Standard.
- PortSwigger. (2024). Web Security Academy.
