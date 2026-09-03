import fs from 'node:fs';
import path from 'node:path';
import { CodebaseScanner } from './scanner.js';
import { ProofEngine } from './proof_engine.js';
import { StyleEngine } from './style_engine.js';
import { StandardsEngine } from './standards_engine.js';
import { BeautifierEngine } from './beautifier.js';
import { DeltaMerger } from './merger.js';
import { RegistryAdapter } from './registry_adapter.js';

export class ReadmeArchitect {
  constructor(options = {}) {
    this.rootDir = path.resolve(options.rootDir || process.cwd());
    const config = this.loadConfig();
    this.config = config;

    this.style = options.style || config.writingStyle || 'showcase';
    this.theme = options.theme || config.theme || 'tokyo-night';
    this.registry = options.registry || (config.standards && config.standards.targetRegistry) || 'github';
    this.generateCitation = options.generateCitation ?? (config.standards && config.standards.generateCitationCff) ?? false;

    this.scanner = new CodebaseScanner(this.rootDir);
    this.proofEngine = new ProofEngine(this.rootDir);
    this.styleEngine = new StyleEngine(this.style);
    this.standardsEngine = new StandardsEngine();
    this.beautifier = new BeautifierEngine(this.theme);
    this.merger = new DeltaMerger();
    this.registryAdapter = new RegistryAdapter(this.registry);
  }

  loadConfig() {
    try {
      const cfgPath = path.join(this.rootDir, 'readme-architect.config.json');
      if (fs.existsSync(cfgPath)) {
        return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      }
    } catch {}
    return {};
  }

