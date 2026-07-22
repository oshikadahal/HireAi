# Security Policy and Best Practices

This document summarises the core security controls and developer guidance for HireAI.

1. Authentication
- Use strong password hashing (bcrypt or argon2id).
- Enforce MFA for privileged roles.

2. Secrets and keys
- Do not store secrets in the repository. Use environment variables or a secrets manager.

3. Dependency management
- Run `npm audit` and SCA tools regularly. Authorize Dependabot or Snyk alerts.

4. Logging and monitoring
- Avoid logging PII. Use structured logging and central aggregation with retention rules.

5. CI/CD
- All merges must pass CI linting, tests, and security checks (CodeQL, trivy).

6. Incident response
- Contact the course supervisor and preserve forensic logs if a security incident is suspected.

This file is a living document and should be updated as new controls are added.
