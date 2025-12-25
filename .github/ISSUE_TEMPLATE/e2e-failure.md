---
name: E2E Failure Triage
about: Template for triaging full E2E failures created automatically by CI
title: "[E2E][FAIL] Full E2E failed — quick triage needed"
labels: ["e2e-failure", "triage-needed"]
assignees: []
---

**Summary**

Full E2E tests failed on `${{ repository }}`. A GitHub Actions run has been created that includes the failing artifacts.

**Run details**

- Run URL: [{{ run_url }}]({{ run_url }})
- Branch: `{{ branch }}`
- Workflow: `{{ workflow_name }}`

**Attachments**

Please check the `playwright-report-full` artifact (or `playwright-report-staged`) for failing traces/screenshots.

**Suggested first steps**

1. Download `playwright-report-*.tar.gz` from the artifacts and open the failing test traces.
2. Identify failing tests and try to reproduce locally with `npx playwright test <test-file> -g "<test-name>"`.
3. If flakiness is suspected, add a retry or health-check to the test and iterate.

**Notes**

- This issue was created automatically. Add any additional tags or assignees as needed.
