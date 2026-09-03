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

    this.language = options.language || options.lang || config.language || 'en';
    this.style = options.style || config.writingStyle || 'showcase';
    this.theme = options.theme || config.theme || 'tokyo-night';
    this.registry = options.registry || (config.standards && config.standards.targetRegistry) || 'github';
    this.generateCitation = options.generateCitation ?? (config.standards && config.standards.generateCitationCff) ?? false;

    this.scanner = new CodebaseScanner(this.rootDir);
    this.proofEngine = new ProofEngine(this.rootDir);
    this.styleEngine = new StyleEngine(this.style, this.language);
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

  buildSections(scanData, verifiedData, resolvedPort, sanitizedEnvVars, lang = 'en', options = {}) {
    const isId = lang === 'id';

    // 1. Hero Header
    const heroContent = this.beautifier.generateHeroHeader(
      scanData.project_meta,
      [],
      { badgeStyle: 'for-the-badge', language: lang, switcher: options.switcher }
    );

    // 2. Overview
    const overviewContent = this.styleEngine.renderOverview(
      scanData.project_meta,
      scanData.ecosystem,
      lang
    );

    // 3. Features
    const featuresContent = this.styleEngine.renderFeatures(scanData.ecosystem, lang);

    // 4. Architecture & Diagram
    const mermaidRaw = this.beautifier.generateStyledMermaid();
    const mermaidA11y = this.standardsEngine.formatMermaidWithA11y(mermaidRaw, '', lang);
    const archTitle = isId ? 'Arsitektur Sistem' : 'System Architecture';
    const architectureContent = `<span id="system-architecture"></span>\n<span id="arsitektur-sistem"></span>\n## 🏗️ ${archTitle}\n\n${mermaidA11y}`;

    // 5. Directory Tree & Monorepo Packages
    const treeRaw = this.beautifier.formatDirectoryTree(scanData.directory_tree);
    let monorepoBlock = '';
    if (scanData.ecosystem.monorepo && scanData.ecosystem.packages.length > 0) {
      const pkgRows = scanData.ecosystem.packages.map(p => 
        `| \`${p.name}\` | \`${p.path}\` | \`${p.version}\` | ${p.description} |`
      ).join('\n');

      const monoTitle = isId ? 'Paket & Workspace Monorepo' : 'Monorepo Workspaces & Packages';
      const colName = isId ? 'Nama Paket' : 'Package Name';
      const colDir = isId ? 'Direktori Lokasi' : 'Directory Path';
      const colVer = isId ? 'Versi' : 'Version';
      const colDesc = isId ? 'Deskripsi Modul' : 'Module Description';
      const filterNotice = isId ? 'Perintah Filter Workspace:' : 'Workspace Filter Command:';

      monorepoBlock = `\n\n### 📦 ${monoTitle}
| ${colName} | ${colDir} | ${colVer} | ${colDesc} |
| :--- | :--- | :--- | :--- |
${pkgRows}

**${filterNotice}**
\`\`\`bash
${scanData.ecosystem.package_manager} --filter <package-name> dev
\`\`\``;
    }
    const dirTitle = isId ? 'Struktur Repositori' : 'Repository Structure';
    const directoryContent = `## 📂 ${dirTitle}\n\n\`\`\`text\n${treeRaw || '├── src/\n└── README.md'}\n\`\`\`${monorepoBlock}`;

    // 6. Tech Stack Matrix
    const techRows = scanData.ecosystem.frameworks.map(f => {
      const status = isId ? 'Terverifikasi' : 'Verified';
      const role = isId ? 'Komponen arsitektur utama' : 'Core architecture component';
      return `| **${f}** | ${status} | ${role} |`;
    }).join('\n');

    const techCol1 = isId ? 'Teknologi' : 'Technology';
    const techCol2 = isId ? 'Status' : 'Status';
    const techCol3 = isId ? 'Peran dalam Sistem' : 'Role in Architecture';
    const primaryRole = isId ? 'Bahasa pemrograman utama' : 'Primary programming language';
    const pmRole = isId ? 'Manajemen dependensi proyek' : 'Package & dependency management';

    const techStackContent = `## 🛠️ Tech Stack & Dependencies

| ${techCol1} | ${techCol2} | ${techCol3} |
| :--- | :--- | :--- |
| **${scanData.ecosystem.primary_language}** | ${isId ? 'Inti' : 'Core'} | ${primaryRole} |
| **${scanData.ecosystem.package_manager}** | Resolver | ${pmRole} |
${techRows}`;

    // 7. Quick Start & Setup
    const installCmd = verifiedData.verified.install || `${scanData.ecosystem.package_manager} install`;
    const hasAdapters = fs.existsSync(path.join(this.rootDir, 'adapters'));
    let skillInstallBlock = '';

    if (hasAdapters) {
      if (isId) {
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
      } else {
        skillInstallBlock = `
### 🚀 Integrating Skills with AI Agents

#### Option 1: Automatic via CLI Sync (Recommended)
Run this command in any target project root to export all agent adapters automatically:
\`\`\`bash
npx github:hanifalkauni/readme-architect --sync-agents
\`\`\`

#### Option 2: Integration via Model Context Protocol (MCP)
Add this to your IDE MCP configuration (\`~/.gemini/config/mcp_config.json\` or Claude Desktop):
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
*(Or if running from a local clone, use command: \`"node"\` and args: \`["/path/to/readme-architect/bin/readme-architect.js", "--mcp"]\`)*

#### Option 3: Manual Installation per AI Agent
<details>
<summary><b>🤖 Google Antigravity & Gemini CLI</b></summary>

Copy adapter to local workspace skill directory:
\`\`\`bash
mkdir -p .agents/skills/readme-architect
cp adapters/antigravity/SKILL.md .agents/skills/readme-architect/SKILL.md
\`\`\`
*Or install globally at:* \`~/.gemini/config/skills/readme-architect/SKILL.md\`.
</details>

<details>
<summary><b>💻 Cursor IDE</b></summary>

Copy rules to Cursor directory:
\`\`\`bash
mkdir -p .cursor/rules
cp adapters/cursor/readme-architect.mdc .cursor/rules/readme-architect.mdc
\`\`\`
</details>

<details>
<summary><b>🧠 Anthropic Claude Code</b></summary>

Copy instructions to repository root:
\`\`\`bash
cp adapters/claude/CLAUDE.md ./CLAUDE.md
\`\`\`
</details>

<details>
<summary><b>🏄 Windsurf Cascade & GitHub Copilot</b></summary>

- **Windsurf**: Copy \`adapters/windsurf/windsurfrules.md\` to \`.windsurfrules\`.
- **GitHub Copilot**: Copy \`adapters/copilot/copilot-instructions.md\` to \`.github/copilot-instructions.md\`.
</details>

---
`;
      }
    }

    const quickStartTitle = isId ? 'Panduan Instalasi & Penggunaan' : 'Installation & Usage Guide';
    const localDevTitle = isId ? 'Pengembangan Lokal & Kontribusi' : 'Local Development & Contributing';
    const reqNote = isId
      ? `> [!IMPORTANT]\n> Pastikan sistem Anda telah terpasang runtime **${scanData.ecosystem.primary_language}** dan package manager **${scanData.ecosystem.package_manager}**.`
      : `> [!IMPORTANT]\n> Ensure your environment has **${scanData.ecosystem.primary_language}** and **${scanData.ecosystem.package_manager}** installed.`;
    const step1Title = isId ? 'Instalasi Dependensi' : 'Install Dependencies';
    const step2Title = isId ? 'Menjalankan Aplikasi' : 'Run Application';
    const step3Title = isId ? 'Build Produksi' : 'Production Build';
    const portLabel = isId
      ? `Aplikasi berjalan dan dapat diakses pada: \`http://localhost:${resolvedPort.port}\` *(Sumber: ${resolvedPort.source})*.`
      : `Application is running and accessible at: \`http://localhost:${resolvedPort.port}\` *(Source: ${resolvedPort.source})*.`;

    const quickStartContent = `<span id="quick-start"></span>\n<span id="panduan-instalasi"></span>\n## ⚙️ ${quickStartTitle}
${skillInstallBlock}
### 🛠️ ${localDevTitle}

${reqNote}

#### 1. ${step1Title}
\`\`\`bash
${installCmd}
\`\`\`

#### 2. ${step2Title}
\`\`\`bash
${verifiedData.verified.dev || verifiedData.verified.start || `${scanData.ecosystem.package_manager} run dev`}
\`\`\`
${verifiedData.verified.build ? `
#### 3. ${step3Title}
\`\`\`bash
${verifiedData.verified.build}
\`\`\`
` : ''}${portLabel}`;

    // 8. Environment Variables Table (Sanitized)
    let envTable = isId ? 'Tidak ada variabel lingkungan yang diperlukan.' : 'No environment variables required. Pure zero-config execution.';
    if (sanitizedEnvVars.length > 0) {
      const colVar = isId ? 'Variabel' : 'Variable';
      const colType = isId ? 'Tipe Data' : 'Type';
      const colReq = isId ? 'Wajib' : 'Required';
      const colDef = isId ? 'Nilai Default' : 'Default Value';
      const colDesc = isId ? 'Deskripsi' : 'Description';
      const yesLabel = isId ? '**Ya**' : '**Yes**';
      const noLabel = isId ? 'Tidak' : 'Optional';

      const rows = sanitizedEnvVars.map(v => 
        `| \`${v.name}\` | ${v.type} | ${v.required ? yesLabel : noLabel} | \`${v.default}\` | ${v.description} |`
      ).join('\n');
      envTable = `| ${colVar} | ${colType} | ${colReq} | ${colDef} | ${colDesc} |
| :--- | :--- | :--- | :--- | :--- |
${rows}`;
    }
    const envTitle = isId ? 'Konfigurasi Lingkungan (.env)' : 'Environment Configuration (.env)';
    const envContent = `## 🔐 ${envTitle}\n\n${envTable}`;

    // 9. API Reference / CLI Usage
    let usageContent = '';
    if (this.style === 'cli-tool') {
      usageContent = this.styleEngine.renderCliUsage(scanData.project_meta.name, lang);
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
      const apiTitle = isId ? 'Referensi API' : 'API Reference';
      const apiSummary = isId ? 'Lihat Spesifikasi Endpoint Utama' : 'View Core Endpoint Specifications';
      usageContent = `<span id="api-reference"></span>\n<span id="referensi-api"></span>\n## 📡 ${apiTitle}\n\n${this.beautifier.formatCollapsible(apiSummary, apiDetails)}`;
    }

    // 10. Testing
    const testCmd = verifiedData.verified.test || 'npm test';
    const testTitle = isId ? 'Pengujian (Testing)' : 'Testing Suite';
    const testingContent = `## 🧪 ${testTitle}

\`\`\`bash
${testCmd}
\`\`\``;

    // 11. Deployment
    const deployCmd = verifiedData.verified.docker || 'docker compose up -d --build';
    const deployTitle = isId ? 'Deployment & Kontainer' : 'Deployment & Containerization';
    const deployContent = `## 🐳 ${deployTitle}

\`\`\`bash
${deployCmd}
\`\`\``;

    // 12. Troubleshooting & FAQ
    const faqDetails = isId
      ? `#### 1. Error: Port ${resolvedPort.port} telah digunakan
Pastikan tidak ada proses lokal lain yang menggunakan port ini atau ubah nilai port pada file \`.env\`.

#### 2. Dependensi Gagal Terpasang
Bersihkan cache package manager lalu jalankan ulang:
\`\`\`bash
${installCmd}
\`\`\``
      : `#### 1. Error: Port ${resolvedPort.port} is already in use
Ensure no other local process is bound to this port or update the port value in your \`.env\` file.

#### 2. Dependencies Failed to Install
Clean your package manager cache and re-run installation:
\`\`\`bash
${installCmd}
\`\`\``;

    const faqSummary = isId ? 'Lihat Pertanyaan & Solusi Masalah Umum' : 'View Common Questions & Solutions';
    const troubleshootingContent = `<span id="troubleshooting"></span>\n## ❓ Troubleshooting & FAQ\n\n${this.beautifier.formatCollapsible(faqSummary, faqDetails)}`;

    // 13. Contributors & Community (Opt-in)
    const showContributors = (this.config.sections?.allContributors === true) ||
                             (this.config.standards?.enableAllContributors === true);
    const contributorsContent = showContributors ? this.standardsEngine.generateAllContributorsTable([], lang) : '';

    // 14. Academic Citation (if academic style)
    let citationContent = '';
    if (this.style === 'academic') {
      citationContent = '\n\n---\n\n' + this.styleEngine.renderAcademicCitation(scanData.project_meta, lang);
    }

    // 15. Security & License (SPDX)
    const securityBlock = this.standardsEngine.formatSecurityPolicyBlock(lang);
    const spdxBlock = this.standardsEngine.formatSpdxLicense(
      scanData.project_meta.license,
      scanData.project_meta.name,
      new Date().getFullYear(),
      lang
    ).markdownBlock;
    const footerContent = `${securityBlock}\n\n---\n\n${spdxBlock}${citationContent}`;

    return {
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
  }

  async generate(existingMarkdown = '', targetLang = null) {
    const lang = targetLang || this.language;
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

    if (lang === 'bilingual') {
      // 1. Generate English (Primary README.md)
      const enSwitcher = '<a href="README.id.md">Bahasa Indonesia</a> • <b>English</b>';
      const enSections = this.buildSections(scanData, verifiedData, resolvedPort, sanitizedEnvVars, 'en', { switcher: enSwitcher });
      const enMerged = this.merger.merge(existingMarkdown, enSections);
      const enFixed = this.proofEngine.validateAndFixLinks(enMerged, scanData.project_meta);
      const finalEn = this.registryAdapter.adapt(enFixed);

      // 2. Generate Indonesian (Secondary README.id.md)
      const idSwitcher = '<b>Bahasa Indonesia</b> • <a href="README.md">English</a>';
      const idSections = this.buildSections(scanData, verifiedData, resolvedPort, sanitizedEnvVars, 'id', { switcher: idSwitcher });
      const idMerged = this.merger.merge('', idSections);
      const idFixed = this.proofEngine.validateAndFixLinks(idMerged, scanData.project_meta);
      const finalId = this.registryAdapter.adapt(idFixed);

      try {
        const idPath = path.join(this.rootDir, 'README.id.md');
        fs.writeFileSync(idPath, finalId, 'utf8');
      } catch {}

      return finalEn;
    }

    // Single language generation ('en' or 'id')
    const sections = this.buildSections(scanData, verifiedData, resolvedPort, sanitizedEnvVars, lang);
    const merged = this.merger.merge(existingMarkdown, sections);
    const fixedLinks = this.proofEngine.validateAndFixLinks(merged, scanData.project_meta);
    return this.registryAdapter.adapt(fixedLinks);
  }
}
