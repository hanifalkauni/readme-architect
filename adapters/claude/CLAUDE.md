# Claude Code README-Architect Guidelines

When generating, refactoring, or updating `README.md`:

1. **Zero-Hallucination Policy**:
   - Every execution command (`npm test`, `pytest`, `cargo run`, `docker compose up`) MUST be proven by physical evidence in project manifests (`package.json`, `Makefile`, `Dockerfile`, `Cargo.toml`).
   - Do not invent CLI flags, environment variables, or server ports.

2. **12 Writing Styles Support**:
   - Support the requested tone: `showcase` (default), `developer-centric`, `product-oriented`, `devops-infra`, `api-first`, `security-first`, `cli-tool`, `storytelling`, `minimalist`, `enterprise`, `tutorial`, `academic`.

3. **Aesthetic & Global Standards**:
   - Build a centered hero header with styled Shields.io badges.
   - Enforce WCAG 2.2 AA accessibility: every badge MUST have meaningful alt-text.
   - Add a 1-sentence accessibility fallback below any Mermaid.js diagram.
   - Provide standard machine-readable SPDX license tags (`SPDX-License-Identifier: MIT`).

4. **Non-Destructive Updates**:
   - Wrap generated sections with `<!-- readme-architect:start(id) -->` markers.
   - Never overwrite sections wrapped in `<!-- user-content -->` or custom notes written by human maintainers.
