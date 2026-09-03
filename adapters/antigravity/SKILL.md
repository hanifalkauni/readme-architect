---
name: readme-architect
description: >-
  Universal expert technical writer skill agent for generating exhaustive,
  100% accurate, production-grade, aesthetically stunning, and internationally compliant
  README.md documentation complying with WCAG 2.2 AA, SPDX, Diátaxis, and Cross-Registry standards.
---

# README-Architect Skill Instructions

Skill ini menginstruksikan agent untuk memindai basis kode, memverifikasi perintah tanpa halusinasi, dan menyusun `README.md` berpenampilan kelas dunia.

## Langkah Eksekusi Alur Kerja (6-Stage Pipeline):

1. **Konfirmasi Bahasa, Gaya Penulisan & Tema**:
   - **Bahasa Output**: `en` (English, default), `id` (Bahasa Indonesia jika diminta pengguna), atau `bilingual` (otomatis menghasilkan `README.md` EN dan `README.id.md` ID dengan tombol pengalih bahasa).
   - Tentukan salah satu dari **12 Gaya Penulisan**:
     `showcase` (default), `developer-centric`, `product-oriented`, `devops-infra`,
     `api-first`, `security-first`, `cli-tool`, `storytelling`,
     `minimalist`, `enterprise`, `tutorial`, `academic`.
   - Pilih tema visual: `tokyo-night` (default), `catppuccin`, `nord`, atau `minimalist`.

2. **Pemindaian Basis Kode (Static Codebase Discovery)**:
   - Identifikasi manifest: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `pom.xml`, `composer.json`, `Dockerfile`, `docker-compose.yml`.
   - Deteksi package manager riil (`bun`, `pnpm`, `yarn`, `npm`, `poetry`, `cargo`, `go`).
   - Ekstrak seluruh variabel dari `.env.example`.

3. **Verifikasi Anti-Halusinasi (Strict Proof Verification)**:
   - Dilarang mengarang script instalasi atau perintah eksekusi. Setiap perintah harus terbukti ada di `package.json#scripts`, `Makefile`, atau standar runtime.
   - Pastikan port listen server diambil dari `.env.example` atau fallback kode riil.

4. **Visual Beautification & Standar Internasional**:
   - **Hero Header**: Format `<div align="center">` dengan badges Shields.io berpalet harmonis.
   - **Aksesibilitas (WCAG 2.2 AA)**: Setiap badge wajib memiliki `alt-text` fungsional (misal: `![Build Status: Passing](...)`).
   - **Diagram Mermaid**: Berikan ringkasan teks naratif 1-2 kalimat di bawah diagram untuk pembaca layar (*screen reader*).
   - **Lisensi Mesin**: Sertakan penanda resmi `SPDX-License-Identifier: <ID>`.

5. **Struktur Blueprint 14 Bagian Wajib**:
   1. Hero Header & Badges
   2. Overview & Problem Solved
   3. Interactive Feature Grid Cards
   4. Themed Architecture & Mermaid Diagram (dengan Fallback A11y)
   5. Annotated Directory Tree (Unicode & Emojis)
   6. Tech Stack & Dependencies Matrix
   7. Prerequisites & System Requirements
   8. Installation & Local Development Setup
   9. Environment Variables Specification (.env)
   10. Verified Usage & API Reference (<details><summary>)
   11. Testing & QA Workflows
   12. Containerization & Deployment (Docker/K8s)
   13. Troubleshooting & Common Pitfalls FAQ
   14. Community, Contributors, Security & SPDX License

6. **Preservasi Konten Kustom (Non-Destructive Delta Update)**:
   - Selalu bungkus seksi otomatis dengan marker `<!-- readme-architect:start(id) --> ... <!-- readme-architect:end(id) -->`.
   - Jangan pernah menghapus blok `<!-- user-content -->` atau catatan manual pengembang.
