# Security Coursework Report Template

## 1. Cover Page
- Project Title: HireAI Secure Recruitment Platform
- Student Name:
- Module: ST6005CEM Security Coursework 2
- Date:

## 2. Abstract
This report documents the secure design, implementation, and internal penetration testing of HireAI, a recruitment platform built with React and Node.js.

## 3. Table of Contents
- Introduction
- Software Details
- Design and Implementation
- Secure Development
- Internal Penetration Testing
- Proof of Concept
- Conclusion
- References

## 4. Vulnerability Documentation
| Vulnerability | Category | Severity | Fix |
|---|---|---|---|
| Weak password policy | Authentication | High | Enforced 12-character mixed-complexity passwords |
| Missing CSRF protection | Web Security | Medium | Added CSRF middleware |
| No MFA | Authentication | Medium | Added TOTP-based MFA flow |
| Weak session handling | Session Management | Medium | Added HTTP-only secure cookies |

## 5. Penetration Testing Summary
- Authentication testing completed
- Authorization testing completed
- Session management testing completed
- Input validation testing completed

## 6. References
- OWASP Top 10
- NIST SP 800-63B
- OWASP ASVS
- Node.js Security Best Practices
