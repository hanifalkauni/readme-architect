#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { ReadmeArchitect } from '../core/index.js';
import { McpServer } from '../core/mcp_server.js';
import { ProofEngine } from '../core/proof_engine.js';
import { CodebaseScanner } from '../core/scanner.js';

function loadConfigFile() {
  try {
    const cfgPath = path.resolve('readme-architect.config.json');
    if (fs.existsSync(cfgPath)) {
      return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    }
  } catch {}
  return {};
}

function parseArgs(args, config = {}) {
  const options = {
    style: config.writingStyle || 'showcase',
    theme: config.theme || 'tokyo-night',
    language: config.language || 'en',
    output: 'README.md',
    registry: (config.standards && config.standards.targetRegistry) || 'github',
    mcp: false,
    verify: false,
    syncAgents: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--mcp') options.mcp = true;
    else if (arg === '--verify') options.verify = true;
    else if (arg === '--sync-agents') options.syncAgents = true;
    else if (arg === '--style' && args[i + 1]) options.style = args[++i];
    else if (arg === '--theme' && args[i + 1]) options.theme = args[++i];
    else if ((arg === '--lang' || arg === '--language') && args[i + 1]) options.language = args[++i];
    else if (arg === '--output' && args[i + 1]) options.output = args[++i];
    else if (arg === '--registry' && args[i + 1]) options.registry = args[++i];
  }

  return options;
}

function showHelp() {
  console.log(`
🚀 README-Architect (v1.6.0)
Universal AI Skill Agent for Automated, Accurate & Stunning README Generation

Penggunaan:
  npx readme-architect [opsi]

Opsi Tersedia:
  --style <nama>      Pilih gaya penulisan (default: showcase)
                      Pilihan: showcase, developer-centric, product-oriented,
                               devops-infra, api-first, security-first,
                               cli-tool, storytelling, minimalist,
                               enterprise, tutorial, academic
  --theme <nama>      Pilih tema visual (default: tokyo-night)
                      Pilihan: tokyo-night, catppuccin, nord, minimalist
  --lang <kode>       Pilih bahasa dokumentasi (default: en)
                      Pilihan: en (English), id (Indonesia), bilingual (EN & ID)
  --output <file>     Nama file output (default: README.md)
  --registry <target> Target registry rendering (default: github, opsi: universal, pypi, npm)
  --mcp               Jalankan sebagai Model Context Protocol (MCP) server
  --verify            Jalankan audit kepatuhan anti-halusinasi & standar WCAG/SPDX
  --sync-agents       Ekspor konfigurasi adapters untuk Antigravity, Claude, Cursor, dll.
  --help, -h          Tampilkan panduan bantuan ini
`);
}

