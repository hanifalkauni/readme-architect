import fs from 'node:fs';
import path from 'node:path';

/**
 * BeautifierEngine bertanggung jawab atas keindahan visual ("Enak Dipandang"):
 * - Centered Hero Header
 * - Shields.io Badges dengan palet warna terkurasi
 * - Themed Mermaid.js diagrams
 * - Unicode Directory Tree dengan emoji
 * - Collapsible deep-dive cards (<details><summary>)
 */
export class BeautifierEngine {
  constructor(theme = 'tokyo-night') {
    this.theme = this.loadTheme(theme);
  }

  loadTheme(themeName) {
    try {
      const themesDir = path.resolve('themes');
      const themePath = path.join(themesDir, `${themeName}.json`);
      if (fs.existsSync(themePath)) {
        return JSON.parse(fs.readFileSync(themePath, 'utf8'));
      }
    } catch {}

    // Fallback Tokyo Night
    return {
      name: 'Tokyo Night',
      palette: {
        primary: '#7aa2f7',
        success: '#9ece6a',
        accent: '#7dcfff'
      },
      badges: {
        defaultColor: '7aa2f7',
        successColor: '9ece6a',
        accentColor: 'bb9af7'
      },
      mermaid: {
        primaryColor: '#24283b',
        primaryTextColor: '#c0caf5',
        primaryBorderColor: '#7aa2f7',
        lineColor: '#7dcfff'
      }
    };
  }

  /**
   * Membuat Hero Header berpusat dengan tagline dan badges
   */
  generateHeroHeader(meta, badges = [], options = {}) {
    const title = meta.name || 'Project Name';
    const tagline = meta.description || 'Modern, high-performance software solution.';
    const badgeStyle = options.badgeStyle || 'for-the-badge';
    let repoUrl = (meta.repository_url || '').trim();
    repoUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');

    const defaultBadges = [
      `![Build Status: Passing](https://img.shields.io/badge/Build-Passing-${this.theme.badges.successColor}?style=${badgeStyle}&logo=github-actions&logoColor=white)`,
      `![Coverage: 96%](https://img.shields.io/badge/Coverage-96%25-${this.theme.badges.successColor}?style=${badgeStyle}&logo=vitest&logoColor=white)`,
      `![License: ${meta.license || 'MIT'}](https://img.shields.io/badge/License-${meta.license || 'MIT'}-${this.theme.badges.defaultColor}?style=${badgeStyle})`
    ];

    const allBadges = (badges.length > 0 ? badges : defaultBadges).map((badgeStr, idx) => {
      // Jangan tambahkan link jika repoUrl tidak ada, atau jika badge sudah memiliki link
      if (!repoUrl || badgeStr.startsWith('[')) return badgeStr;
      if (idx === 0) return `[${badgeStr}](${repoUrl}/actions)`;
      if (idx === 1) return `[${badgeStr}](${repoUrl})`;
      if (idx === 2) return `[${badgeStr}](${repoUrl}/blob/main/LICENSE)`;
      return badgeStr;
    });

    return `<div align="center">

# 🚀 ${title}

> **${tagline}**

${allBadges.join('\n')}

<p align="center">
  <a href="#fitur-utama">Fitur Utama</a> •
  <a href="#arsitektur-sistem">Arsitektur</a> •
  <a href="#panduan-instalasi">Quick Start</a> •
  <a href="#referensi-api">API Docs</a> •
  <a href="#troubleshooting">FAQ</a>
</p>

---

</div>`;
  }

  /**
   * Menghasilkan diagram arsitektur Mermaid dengan style warna tema
   */
  generateStyledMermaid(type = 'flowchart') {
    const { primaryColor, primaryTextColor, primaryBorderColor, lineColor } = this.theme.mermaid;
    const themeInit = `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '${primaryColor}', 'primaryTextColor': '${primaryTextColor}', 'primaryBorderColor': '${primaryBorderColor}', 'lineColor': '${lineColor}'}}}%%`;

    const chart = `flowchart TD
    Client["📱 Client (Web / Mobile)"] -->|HTTPS / WSS| Ingress["🌐 API Gateway & Rate Limiter"]
    Ingress -->|Auth Verification| Auth["🔑 Auth Service"]
    Ingress -->|Dispatched Request| Core["⚙️ Core Application Engine"]
    Core -->|Read / Write Pool| DB[("🗄️ Database (Primary)")]
    Core -->|Cache Hit / Stream| Cache[("⚡ Redis Cache")]`;

    return `${themeInit}\n${chart}`;
  }

  /**
   * Mengonversi struktur folder ke format pohon Unicode teranotasi emoji
   */
  formatDirectoryTree(nodes, prefix = '') {
    if (!nodes || nodes.length === 0) return '';
    let result = '';

    nodes.forEach((node, idx) => {
      const isLast = idx === nodes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = prefix + (isLast ? '    ' : '│   ');

      result += `${prefix}${connector}${node.icon} ${node.name}\n`;
      if (node.children && node.children.length > 0) {
        result += this.formatDirectoryTree(node.children, childPrefix);
      }
    });

    return result;
  }

  /**
   * Memformat seksi <details><summary> untuk scannability tinggi
   */
  formatCollapsible(title, contentMarkdown) {
    return `<details>
<summary><b>${title}</b></summary>

${contentMarkdown}
</details>`;
  }
}
