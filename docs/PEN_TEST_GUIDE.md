# Internal Penetration Test Guide

Scope
- Target: HireAI API and web application running in the lab environment.
- Exclusions: External third-party services and production data.

Methodology
- Use OWASP Testing Guide v4 as the primary checklist.
- Perform white-box code review followed by focused manual testing.
- Use automated tools (Burp, sqlmap, trivy) as supplementary evidence — do not rely on them as final judgment.

Reporting
- For each finding include CVSS v3.1, reproduction steps, payloads, screenshots, and remediation.

Ethics
- Obtain written authorization; keep testing contained to test resources.
