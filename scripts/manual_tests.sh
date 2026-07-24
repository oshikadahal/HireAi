#!/usr/bin/env bash
# Manual PoC test script for HireAI security coursework
# Run from repository root. Requires the API to be running at http://localhost:5000

API_HOST="http://localhost:5000"

# Replace these tokens with valid bearer tokens for testing
CANDIDATE_TOKEN="<CANDIDATE_TOKEN>"
OTHER_TOKEN="<OTHER_TOKEN>"

echo "1) Attempt spoofed upload (should be rejected)"
curl -i -X POST "${API_HOST}/api/candidates/upload-resume" \
  -H "Authorization: Bearer ${CANDIDATE_TOKEN}" \
  -F "resume=@exploit.html;type=image/png"

echo "\n2) Upload a valid PDF (should succeed)"
curl -i -X POST "${API_HOST}/api/candidates/upload-resume" \
  -H "Authorization: Bearer ${CANDIDATE_TOKEN}" \
  -F "resume=@resume.pdf;type=application/pdf"

echo "\n3) Retrieve CSRF token"
curl -i -c jar.txt -b jar.txt "${API_HOST}/api/csrf-token"

echo "\n4) Download resume as owner (replace <filename> with returned filename)"
echo "curl -i -H \"Authorization: Bearer ${CANDIDATE_TOKEN}\" \"${API_HOST}/api/uploads/resumes/<filename>\" -o downloaded.pdf"

echo "\n5) Attempt download as non-owner (should be 403)"
echo "curl -i -H \"Authorization: Bearer ${OTHER_TOKEN}\" \"${API_HOST}/api/uploads/resumes/<filename>\""
