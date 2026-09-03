/**
 * StandardsEngine mengawal kepatuhan terhadap standar internasional:
 * - WCAG 2.2 Level AA (A11y Alt-Text & Diagram Textual Fallbacks)
 * - SPDX & REUSE Specification (Machine-readable licensing)
 * - CITATION.cff (Citation File Format)
 * - All-Contributors Specification
 * - OpenSSF Best Practices
 */
export class StandardsEngine {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Memastikan setiap badge memiliki alt-text deskriptif yang ramah screen reader (WCAG 2.2 AA)
   */
  formatAccessibleBadge(altText, badgeUrl, linkUrl = '') {
    const cleanAlt = altText && altText.trim() ? altText.trim() : 'Project Badge';
    const badgeMarkdown = `![${cleanAlt}](${badgeUrl})`;
    return linkUrl ? `[${badgeMarkdown}](${linkUrl})` : badgeMarkdown;
  }

  /**
   * Menghasilkan teks naratif fallback untuk pengguna pembaca layar di bawah blok Mermaid
   */
  formatMermaidWithA11y(mermaidCode, textualSummary) {
    const summary = textualSummary && textualSummary.trim()
      ? textualSummary.trim()
      : 'Diagram arsitektur alur data dari client ke ingress gateway, diteruskan ke core logic dan database persistence layer.';

    return `\`\`\`mermaid\n${mermaidCode.trim()}\n\`\`\`\n\n> **Ringkasan Aksesibilitas Alur**: ${summary}`;
  }

  /**
   * Menghasilkan penanda lisensi mesin standar SPDX 3.0 dan pernyataan hak cipta FSFE REUSE
   */
  formatSpdxLicense(licenseId = 'MIT', copyrightHolder = 'Core Contributors', year = new Date().getFullYear()) {
    const validLicense = licenseId || 'MIT';
    return {
      spdxIdentifier: `SPDX-License-Identifier: ${validLicense}`,
      copyrightNotice: `Copyright (c) ${year} ${copyrightHolder}. All rights reserved.`,
      markdownBlock: `## 📄 Lisensi & Hak Cipta\nDidistribusikan di bawah lisensi open source **${validLicense}**.\n\n\`SPDX-License-Identifier: ${validLicense}\`  \n\`Copyright (c) ${year} ${copyrightHolder}. All rights reserved.\``
    };
  }

  /**
   * Menghasilkan file CITATION.cff standar YAML untuk repositori ilmiah / akademis
   */
  generateCitationCff(meta = {}) {
    const title = meta.name || 'Software Project';
    const version = meta.version || '1.0.0';
    const dateReleased = new Date().toISOString().split('T')[0];
    const repoUrl = meta.repository_url || 'https://github.com/example/repo';

    return `cff-version: 1.2.0
message: "If you use this software, please cite it as below."
authors:
  - family-names: "Contributors"
    given-names: "Core"
title: "${title}"
version: "${version}"
date-released: "${dateReleased}"
url: "${repoUrl}"
license: "${meta.license || 'MIT'}"
`;
  }

  /**
   * Menghasilkan tabel matriks pengakuan kontributor All-Contributors standar
   */
  generateAllContributorsTable(contributors = []) {
    const defaultContributors = [
      { name: 'Core Team', avatar: 'https://avatars.githubusercontent.com/u/1?v=4', profile: '#', contributions: ['💻', '📖', '💡'] },
      { name: 'Community Helpers', avatar: 'https://avatars.githubusercontent.com/u/2?v=4', profile: '#', contributions: ['🎨', '🐛', '🔍'] }
    ];

    const list = contributors.length > 0 ? contributors : defaultContributors;
    const cells = list.map(c => 
      `[<img src="${c.avatar}" width="60px;" alt="${c.name}"/><br /><sub><b>${c.name}</b></sub>](${c.profile})<br />${c.contributions.join(' ')}`
    );

    return `## 👥 Kontributor (All-Contributors Standard)

Terima kasih kepada seluruh kontributor yang telah membangun proyek ini:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| ${cells.join(' | ')} |
| ${cells.map(() => ':---:').join(' | ')} |
<!-- ALL-CONTRIBUTORS-LIST:END -->

Proyek ini mengikuti spesifikasi resmi [All Contributors](https://all-contributors.js.org/).`;
  }

  /**
   * Menghasilkan integrasi kebijakan keamanan OpenSSF & SECURITY.md
   */
  formatSecurityPolicyBlock() {
    return `## 🔒 Kebijakan Keamanan (Security)
Keamanan adalah prioritas utama. Untuk melaporkan celah kerentanan secara privat, silakan baca panduan di [SECURITY.md](SECURITY.md).`;
  }
}
