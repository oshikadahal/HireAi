# Vulnerability: Insecure Direct Object Reference (IDOR) — `GET /api/applications/:id`

**Category:** Authorization — Insecure Direct Object Reference (OWASP A01:2021 IDOR-style)

**CVSS v3.1:** 6.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) — Example score; adjust after environment testing.

## Technical summary

The `GET /api/applications/:id` endpoint returns application and candidate details based solely on the object ID provided by the client. The API did not sufficiently verify that the authenticated user had ownership or permission to view the requested resource (company affiliation or recruiter relationship).

## Affected component

- Endpoint: `GET /api/applications/:id`
- Server file: `server/controllers/applicationController.js` (example)

## Impact

An authenticated user with a valid token can retrieve another candidate's private resume, contact data, or application answers by guessing or enumerating object IDs. This can lead to privacy breaches and data exposure.

## Reproduction steps (lab)

1. Authenticate as `recruiterA` and obtain a valid Bearer token.
2. Request `GET /api/applications/1234567890abcdef` where the ID belongs to an application owned by `companyB`.
3. The API returns full application data including candidate resume path and contact information.

Example request (see `evidence/payloads/idor-example.txt`):

```
GET /api/applications/1234567890abcdef HTTP/1.1
Host: localhost:5000
Authorization: Bearer <recruiterA-token>
```

## Proof (evidence)

- Payload: `evidence/payloads/idor-example.txt`
- Screenshots: add `evidence/screenshots/idor-step1.png` (before fix) and `evidence/screenshots/idor-fixed.png` (after fix).
- Logs: include request/response trace from `server/logs/` (PII-redacted).

## Root cause

Server-side authorization relied on presence of a valid token only and did not verify resource ownership (companyId or recruiter relationship). Client-supplied object IDs were trusted.

## Remediation

Implement server-side authorization checks validating that the requesting user's organization or role permits access to the requested resource. Example patch:

```js
// controllers/applicationController.js
async function getApplication(req, res) {
  const id = req.params.id;
  const application = await Application.findById(id);
  if (!application) return res.status(404).send('Not found');
  // Ensure user is authorized for this application
  if (req.user.role === 'recruiter') {
    if (application.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).send('Forbidden');
    }
  }
  // Sys admins may access everything
  return res.json(application);
}
```

Also implement rate-limiting on ID enumeration patterns and avoid leaking existence via differing error messages.

## Retest evidence

- After applying checks, `GET /api/applications/:id` for an unauthorized resource should return HTTP 403.
- Add screenshot `evidence/screenshots/idor-fixed.png` showing the 403 response.

## Notes & mitigations

- Add unit and integration tests covering authorization logic for `applications` endpoints.
- Log authorization failures to the audit log with minimal context (no PII).
