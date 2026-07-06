# Proof of Concept Video Plan

## 1. Objective
The proof-of-concept video should demonstrate that HireAI is both functional and secure. It should show the platform in use, highlight the implemented security controls, and explain two vulnerabilities that were identified and remediated during testing.

## 2. Suggested Scene Breakdown

### Scene 1: Introduction
- Open with a short introduction to the project and its purpose.
- Explain that the platform connects candidates and recruiters while emphasising security.
- Show the main dashboard or landing experience.

### Scene 2: Core Functionality
- Demonstrate a typical user flow such as registration, login, and profile access.
- Highlight the user experience while keeping the focus on security features.

### Scene 3: Security Feature Demonstration
- Show password policy enforcement during account registration.
- Demonstrate login protections, rate limiting, and secure cookie handling.
- Mention the role-based access control for candidates, HR, and admins.

### Scene 4: Vulnerability 1 - Weak Password Policy
- Show the previous weak-password behaviour and the reason it was risky.
- Explain the root cause and the implemented fix.
- Show the updated validation message and the successful rejection of weak passwords.

### Scene 5: Vulnerability 2 - CSRF Protection
- Explain the concept of CSRF in simple terms.
- Show how a forged state-changing request is blocked after the protection was added.
- Emphasise the security improvement and the testing evidence.

### Scene 6: Retesting and Conclusion
- Show the final protected behaviour after remediation.
- Summarise the value of the security hardening work.
- End with a short closing statement about the project outcome.

## 3. Production Notes
- Keep the speaker visible throughout the video.
- Use clear audio and a quiet environment.
- Add closed captions for accessibility.
- Keep the pacing steady and avoid unnecessary detail.
- Use screen recording for the demo steps and narration for the explanation.

## 4. Suggested Script Outline
- Opening: "This project is HireAI, a secure recruitment platform built to demonstrate modern web security practices."
- Security focus: "I implemented password complexity enforcement, authentication hardening, and protection against common web attacks."
- Vulnerability discussion: "During testing, I identified a weak password policy and missing CSRF protection, both of which were fixed and retested."
- Closing: "The result is a more resilient and professional application that balances usability with security."
