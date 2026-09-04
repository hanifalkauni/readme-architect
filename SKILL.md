---
name: readme-architect
description: >-
  Universal expert technical writer skill agent for generating exhaustive,
  100% accurate, production-grade, aesthetically stunning, and internationally compliant
  README.md documentation complying with WCAG 2.2 AA, SPDX 3.0, Diátaxis, and Cross-Registry standards.
---

# README-Architect Skill Instructions

This skill equips any AI Coding Agent with the full procedural pipeline to autonomously inspect repositories, verify commands without hallucination, and produce world-class, production-grade `README.md` documentation.

---

## 🚀 Execution Pipeline (6-Stage Protocol)

### Stage 1: Style, Theme & Language Resolution
1. **Output Language**:
   - `en` (English, default).
   - `id` (Bahasa Indonesia if requested by user).
   - `bilingual` (generates root `README.md` in English and `README.id.md` in Indonesian with top navigation switchers).
2. **Select Writing Style** (One of 12 Archetypes):
   - `showcase` (default): Hero header, visual feature grid, architecture diagram.
   - `developer-centric`: Quickstart in 3 lines, CLI commands, direct copy-paste code snippets.
   - `product-oriented`: Value propositions, problem vs solution, benefits metrics.
   - `devops-infra`: Docker Compose, Kubernetes manifests, CI/CD pipeline, environment configs.
   - `api-first`: Endpoints table, request/response payloads, authentication headers.
   - `security-first`: Threat model, CVE reporting, least-privilege setup, cryptographic signatures.
   - `cli-tool`: Installation via curl/brew/npx, flags reference table, command examples.
   - `storytelling`: Creator journey, philosophy, architectural decisions.
   - `minimalist`: One-page essential summary, zero fluff.
   - `enterprise`: Compliance badges, SLA, governance, high availability, support tiers.
   - `tutorial`: Step-by-step walkthrough, copy-paste tutorials.
   - `academic`: LaTeX equations, BibTeX citation block, methodology, dataset references.
3. **Visual Theme**:
   - `tokyo-night` (default, `#7aa2f7`), `catppuccin` (`#cba6f7`), `nord` (`#88c0d0`), or `minimalist`.

---

### Stage 2: Codebase Discovery & Manifest Sniffing
1. **Manifest Inspection (Static)**:
   - Read manifests: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `pom.xml`, `build.gradle`, `composer.json`, `Gemfile`, `*.csproj`, `Dockerfile`, `docker-compose.yml`.
2. **Real Package Manager Detection**:
   - Determine the true package manager from lockfiles (`bun.lockb`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `poetry.lock`, `Cargo.lock`, `go.sum`).
3. **Environment Variables Extraction**:
   - Parse `.env.example` or `.env.template` to document required configurations without exposing real secrets.

---

### Stage 3: Strict Proof Verification (Zero Hallucination)
1. **Verified Scripts**:
   - NEVER invent execution scripts. Only recommend commands proven to exist in `package.json#scripts`, `Makefile`, or standard runtime CLI commands.
2. **Port Resolution**:
   - Extract the real server listening port from `.env.example` or codebase entrypoints before defaulting to `3000` or `8080`.
3. **Secret Sanitization**:
   - Redact any raw API keys, private keys, database passwords, or JWT secrets into placeholders (e.g., `your_api_key_here`).
4. **Zero Broken Links Guarantee**:
   - Never output empty link brackets `[link]()`. Ensure all links point to real files or valid anchors.

---

### Stage 4: Visual Beautification & International Compliance
1. **Hero Header**:
   - Centered `<div align="center">` layout with Shields.io badges using harmonized palettes (Tokyo Night / Catppuccin / Nord).
2. **Accessibility (WCAG 2.2 AA)**:
   - Every badge MUST have meaningful `alt-text` (e.g., `![License: MIT](https://img.shields.io/...)`).
   - Every Mermaid diagram MUST include a 1–2 sentence narrative description immediately below for screen-reader users.
3. **SPDX 3.0 License Block**:
   - Machine-readable code block:
     ```text
     SPDX-License-Identifier: MIT
     Copyright (c) 2026 Your Name. All rights reserved.
     ```
4. **Academic Citation (If applicable)**:
   - Include BibTeX snippet and `CITATION.cff` YAML specification.

---

### Stage 5: Mandatory 14-Section Blueprint Structure
Organize the generated README using the following structured sections:

1. **Hero Header & Shields Badges**: Project name, tagline, and status badges.
2. **Overview & Problem Statement**: Clear explanation of what problem the project solves.
3. **Key Features**: Feature grid or bullet cards highlighting core capabilities.
4. **Architecture & Execution Flow**: Mermaid.js diagram with screen-reader accessible narrative.
5. **Project Directory Structure**: Annotated Unicode directory tree with descriptive emoji tags.
6. **Technology Stack**: Badges or structured table listing languages, frameworks, and tools.
7. **Prerequisites**: Minimum system requirements, runtime versions, and tools.
8. **Installation & Getting Started**: Step-by-step verified terminal commands.
9. **Environment Variables**: Markdown table documenting `.env` keys, descriptions, and defaults.
10. **Usage & API Reference**: Clear examples and collapsible `<details><summary>` tool references.
11. **Testing & Quality Assurance**: Test execution commands and coverage notes.
12. **Deployment & Containerization**: Docker Compose, Helm, or cloud deployment workflows.
13. **Troubleshooting & FAQ**: Collapsible Q&A resolving top 3 common pitfalls.
14. **Community, Contributing, Security & License**: Links to `CONTRIBUTING.md`, `SECURITY.md`, and SPDX license.

---

### Stage 6: Non-Destructive Delta Updates (Smart Merger)
When updating an existing `README.md`:
- Wrap managed sections in boundary markers:
  `<!-- readme-architect:start(<id>) --> ... <!-- readme-architect:end(<id>) -->`.
- NEVER overwrite or discard custom user annotations wrapped in `<!-- user-content -->`.
