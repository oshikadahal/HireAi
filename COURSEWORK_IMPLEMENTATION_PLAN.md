# Coursework Implementation Plan

## 1. Project Scope and Goal
Build a secure, original web application that solves a real user problem and demonstrates secure-by-design development, authentication hardening, authorization controls, logging, internal penetration testing, and professional documentation.

This project is the HireAI recruitment platform, which helps job seekers and recruiters connect securely while demonstrating strong cybersecurity practices.

## 2. Functional Requirements Checklist

### 2.1 User Management
- [ ] Secure user registration
- [ ] Secure login
- [ ] Password hashing using bcrypt
- [ ] Strong password validation
- [ ] Forgot password flow
- [ ] Optional email verification
- [ ] Multi-factor authentication (MFA)

### 2.2 Authentication Security
- [ ] Zero-trust authentication principles applied
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after repeated failed attempts
- [ ] CAPTCHA considered for login/registration (optional but recommended)
- [ ] Password complexity policy
- [ ] Password reuse prevention
- [ ] Optional password expiry

### 2.3 Authorization
- [ ] Role-Based Access Control for admin, hr, candidate
- [ ] Least privilege applied
- [ ] Access control enforced on pages and APIs
- [ ] Protection against IDOR and privilege escalation

### 2.4 User Profiles
- [ ] Secure profile editing
- [ ] Password change flow
- [ ] Profile picture upload
- [ ] Protection against mass assignment
- [ ] Protection against unauthorized profile access
- [ ] Optional data export/import

### 2.5 Session Management
- [ ] Secure cookies
- [ ] HttpOnly cookies
- [ ] Secure flag in production
- [ ] SameSite policy
- [ ] Logout invalidation
- [ ] Session timeout handling
- [ ] Optional user-agent/device binding

### 2.6 Input Validation and Injection Protection
- [ ] Server-side validation
- [ ] Protection against SQL Injection
- [ ] Protection against XSS
- [ ] Protection against CSRF
- [ ] File upload validation
- [ ] HTML injection prevention

### 2.7 Encryption and Data Protection
- [ ] Password hashing using bcrypt
- [ ] Sensitive data handling documented
- [ ] Secure key management approach described

### 2.8 Activity Logging and Monitoring
- [ ] Login logging
- [ ] Logout logging
- [ ] Registration logging
- [ ] Profile update logging
- [ ] Admin action logging
- [ ] Failed login logging
- [ ] Logs should not expose secrets

## 3. Secure Development Requirements Checklist
- [ ] GitHub repository created and maintained
- [ ] Minimum 40 meaningful commits
- [ ] Incremental development evidence
- [ ] Security improvements visible in history
- [ ] Docker containerization
- [ ] CI/CD pipeline with security checks

## 4. Internal Penetration Testing Checklist

### 4.1 Authentication Testing
- [ ] SQL injection testing
- [ ] Weak password testing
- [ ] Brute-force testing
- [ ] Username enumeration testing
- [ ] Password reset testing
- [ ] MFA bypass testing

### 4.2 Authorization Testing
- [ ] IDOR testing
- [ ] Horizontal privilege escalation testing
- [ ] Vertical privilege escalation testing
- [ ] Admin route protection testing

### 4.3 Session Management Testing
- [ ] Session fixation testing
- [ ] Session hijacking assessment
- [ ] Cookie security verification
- [ ] Logout and timeout testing

### 4.4 Input Validation Testing
- [ ] SQL injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] HTML injection testing
- [ ] Command injection review
- [ ] File upload attack testing

### 4.5 Business Logic Testing
- [ ] Workflow bypass testing
- [ ] Application submission flow testing
- [ ] Negative input testing

### 4.6 API Security Testing
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] Rate limiting validation
- [ ] Object-level authorization review
- [ ] Input validation review

## 5. Vulnerability Documentation Requirements
For every vulnerability found, record:
- [ ] Vulnerability name
- [ ] Category
- [ ] CVSS v3.1 score
- [ ] Severity
- [ ] Description
- [ ] Root cause
- [ ] Exploitation steps
- [ ] Payload used
- [ ] Screenshot evidence
- [ ] Source code snippet
- [ ] Fix implemented
- [ ] Retesting evidence

## 6. Proof of Concept Video Requirements
- [ ] Application overview shown
- [ ] Security features demonstrated
- [ ] Two vulnerabilities shown before fixing
- [ ] Exploitation shown
- [ ] Fixes demonstrated
- [ ] Retesting shown
- [ ] Student face visible
- [ ] Clear audio
- [ ] Closed captions

## 7. Report Structure Requirements
- [ ] Cover page
- [ ] Abstract
- [ ] Table of contents
- [ ] Table of figures
- [ ] Table of abbreviations
- [ ] Introduction
- [ ] Software details
- [ ] Design and implementation
- [ ] Secure development
- [ ] Internal penetration testing
- [ ] Proof of concept
- [ ] Conclusion
- [ ] References

## 8. Reference Requirements
- [ ] Minimum 15 academic/professional references
- [ ] Include OWASP, NIST, research papers, books, and standards
- [ ] Use CU Harvard or CU APA style

## 9. Step-by-Step Delivery Plan

### Phase 1: Core Project Hardening
1. Finalise secure authentication flow
2. Enforce strong password policy
3. Add MFA support
4. Add CSRF protection
5. Add rate limiting and lockout
6. Add activity logging
7. Harden file uploads

### Phase 2: Authorization and Privacy Controls
1. Review role-based access control on every route
2. Review object-level authorization for applications, jobs, profiles, and admin actions
3. Add profile privacy safeguards
4. Add optional export/import support

### Phase 3: Documentation and Evidence
1. Create a full report structure
2. Add vulnerability evidence files
3. Add screenshots and payload notes
4. Add PoC video plan and script

### Phase 4: DevOps and Reproducibility
1. Add GitHub Actions workflow
2. Add Docker containerization
3. Document setup steps
4. Verify reproducibility

### Phase 5: Penetration Testing
1. Perform white-box testing
2. Record findings with CVSS scores
3. Implement fixes
4. Retest and document results

## 10. Recommended Minimum Deliverables
- [ ] Fully functional secure app
- [ ] 40+ meaningful commits
- [ ] Docker setup
- [ ] CI/CD workflow
- [ ] Security report
- [ ] Penetration test evidence
- [ ] PoC video outline
