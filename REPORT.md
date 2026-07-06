# HireAI Secure Recruitment Platform

## 1. Cover Page
Project Title: HireAI Secure Recruitment Platform
Module: ST6005CEM Security Coursework 2
Student Name: [Your Name]
Submission Date: 2026-07-06

## 2. Abstract
HireAI is a secure recruitment platform designed to support candidates, recruiters, and administrators in a modern hiring workflow. The system was developed as a full-stack web application with security treated as a first-class requirement rather than a late-stage addition. The implementation includes strong authentication and authorization controls, secure session handling, robust input validation, restricted file uploads, activity logging, containerization, and automated security checks. This report documents the architecture, the security mechanisms implemented, the internal penetration testing process, the evidence gathered, and the remediation actions taken.

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
- Figure 1: System architecture overview
- Figure 2: Authentication and session flow
- Figure 3: Vulnerability remediation workflow

## 5. Table of Abbreviations
- MFA: Multi-Factor Authentication
- RBAC: Role-Based Access Control
- XSS: Cross-Site Scripting
- CSRF: Cross-Site Request Forgery
- CVSS: Common Vulnerability Scoring System
- JWT: JSON Web Token

## 6. Introduction
The digital recruitment landscape requires trust, privacy, and resilience against common web application attacks. HireAI addresses this need by combining a practical hiring workflow with a security-focused implementation that protects user accounts, admin operations, and sensitive application data. The project demonstrates how secure development principles can be embedded in a real-world application from the start of the design process.

## 7. Software Details
HireAI is implemented using React for the frontend and Node.js with Express for the backend, supported by MongoDB for persistent storage. The application supports candidate registration, employer registration, job posting, application tracking, user profile management, and administrative oversight. On the security side, the system implements JWT-based authentication, bcrypt password hashing, secure cookies, password complexity rules, rate limiting, request validation, XSS and CSRF protection, upload restrictions, and audit logging.

## 8. Design and Implementation
The architecture follows a layered design in which the client communicates with a RESTful backend that enforces security rules before accessing business logic. The main security features are summarised below:
- Authentication: password policy enforcement, account lockout after repeated failed login attempts, and MFA-ready account handling.
- Authorization: role-based access control for candidate, HR, and admin roles, ensuring that privileged actions are restricted to the appropriate users.
- Session Management: HTTP-only, secure cookies are used for authentication tokens, with logout clearing the session state.
- Input Validation: the backend validates request bodies and rejects malformed or malicious input before processing.
- File Handling: upload endpoints restrict file types and size to reduce the risk of unsafe content being processed.
- Logging and Monitoring: activity logging records authentication and sensitive actions to support auditability and incident review.

The implementation also includes development support tools such as Docker for reproducibility and a GitHub Actions workflow for automated security-oriented validation.

## 9. Secure Development Practices
Security was integrated throughout the development lifecycle. The project was developed incrementally with meaningful commits, documented milestones, and a structured GitHub repository. The use of Docker supports consistent deployment across environments, while the CI workflow provides a repeatable check for basic security and build health. The implementation also followed secure coding practices such as avoiding hardcoded secrets, validating user input, and protecting sensitive routes with middleware-based controls.

## 10. Internal Penetration Testing
An internal penetration testing exercise was performed to evaluate the application against common web security threats. The testing covered authentication, authorization, input validation, session management, and file-upload handling. Findings were documented, fixes were implemented, and retesting was performed to verify that the remediations were effective.

The principal findings were:
- Weak password policy, which was addressed through stricter password complexity enforcement.
- Missing CSRF protection for state-changing requests, which was addressed through middleware-based token validation.

## 11. Proof of Concept
The proof-of-concept video demonstrates the application workflow and the main security features. The planned sequence is as follows:
1. Introduce the project and explain its purpose.
2. Show secure registration, login, and password policy enforcement.
3. Demonstrate the first vulnerability and explain the original weakness.
4. Demonstrate the second vulnerability and show how it was mitigated.
5. Present the remediation and the successful retest.

This video is intended to provide visual evidence of the implemented security controls and the effectiveness of the fixes.

## 12. Conclusion
HireAI demonstrates that secure software engineering can be incorporated into a realistic full-stack project without sacrificing usability. The platform provides a practical recruitment workflow while embodying strong defenses against common attack vectors. The project also illustrates the importance of documentation, evidence collection, and continuous improvement in cybersecurity practice.

## 13. References
- OWASP Foundation. (2021). OWASP Top 10:2021.
- OWASP Foundation. (2023). OWASP Application Security Verification Standard (ASVS) 5.0.
- NIST. (2023). Digital Identity Guidelines (SP 800-63B).
- NIST. (2020). Security and Privacy Controls for Information Systems and Organizations (SP 800-53 Rev. 5).
- PortSwigger. (2024). Web Security Academy.
- MITRE. (2024). CWE Top 25 Most Dangerous Software Weaknesses.
- Stuttard, D., and Pinto, M. (2011). The Web Application Hacker's Handbook.
- Whitaker, A. (2013). Penetration Testing and Network Defense.
- Anderson, R. (2020). Security Engineering: A Guide to Building Dependable Distributed Systems.
- Ross, R., et al. (2019). NIST SP 800-161 Rev. 1: Supply Chain Risk Management Practices for Systems and Organizations.
- Schneier, B. (2015). Data and Goliath.
- Cigital. (2010). The Security Development Lifecycle.
- Microsoft. (2023). Secure Development Lifecycle Guidance.
- SANS Institute. (2024). Web Application Security Fundamentals.
