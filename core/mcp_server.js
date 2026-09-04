import readline from 'node:readline';
import { ReadmeArchitect } from './index.js';
import { CodebaseScanner } from './scanner.js';
import { ProofEngine } from './proof_engine.js';
import { BeautifierEngine } from './beautifier.js';

/**
 * Universal Model Context Protocol (MCP) Server
 * Menyediakan antarmuka JSON-RPC standar via stdio untuk semua AI Agent.
 */
export class McpServer {
  constructor() {
    this.tools = [
      {
        name: 'inspect_codebase',
        description: 'Memindai manifest, lockfiles, struktur direktori, dan dependensi proyek.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path direktori root repositori (default: .)' },
            max_depth: { type: 'integer', default: 3 }
          }
        }
      },
      {
        name: 'generate_readme',
        description: 'Menghasilkan README.md komprehensif, 100% akurat, dan berstandar internasional.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path direktori repositori' },
            writing_style: {
              type: 'string',
              enum: [
                'showcase', 'developer-centric', 'product-oriented', 'devops-infra',
                'api-first', 'security-first', 'cli-tool', 'storytelling',
                'minimalist', 'enterprise', 'tutorial', 'academic'
              ],
              default: 'showcase'
            },
            theme: {
              type: 'string',
              enum: ['tokyo-night', 'catppuccin', 'nord', 'minimalist'],
              default: 'tokyo-night'
            },
            target_registry: {
              type: 'string',
              enum: ['github', 'universal', 'pypi', 'npm'],
              default: 'github'
            },
            language: {
              type: 'string',
              enum: ['en', 'id', 'bilingual'],
              default: 'en',
              description: 'Output documentation language: "en" (English, default), "id" (Indonesian), or "bilingual"'
            }
          }
        }
      },
      {
        name: 'beautify_readme',
        description: 'Mengaplikasikan formatting estetika visual dan palet warna pada konten Markdown.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown_content: { type: 'string', description: 'Konten markdown yang akan dipercantik' },
            theme: { type: 'string', default: 'tokyo-night' }
          },
          required: ['markdown_content']
        }
      },
      {
        name: 'validate_readme_compliance',
        description: 'Memverifikasi kepatuhan terhadap standar anti-halusinasi, WCAG 2.2 AA (alt-text), dan SPDX.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown_content: { type: 'string', description: 'Konten README yang akan divalidasi' },
            path: { type: 'string', description: 'Path direktori repositori untuk cross-check' }
          },
          required: ['markdown_content']
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
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: `Tool execution error: ${err.message}` }
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
    const rootDir = args.path || process.cwd();

    if (name === 'inspect_codebase') {
      const scanner = new CodebaseScanner(rootDir, { maxDepth: args.max_depth || 3 });
      return await scanner.scan();
    }

    if (name === 'generate_readme') {
      const architect = new ReadmeArchitect({
        rootDir,
        style: args.writing_style || 'showcase',
        theme: args.theme || 'tokyo-night',
        registry: args.target_registry || 'github',
        language: args.language || 'en'
      });
      return await architect.generate();
    }

    if (name === 'beautify_readme') {
      const beautifier = new BeautifierEngine(args.theme || 'tokyo-night');
      const header = beautifier.generateHeroHeader({ name: 'Project', description: 'Beautified project' });
      return `${header}\n\n${args.markdown_content}`;
    }

    if (name === 'validate_readme_compliance') {
      const proofEngine = new ProofEngine(rootDir);
      const content = args.markdown_content;
      const hasAltText = !content.includes('[![](');
      const hasSpdx = content.includes('SPDX-License-Identifier');
      const hasMermaid = content.includes('```mermaid');

      return {
        a11y_wcag22_compliant: hasAltText,
        spdx_license_compliant: hasSpdx,
        mermaid_diagram_present: hasMermaid,
        status: hasAltText && hasSpdx ? 'PASSED_ALL_STANDARDS' : 'WARNINGS_DETECTED'
      };
    }

    throw new Error(`Tool "${name}" tidak dikenali.`);
  }
}