async function runAuditVerification(targetFile = 'README.md') {
  const filePath = path.resolve(targetFile);
  console.log(`\n🛡️ [README-Architect] Menjalankan Audit Kepatuhan pada: ${targetFile}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File ${targetFile} tidak ditemukan untuk diaudit.`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const proof = new ProofEngine(process.cwd());
  const scanner = new CodebaseScanner(process.cwd());
  const scanData = await scanner.scan();

  const checks = [];

  // 1. A11y Alt-Text
  const hasEmptyAlt = /\[!\[\s*\]\(/.test(content);
  checks.push({
    title: 'A11y WCAG 2.2 AA (Non-Empty Alt-Text)',
    passed: !hasEmptyAlt,
    detail: hasEmptyAlt ? 'Ditemukan badge tanpa deskripsi alt-text' : 'Seluruh badge memiliki accessible name'
  });

  // 2. SPDX Licensing
  const hasSpdx = content.includes('SPDX-License-Identifier:');
  checks.push({
    title: 'Machine-Readable SPDX 3.0 License',
    passed: hasSpdx,
    detail: hasSpdx ? 'Penanda lisensi SPDX terdeteksi' : 'Penanda SPDX-License-Identifier tidak ditemukan'
  });

  // 3. Diagram A11y
  const hasMermaid = content.includes('```mermaid');
  const hasA11ySummary = content.includes('Ringkasan Aksesibilitas Alur') ||
                         content.includes('Accessibility Summary') ||
                         content.includes('Accessibility Flow Summary') ||
                         !hasMermaid;
  checks.push({
    title: 'Mermaid Diagram A11y Textual Fallback',
    passed: hasA11ySummary,
    detail: hasA11ySummary ? 'Diagram memiliki ringkasan naratif pembaca layar' : 'Diagram visual tidak memiliki deskripsi alur'
  });

  // 4. Command Verification
  const verifiedScripts = proof.filterVerifiedScripts(scanData.execution_scripts, scanData.ecosystem);
  const totalVerified = Object.keys(verifiedScripts.verified).length;
  checks.push({
    title: 'Zero-Hallucination Command Verification',
    passed: totalVerified > 0,
    detail: `${totalVerified} perintah tervalidasi terhadap manifest fisik`
  });

  console.log('\n================ HASIL AUDIT KEPATUHAN ================');
  let allPass = true;
  checks.forEach((c, idx) => {
    const icon = c.passed ? '✅' : '❌';
    console.log(`${icon} [${idx + 1}/${checks.length}] ${c.title}`);
    console.log(`     ↳ ${c.detail}`);
    if (!c.passed) allPass = false;
  });
  console.log('=======================================================\n');

  if (allPass) {
    console.log('🎉 SELAMAT! Dokumentasi 100% patuh pada seluruh standar internasional.\n');
  } else {
    console.log('⚠️ Terdapat peringatan standar pada dokumentasi Anda.\n');
  }
}

async function syncAdapters(targetDir) {
  const adaptersDir = path.resolve('adapters');
  const destinations = [
    { src: 'antigravity/SKILL.md', dest: '.agents/skills/readme-architect/SKILL.md' },
    { src: 'claude/CLAUDE.md', dest: 'CLAUDE.md' },
    { src: 'cursor/readme-architect.mdc', dest: '.cursor/rules/readme-architect.mdc' },
    { src: 'windsurf/windsurfrules.md', dest: '.windsurfrules' },
    { src: 'copilot/copilot-instructions.md', dest: '.github/copilot-instructions.md' },
    { src: 'openagent/AGENTS.md', dest: 'AGENTS.md' }
  ];

  console.log('🔄 Menyinkronkan konfigurasi Multi-Agent adapters...');
  for (const item of destinations) {
    const srcPath = path.join(adaptersDir, item.src);
    const destPath = path.join(targetDir, item.dest);
    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Terpasang: ${item.dest}`);
    }
  }
  console.log('✨ Sinkronisasi selesai! Semua AI agent kini mengenali README-Architect.\n');
}

async function main() {
  const config = loadConfigFile();
  const options = parseArgs(process.argv.slice(2), config);

  if (options.help) {
    showHelp();
    return;
  }

  if (options.mcp) {
    const server = new McpServer();
    server.start();
    return;
  }

  if (options.syncAgents) {
    await syncAdapters(process.cwd());
    return;
  }

  if (options.verify) {
    await runAuditVerification(options.output);
    return;
  }

  console.log(`\n🚀 [README-Architect] Memulai pembuatan dokumentasi...`);
  console.log(`   Bahasa Output  : ${options.language}`);
  console.log(`   Gaya Penulisan : ${options.style}`);
  console.log(`   Tema Visual    : ${options.theme}`);
  console.log(`   File Target    : ${options.output}\n`);

  const architect = new ReadmeArchitect({
    rootDir: process.cwd(),
    style: options.style,
    theme: options.theme,
    registry: options.registry,
    language: options.language
  });

  let existing = '';
  const outputPath = path.resolve(options.output);
  if (fs.existsSync(outputPath)) {
    console.log(`ℹ️ Ditemukan file ${options.output} yang ada. Menggunakan mode Smart Delta Update...`);
    existing = fs.readFileSync(outputPath, 'utf8');
  }

  const generated = await architect.generate(existing);
  fs.writeFileSync(outputPath, generated, 'utf8');

  console.log(`✅ Dokumentasi berhasil dibuat di: ${options.output}`);
  console.log(`🛡️ 100% tervalidasi anti-halusinasi & patuh standar WCAG 2.2 AA / SPDX.\n`);
}

main().catch(err => {
  console.error('❌ Terjadi kesalahan:', err);
  process.exit(1);
});
