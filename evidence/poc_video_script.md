# Proof-of-Concept Video Script

1. Introduction (00:00-00:20)
   - Show face on camera; state name and student ID.
   - Briefly explain the app (HireAI) and the objectives of the video.

2. Demonstration 1 — IDOR (00:20-02:00)
   - Show authenticated recruiter account and explain target application ID.
   - Reproduce the unauthorized `GET /api/applications/:id` request using curl or Burp.
   - Show returned sensitive data (redacted on-screen as needed) and explain impact.
   - Show code patch being applied (server/controllers/applicationController.js) and restart server.
   - Re-run request and show HTTP 403 response.

3. Demonstration 2 — Refresh token replay (02:00-04:00)
   - Explain refresh token concept and show captured cookie value (redacted).
   - Reproduce token replay request and show that a new access token is issued.
   - Apply rotation logic and restart server.
   - Re-run replay and show 401 Unauthorized for old token; show successful flow for fresh token.

4. Wrap-up (04:00-04:30)
   - Summarise mitigations and evidence locations in `evidence/` folder.
   - Show instructions for enabling captions and sharing the drive link with marker.

Captions: Provide a plain-text transcript file alongside the video and enable closed captions during upload.