  async generate(existingMarkdown = '') {
    const scanData = await this.scanner.scan();
    const verifiedData = this.proofEngine.filterVerifiedScripts(
      scanData.execution_scripts,
      scanData.ecosystem
    );
    const resolvedPort = this.proofEngine.resolveServerPort(scanData.environment.variables);
    const sanitizedEnvVars = this.proofEngine.sanitizeEnvVariables(scanData.environment.variables);

    // Otomatis tulis CITATION.cff ke disk jika mode academic atau dikonfigurasi
    if (this.style === 'academic' || this.generateCitation) {
      const cffContent = this.standardsEngine.generateCitationCff(scanData.project_meta);
      const cffPath = path.join(this.rootDir, 'CITATION.cff');
      fs.writeFileSync(cffPath, cffContent, 'utf8');
    }

    // 1. Hero Header
    const heroContent = this.beautifier.generateHeroHeader(
      scanData.project_meta,
      [],
      { badgeStyle: 'for-the-badge' }
    );

    // 2. Overview
    const overviewContent = this.styleEngine.renderOverview(
      scanData.project_meta,
      scanData.ecosystem
    );

    // 3. Features
    const featuresContent = this.styleEngine.renderFeatures(scanData.ecosystem);

    // 4. Architecture & Diagram
    const mermaidRaw = this.beautifier.generateStyledMermaid();
    const mermaidA11y = this.standardsEngine.formatMermaidWithA11y(
      mermaidRaw,
      'Alur kerja: Client melakukan request ke Ingress Gateway, diverifikasi oleh Auth Service, diteruskan ke Core Engine, lalu berinteraksi dengan Database dan Cache.'
    );
    const architectureContent = `<span id="arsitektur-sistem"></span>\n## 🏗️ Arsitektur Sistem\n\n${mermaidA11y}`;

    // 5. Directory Tree & Monorepo Packages
    const treeRaw = this.beautifier.formatDirectoryTree(scanData.directory_tree);
    let monorepoBlock = '';
    if (scanData.ecosystem.monorepo && scanData.ecosystem.packages.length > 0) {
      const pkgRows = scanData.ecosystem.packages.map(p => 
        `| \`${p.name}\` | \`${p.path}\` | \`${p.version}\` | ${p.description} |`
      ).join('\n');

      monorepoBlock = `\n\n### 📦 Monorepo Workspaces & Packages
| Package Name | Direktori Lokasi | Versi | Deskripsi Modul |
| :--- | :--- | :--- | :--- |
${pkgRows}

**Perintah Filter Workspace:**
\`\`\`bash
${scanData.ecosystem.package_manager} --filter <package-name> dev
\`\`\``;
    }
    const directoryContent = `## 📂 Struktur Repositori\n\n\`\`\`text\n${treeRaw || '├── src/\n└── README.md'}\n\`\`\`${monorepoBlock}`;

    // 6. Tech Stack Matrix
    const techRows = scanData.ecosystem.frameworks.map(f => `| **${f}** | Terverifikasi | Komponen arsitektur utama |`).join('\n');
    const techStackContent = `## 🛠️ Tech Stack & Dependencies

| Teknologi | Status | Peran dalam Sistem |
| :--- | :--- | :--- |
| **${scanData.ecosystem.primary_language}** | Inti | Bahasa pemrograman utama |
| **${scanData.ecosystem.package_manager}** | Resolver | Manajemen dependensi proyek |
${techRows}`;

    // 7. Quick Start & Setup
    const installCmd = verifiedData.verified.install || `${scanData.ecosystem.package_manager} install`;
    const devCmd = verifiedData.verified.dev || `${scanData.ecosystem.package_manager} run dev`;

    const hasAdapters = fs.existsSync(path.join(this.rootDir, 'adapters'));
    let skillInstallBlock = '';

    if (hasAdapters) {
      skillInstallBlock = `
### 🚀 Cara Pasang & Integrasi Skill ke AI Agent

#### Opsi 1: Otomatis via CLI Sync (Rekomendasi)
Jalankan perintah ini di root proyek target untuk memasang seluruh adapter secara otomatis:
\`\`\`bash
npx readme-architect --sync-agents
\`\`\`

#### Opsi 2: Integrasi via Model Context Protocol (MCP)
Tambahkan ke konfigurasi MCP IDE Anda (\`~/.gemini/config/mcp_config.json\` atau Claude Desktop):
\`\`\`json
{
  "mcpServers": {
    "readme-architect": {
      "command": "npx",
      "args": ["-y", "github:hanifalkauni/readme-architect", "--mcp"]
    }
  }
}
\`\`\`
*(Atau gunakan repo klon lokal dengan command: \`"node"\` dan args: \`["/path/to/readme-architect/bin/readme-architect.js", "--mcp"]\`)*

#### Opsi 3: Pemasangan Manual per AI Agent
<details>
<summary><b>🤖 Google Antigravity & Gemini CLI</b></summary>

Salin adapter ke direktori skill lokal proyek:
\`\`\`bash
mkdir -p .agents/skills/readme-architect
cp adapters/antigravity/SKILL.md .agents/skills/readme-architect/SKILL.md
\`\`\`
*Atau simpan secara global di:* \`~/.gemini/config/skills/readme-architect/SKILL.md\`.
</details>

<details>
<summary><b>💻 Cursor IDE</b></summary>

Salin rules ke direktori Cursor:
\`\`\`bash
mkdir -p .cursor/rules
cp adapters/cursor/readme-architect.mdc .cursor/rules/readme-architect.mdc
\`\`\`
</details>

<details>
<summary><b>🧠 Anthropic Claude Code</b></summary>

Salin instruksi Claude ke root repositori:
\`\`\`bash
cp adapters/claude/CLAUDE.md ./CLAUDE.md
\`\`\`
</details>

<details>
<summary><b>🏄 Windsurf Cascade & GitHub Copilot</b></summary>

- **Windsurf**: Salin \`adapters/windsurf/windsurfrules.md\` menjadi \`.windsurfrules\`.
- **GitHub Copilot**: Salin \`adapters/copilot/copilot-instructions.md\` ke \`.github/copilot-instructions.md\`.
</details>

---
`;
    }

    const quickStartContent = `<span id="panduan-instalasi"></span>\n## ⚙️ Panduan Instalasi & Penggunaan
${skillInstallBlock}
### 🛠️ Pengembangan Lokal & Kontribusi

> [!IMPORTANT]
> Pastikan sistem Anda telah terpasang runtime **${scanData.ecosystem.primary_language}** dan package manager **${scanData.ecosystem.package_manager}**.

#### 1. Instalasi Dependensi
\`\`\`bash
${installCmd}
\`\`\`

#### 2. Menjalankan Perintah CLI
\`\`\`bash
# Menghasilkan README dengan gaya Developer-Centric
node bin/readme-architect.js --style developer-centric --theme tokyo-night

# Menjalankan audit kepatuhan WCAG 2.2 AA & anti-halusinasi
node bin/readme-architect.js --verify
\`\`\`
Aplikasi berjalan dan dapat diakses pada: \`http://localhost:${resolvedPort.port}\` *(Sumber: ${resolvedPort.source})*.`;

    // 8. Environment Variables Table (Sanitized)
    let envTable = 'Tidak ada variabel lingkungan yang diperlukan.';
    if (sanitizedEnvVars.length > 0) {
      const rows = sanitizedEnvVars.map(v => 
        `| \`${v.name}\` | ${v.type} | ${v.required ? '**Ya**' : 'Tidak'} | \`${v.default}\` | ${v.description} |`
      ).join('\n');
      envTable = `| Variabel | Tipe Data | Wajib | Nilai Default | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
${rows}`;
    }
    const envContent = `## 🔐 Konfigurasi Lingkungan (.env)\n\n${envTable}`;

    // 9. API Reference / CLI Usage
    let usageContent = '';
    if (this.style === 'cli-tool') {
      usageContent = this.styleEngine.renderCliUsage(scanData.project_meta.name);
    } else {
      const apiDetails = `### Health Check Endpoint
\`GET /health\`

**Response (200 OK):**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "${new Date().toISOString()}"
}
\`\`\``;
      usageContent = `<span id="referensi-api"></span>\n## 📡 Referensi API\n\n${this.beautifier.formatCollapsible('Lihat Spesifikasi Endpoint Utama', apiDetails)}`;
    }

    // 10. Testing
    const testCmd = verifiedData.verified.test || 'npm test';
    const testingContent = `## 🧪 Pengujian (Testing)

\`\`\`bash
${testCmd}
\`\`\``;

    // 11. Deployment
    const deployCmd = verifiedData.verified.docker || 'docker compose up -d --build';
    const deployContent = `## 🐳 Deployment & Kontainer

\`\`\`bash
${deployCmd}
\`\`\``;

    // 12. Troubleshooting & FAQ
    const faqDetails = `#### 1. Error: Port ${resolvedPort.port} telah digunakan
Pastikan tidak ada proses lokal lain yang menggunakan port ini atau ubah nilai port pada file \`.env\`.

#### 2. Dependensi Gagal Terpasang
Bersihkan cache package manager lalu jalankan ulang:
\`\`\`bash
${installCmd}
\`\`\``;
    const troubleshootingContent = `<span id="troubleshooting"></span>\n## ❓ Troubleshooting & FAQ\n\n${this.beautifier.formatCollapsible('Lihat Pertanyaan & Solusi Masalah Umum', faqDetails)}`;

    // 13. Contributors & Community (Opsional)
    const showContributors = (this.config.sections?.allContributors !== false) &&
                             (this.config.standards?.enableAllContributors !== false);
    const contributorsContent = showContributors ? this.standardsEngine.generateAllContributorsTable() : '';

    // 14. Academic Citation (if academic style)
    let citationContent = '';
    if (this.style === 'academic') {
      citationContent = '\n\n---\n\n' + this.styleEngine.renderAcademicCitation(scanData.project_meta);
    }

    // 15. Security & License (SPDX)
    const securityBlock = this.standardsEngine.formatSecurityPolicyBlock();
    const spdxBlock = this.standardsEngine.formatSpdxLicense(
      scanData.project_meta.license,
      scanData.project_meta.name
    ).markdownBlock;
    const footerContent = `${securityBlock}\n\n---\n\n${spdxBlock}${citationContent}`;

    // Kumpulkan seluruh seksi yang dikelola
    const managedSections = {
      hero: heroContent,
      overview: overviewContent,
      features: featuresContent,
      architecture: architectureContent,
      directory: directoryContent,
      techstack: techStackContent,
      setup: quickStartContent,
      env: envContent,
      api: usageContent,
      testing: testingContent,
      deployment: deployContent,
      troubleshooting: troubleshootingContent,
      ...(showContributors ? { contributors: contributorsContent } : {}),
      license: footerContent
    };

    // Gabungkan dengan DeltaMerger
    const merged = this.merger.merge(existingMarkdown, managedSections);

    // Pastikan integritas seluruh tautan (Zero-Broken-Link Engine)
    const fixedLinks = this.proofEngine.validateAndFixLinks(merged, scanData.project_meta);

    // Terapkan Cross-Registry Graceful Degradation
    return this.registryAdapter.adapt(fixedLinks);
  }
}
