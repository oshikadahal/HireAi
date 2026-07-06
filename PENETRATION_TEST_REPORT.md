# Internal Penetration Testing Report

## 1. Overview
This report documents the internal penetration testing activities performed against the HireAI application. The testing focused on the backend authentication and state-changing endpoints, with additional review of session handling, upload processing, and route protection.

## 2. Scope
The assessment covered:
- User registration and login flows
- Password reset and password change operations
- Session handling and cookie configuration
- Authorization checks for protected routes
- Input validation and request manipulation
- File upload restrictions

## 3. Methodology
The testing used a combination of white-box review, manual API interaction, and targeted request manipulation. Source code inspection was used to identify vulnerable areas, followed by controlled testing against the running application to confirm the behaviour.

## 4. Summary of Findings

| ID | Vulnerability | Category | Severity | CVSS v3.1 | Status |
|---|---|---|---|---|---|
| F-01 | Weak password policy | Authentication | High | 7.5 | Fixed |
| F-02 | Missing CSRF protection for state-changing requests | Web Security | Medium | 6.1 | Fixed |

## 5. Detailed Findings

### F-01: Weak Password Policy
- Description: The initial authentication flow accepted weak passwords that lacked sufficient complexity.
- Impact: Attackers could register accounts using common or easily guessable passwords, increasing the risk of credential compromise.
- Root Cause: The registration and password change endpoints did not enforce a strong password policy consistently.
- Exploitation Steps:
  1. Submit a registration request with a short password such as "Password1!".
  2. Observe that the system accepted the password.
  3. Confirm that the account was created successfully.
- Payload Example: See [evidence/payloads/weak-password-payload.txt](evidence/payloads/weak-password-payload.txt).
- Evidence: The weakness was confirmed through repeated registration attempts using simple passwords.
- Fix Implemented: Password validation now requires at least 12 characters and a mix of uppercase, lowercase, numeric, and special characters.
- Retesting: Registration with weak passwords now fails with a validation error and the account is not created.

### F-02: Missing CSRF Protection
- Description: State-changing requests were not protected against cross-site request forgery attacks.
- Impact: A malicious third-party site could attempt to trigger account-changing actions from a victim's browser.
- Root Cause: No CSRF middleware or token validation was configured for mutating endpoints.
- Exploitation Steps:
  1. Create a malicious HTML form that posts to a state-changing endpoint.
  2. Lure a logged-in victim into submitting the form.
  3. Observe that the request is accepted without a valid CSRF token.
- Payload Example: See [evidence/payloads/csrf-payload.txt](evidence/payloads/csrf-payload.txt).
- Evidence: The issue was identified by reviewing the server middleware and confirming that no CSRF protection was present for state-changing routes.
- Fix Implemented: CSRF protection was added and requests without a valid token are rejected.
- Retesting: Mutating requests without a valid token now fail with a security error.

## 6. Evidence Repository
Supporting evidence and notes are stored in [evidence](evidence), including payload samples and testing notes.

## 7. Conclusion
The internal testing process identified two important weaknesses in the authentication and request handling layers. Both issues were remediated and retested successfully, which improves the overall security posture of the HireAI platform.
