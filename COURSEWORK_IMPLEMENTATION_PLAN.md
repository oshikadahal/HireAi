# Coursework Implementation Plan

## 1. Project Scope and Problem Statement

### Objective
Build a custom web application that solves a real user problem while demonstrating secure software development principles.

### Application Concept
HireAI is a secure recruitment platform that helps job seekers and recruiters connect safely. It supports:
- Candidate registration and profile management
- HR/company registration and job posting
- Job applications and assessments
- Interviews and notifications
- Admin moderation and oversight

### Why the project is needed
The platform addresses the need for a secure, role-based hiring system that supports both candidates and recruiters in a controlled environment. It improves hiring efficiency while demonstrating strong cybersecurity practices.

### Uniqueness
The application is not a template; it is a custom recruitment workflow with role-based functionality and security-focused features.

---

## 2. Functional Requirements to Implement

### 2.1 User Management
- Secure user registration for candidates, HR, and admins
- Secure login and logout
- Password hashing using bcrypt
- Password strength validation
- Forgot password and password reset
- Optional MFA support

### 2.2 Authentication Security
- Zero-trust-inspired auth handling
- Rate limiting for login and sensitive endpoints
- Account lockout after repeated failed attempts
- Password policy enforcement
- Optional CAPTCHA integration if feasible

### 2.3 Authorization
- Role-Based Access Control (RBAC)
- Admin, HR, Candidate roles
- Restrict access to sensitive pages and APIs
- Prevent IDOR and privilege escalation

### 2.4 User Profiles
- Secure profile editing
- Password change support
- Profile picture upload
- Profile data handling with validation and authorization
- Optional export/import feature for privacy awareness

### 2.5 Session Management
- Secure, HttpOnly cookies
- Secure flag in production
- SameSite policy
- Session expiration and logout invalidation

### 2.6 Input Validation
- Server-side validation for all user input
- Protection against SQL injection, XSS, CSRF, and HTML injection
- File upload validation

### 2.7 Encryption and Data Protection
- Passwords hashed with bcrypt
- Sensitive data stored safely
- Secure environment variable usage
- Avoid logging secrets

### 2.8 Logging and Monitoring
- Log login, logout, registration, password changes, profile updates, admin actions
- Store logs without exposing sensitive data
- Support auditing and incident review

---

## 3. Security Features to Implement and Validate

### 3.1 Password Security
- Minimum length: 12 characters
- Require uppercase, lowercase, number, and special character
- Prevent password reuse where possible
- Optional password expiry in future extension
- Password strength feedback on UI if possible

### 3.2 Brute-Force Protection
- Login rate limiting
- Password reset rate limiting
- Account lockout after repeated failed attempts
- IP-based throttling

### 3.3 RBAC
- Restrict admin APIs and pages
- Restrict HR-only job management features
- Restrict candidate-only application features

### 3.4 Session Security
- HttpOnly, Secure, SameSite cookies
- Clear cookies on logout
- Token expiry
- Expire sessions safely on password change

### 3.5 Encryption and Storage Protection
- Use bcrypt for passwords
- Use HTTPS in deployment
- Store secrets in environment variables
- Limit file upload types and sizes

---

## 4. Development and Secure Engineering Requirements

### 4.1 GitHub and Version Control
- Host the project on GitHub
- Ensure a minimum of 40 meaningful commits
- Show incremental development and security improvements in commit history

### 4.2 Containerization
- Create a Dockerfile
- Create docker-compose.yml
- Ensure the project can be run in a containerized environment

### 4.3 CI/CD
- Add a GitHub Actions workflow for:
  - dependency install
  - linting or syntax checks
  - security checks if possible

---

## 5. Internal Penetration Testing Plan

### 5.1 Scope
Test:
- Authentication
- Authorization
- Session management
- Input validation
- File upload handling
- API security
- Business logic flaws

### 5.2 Methodology
- Use white-box testing through source code review
- Perform manual testing as primary method
- Use tools such as Burp Suite, Postman, curl, and browser developer tools
- Document findings and remediation steps

### 5.3 Test Areas

#### Authentication Testing
- SQL injection on login/register forms
- Weak password testing
- Brute-force testing
- Username enumeration
- Password reset flow testing
- MFA bypass attempts

#### Authorization Testing
- IDOR checks on job/application/company records
- Access control bypass for admin and HR endpoints
- Horizontal and vertical privilege escalation checks

#### Session Management Testing
- Session fixation and hijacking checks
- Cookie security inspection
- Logout and timeout behavior

#### Input Validation Testing
- XSS in profile fields and job descriptions
- CSRF on state-changing requests
- HTML injection
- File upload attacks

#### API Security Testing
- Missing auth checks
- Missing role checks
- Rate limiting bypass attempts
- Object-level authorization testing

---

## 6. Vulnerability Documentation Requirements

For every discovered vulnerability, document:
- Vulnerability name
- Category
- CVSS v3.1 score
- Severity
- Description
- Root cause
- Exploitation steps
- Payload used
- Screenshot evidence
- Source code snippet
- Fix implemented
- Retesting evidence

---

## 7. Proof of Concept Video Requirements

Create a video that shows:
- Application overview
- Security features implemented
- At least two realistic vulnerabilities before fixes
- Exploitation steps
- Code fixes and retesting
- Student face visible
- Clear audio
- Closed captions

---

## 8. Report Structure Requirements

### Required sections
1. Cover Page
2. Abstract
3. Table of Contents
4. Table of Figures
5. Table of Abbreviations
6. Introduction
7. Software Details
8. Design and Implementation
9. Secure Development
10. Internal Penetration Testing
11. Proof of Concept
12. Conclusion
13. References

### Report content expectations
- Explain system architecture and component interactions
- Describe security-by-design decisions and threat modeling
- Analyze risks and mitigations
- Include code-level examples of security mechanisms
- Map GitHub commits to design/security decisions
- Discuss emerging technologies where relevant
- Include at least 15 academic/professional references
- Use CU Harvard or CU APA styling

---

## 9. Evidence and Submission Checklist

### Functional evidence
- Secure registration and login work
- RBAC works
- Profile updates work securely
- Activity logs are created
- Upload handling is restricted

### Security evidence
- Password policy enforced
- Rate limiting active
- Account lockout works
- Secure cookies in use
- CSRF protection enabled
- MFA support available

### Penetration testing evidence
- At least two vulnerabilities found and fixed
- Evidence screenshots collected
- Retesting evidence collected
- Vulnerability report written

### Documentation evidence
- GitHub repository link
- Git history with many meaningful commits
- Docker setup available
- Report prepared
- Video prepared

---

## 10. Recommended Execution Order

1. Finalize the application scope and user problem statement
2. Ensure core features are functional
3. Implement and verify authentication and authorization
4. Add session and password hardening
5. Add activity logging and upload protections
6. Add MFA and CSRF
7. Add Docker + CI/CD
8. Perform internal penetration testing
9. Record screenshots, payloads, and retests
10. Write the formal report and prepare the video

---

## 11. Completion Checklist

- [ ] The application solves a real user problem
- [ ] The app is original and functional
- [ ] Authentication is secure
- [ ] RBAC is enforced
- [ ] Session management is secure
- [ ] Password policy is strong
- [ ] Brute-force protection exists
- [ ] Input validation exists
- [ ] File upload security exists
- [ ] Activity logging exists
- [ ] Docker setup exists
- [ ] GitHub history is meaningful and incremental
- [ ] Penetration testing is documented
- [ ] Vulnerability remediation is documented
- [ ] Report structure is complete
- [ ] References are included
- [ ] Proof of concept video is prepared
