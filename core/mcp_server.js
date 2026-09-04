import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { ReadmeArchitect } from './index.js';
import { CodebaseScanner } from './scanner.js';
import { ProofEngine } from './proof_engine.js';
import { BeautifierEngine } from './beautifier.js';

/**
 * Universal Model Context Protocol (MCP) Server for README-Architect
 * Menyediakan antarmuka JSON-RPC 2.0 via stdio untuk seluruh AI Agent IDE.
 */
export class McpServer {
  constructor() {
    this.tools = [
      {
        name: 'inspect_codebase',
        description: 'Memindai manifest, lockfiles, struktur direktori, env vars, dan dependensi proyek.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path direktori root repositori (default: .)' },
            max_depth: { type: 'integer', default: 3, description: 'Kedalaman maksimum penelusuran direktori' }
          }
        }
      },
      {
        name: 'generate_readme',
        description: 'Menghasilkan README.md komprehensif, 100% akurat, anti-halusinasi, dan berstandar internasional.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path direktori repositori (default: .)' },
            writing_style: {
              type: 'string',
              enum: [
                'showcase', 'developer-centric', 'product-oriented', 'devops-infra',
                'api-first', 'security-first', 'cli-tool', 'storytelling',
                'minimalist', 'enterprise', 'tutorial', 'academic'
              ],
              default: 'showcase',
              description: 'Gaya penulisan dokumentasi'
            },
            theme: {
              type: 'string',
              enum: ['tokyo-night', 'catppuccin', 'nord', 'minimalist'],
              default: 'tokyo-night',
              description: 'Palet warna visual untuk badge dan diagram'
            },
            target_registry: {
              type: 'string',
              enum: ['github', 'universal', 'pypi', 'npm'],
              default: 'github',
              description: 'Platform publikasi target'
            },
            language: {
              type: 'string',
              enum: ['en', 'id', 'bilingual'],
              default: 'en',
              description: 'Bahasa output: "en" (English), "id" (Indonesia), atau "bilingual"'
            },
            output_file: {
              type: 'string',
              description: 'Path file untuk langsung menyimpan hasil ke disk (contoh: "README.md")'
            },
            save_to_disk: {
              type: 'boolean',
              default: false,
              description: 'Otomatis simpan ke disk di direktori repositori target'
            }
          }
        }
      },
      {
        name: 'beautify_readme',
        description: 'Mempercantik dokumen Markdown yang ada: membersihkan link rusak, menerapkan palet warna Tokyo-Night pada diagram Mermaid, dan menyelaraskan estetika visual.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown_content: { type: 'string', description: 'Konten string Markdown yang akan dipercantik (opsional jika file_path diberikan)' },
            file_path: { type: 'string', default: 'README.md', description: 'Path relatif file Markdown yang akan dibaca dari disk (default: "README.md")' },
            path: { type: 'string', description: 'Path root repositori (default: .)' },
            theme: { type: 'string', default: 'tokyo-night', description: 'Tema warna (tokyo-night, catppuccin, nord)' },
            save_to_file: { type: 'boolean', default: false, description: 'Simpan hasil beautify kembali ke file di disk' }
          }
        }
      },
      {
        name: 'validate_readme_compliance',
        description: 'Pemeriksaan kepatuhan mendalam: Verifikasi integritas link (anti-404), deteksi kebocoran credential rahasia (API keys/JWT), kepatuhan aksesibilitas WCAG 2.2 AA (alt-text), dan SPDX License.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown_content: { type: 'string', description: 'Konten README yang akan divalidasi (opsional jika file_path diberikan)' },
            file_path: { type: 'string', default: 'README.md', description: 'Path relatif file Markdown yang akan dibaca dan divalidasi dari disk (default: "README.md")' },
            path: { type: 'string', description: 'Path root repositori untuk cross-check berkas dan manifest (default: .)' }
          }
        }
      }
    ];
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;
      try {
        const request = JSON.parse(line);
        const response = await this.handleMessage(request);
        if (response) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (err) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error: ' + err.message }
        }) + '\n');
      }
    });

    process.stderr.write('[readme-architect] MCP Server berjalan via stdio...\n');
  }

  async handleMessage(req) {
    const { id, method, params } = req;

    // JSON-RPC 2.0 Specification: Server MUST NOT reply to notifications (requests without id)
    if (id === undefined || id === null || (typeof method === 'string' && method.startsWith('notifications/'))) {
      return null;
    }

    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: params?.protocolVersion || '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false
            }
          },
          serverInfo: {
            name: 'readme-architect-mcp',
            version: '1.0.0'
          }
        }
      };
    }

    if (method === 'ping') {
      return {
        jsonrpc: '2.0',
        id,
        result: {}
      };
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: this.tools }
      };
    }

    if (method === 'tools/call') {
      const { name, arguments: args = {} } = params || {};
      try {
        const result = await this.executeTool(name, args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          }
        };
      } catch (err) {
        // Return standard MCP tool error result allowing AI agents to self-heal
        return {
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Tool execution error (${name}): ${err.message}` }]
          }
        };
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    };
  }

  async executeTool(name, args) {
    const rootDir = path.resolve(args.path || process.cwd());

    // 1. inspect_codebase
    if (name === 'inspect_codebase') {
      const scanner = new CodebaseScanner(rootDir, { maxDepth: args.max_depth || 3 });
      return await scanner.scan();
    }

    // 2. generate_readme
    if (name === 'generate_readme') {
      const architect = new ReadmeArchitect({
        rootDir,
        style: args.writing_style || 'showcase',
        theme: args.theme || 'tokyo-night',
        registry: args.target_registry || 'github',
        language: args.language || 'en'
      });
      const generatedMarkdown = await architect.generate();

      const targetOut = args.output_file || (args.save_to_disk ? 'README.md' : null);
      if (targetOut) {
        const fullOut = path.isAbsolute(targetOut) ? targetOut : path.join(rootDir, targetOut);
        fs.mkdirSync(path.dirname(fullOut), { recursive: true });
        fs.writeFileSync(fullOut, generatedMarkdown, 'utf8');
      }

      return generatedMarkdown;
    }

    // Resolve Markdown content for beautify & validate
    const resolveContent = () => {
      if (args.markdown_content && typeof args.markdown_content === 'string') {
        return args.markdown_content;
      }
      const targetFile = path.resolve(rootDir, args.file_path || 'README.md');
      if (fs.existsSync(targetFile)) {
        return fs.readFileSync(targetFile, 'utf8');
      }
      throw new Error(`File Markdown tidak ditemukan: "${targetFile}". Berikan markdown_content atau pastikan file ada di repositori.`);
    };

    // 3. beautify_readme
    if (name === 'beautify_readme') {
      const content = resolveContent();
      const beautifier = new BeautifierEngine(args.theme || 'tokyo-night');
      const proofEngine = new ProofEngine(rootDir);

      // Clean broken/empty links and sanitize secrets
      let beautified = proofEngine.validateAndFixLinks(content);

      // Apply Mermaid theme directive if missing
      beautified = beautified.replace(/```mermaid\s*\n(?!%%\{init:)/g, (match) => {
        return `\`\`\`mermaid\n%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#7aa2f7', 'primaryBorderColor': '#3d59a1', 'actorBkg': '#24283b', 'actorBorder': '#7aa2f7', 'lineColor': '#bb9af7', 'altBkg': '#1f2335' }}}%%\n`;
      });

      if (args.save_to_file) {
        const targetPath = path.resolve(rootDir, args.file_path || 'README.md');
        fs.writeFileSync(targetPath, beautified, 'utf8');
      }

      return beautified;
    }

    // 4. validate_readme_compliance
    if (name === 'validate_readme_compliance') {
      const content = resolveContent();
      const proofEngine = new ProofEngine(rootDir);
      const issues = [];
      const suggestions = [];

      // A. Check Broken Local Links
      const brokenLinks = [];
      const localLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/|#|mailto:)([^)#\s]+)\)/g;
      let match;
      while ((match = localLinkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const targetFile = match[2];
        const fullPath = path.join(rootDir, targetFile);
        if (!fs.existsSync(fullPath)) {
          brokenLinks.push({ text: linkText, target: targetFile });
          issues.push({
            type: 'BROKEN_LINK',
            severity: 'HIGH',
            message: `Tautan ke berkas lokal [${linkText}](${targetFile}) tidak ditemukan pada disk (potensi HTTP 404).`
          });
        }
      }

      // B. Check Secret Leaks
      const secretPatterns = [
        { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
        { name: 'Provider API Key (sk-...)', regex: /sk-[a-zA-Z0-9_-]{20,}/ },
        { name: 'GitHub Personal Token', regex: /ghp_[a-zA-Z0-9]{30,}/ },
        { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/ }
      ];
      let secretLeakFound = false;
      for (const p of secretPatterns) {
        if (p.regex.test(content)) {
          secretLeakFound = true;
          issues.push({
            type: 'SECRET_LEAK',
            severity: 'CRITICAL',
            message: `Ditemukan potensi kebocoran kredensial sensitif (${p.name}). Segera samarkan nilai rahasia ini!`
          });
        }
      }

      // C. Check WCAG 2.2 AA Accessible Alt-Text
      const hasEmptyBadgeAlt = /\[!\[\s*\]\([^)]+\)\]/g.test(content) || /!\[\s*\]\([^)]+\)/g.test(content);
      if (hasEmptyBadgeAlt) {
        issues.push({
          type: 'A11Y_ALT_TEXT',
          severity: 'MEDIUM',
          message: 'Terdapat gambar atau badge dengan teks alternatif (alt-text) kosong. Ini melanggar standar WCAG 2.2 AA.'
        });
      }

      // D. Check SPDX License Identifier
      const hasSpdx = content.includes('SPDX-License-Identifier');
      if (!hasSpdx) {
        issues.push({
          type: 'SPDX_LICENSE',
          severity: 'LOW',
          message: 'Bagian lisensi belum mencantumkan header SPDX-License-Identifier (contoh: "SPDX-License-Identifier: MIT").'
        });
        suggestions.push('Tambahkan baris "SPDX-License-Identifier: <NAMA_LISENSI>" di bagian License untuk pengenalan otomatis oleh registry paket.');
      }

      // E. Check Mermaid Diagram Accessibility
      const hasMermaid = content.includes('```mermaid');
      if (hasMermaid && !content.toLowerCase().includes('diagram') && !content.toLowerCase().includes('walkthrough')) {
        suggestions.push('Sertakan narasi arsitektur atau penjelasan teks terstruktur di dekat diagram visual Mermaid untuk audiens tunanetra (screen reader).');
      }

      const score = Math.max(0, 100 - issues.length * 20);

      return {
        status: issues.length === 0 ? 'PASSED_ALL_STANDARDS' : 'WARNINGS_DETECTED',
        score: `${score}/100`,
        checks: {
          a11y_wcag22_compliant: !hasEmptyBadgeAlt,
          spdx_license_compliant: hasSpdx,
          mermaid_diagram_present: hasMermaid,
          broken_links_count: brokenLinks.length,
          secrets_leak_free: !secretLeakFound
        },
        issues,
        suggestions
      };
    }

    throw new Error(`Tool "${name}" tidak dikenali.`);
  }
}
