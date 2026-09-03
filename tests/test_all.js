import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { CodebaseScanner } from '../core/scanner.js';
import { ProofEngine } from '../core/proof_engine.js';
import { StyleEngine } from '../core/style_engine.js';
import { StandardsEngine } from '../core/standards_engine.js';
import { BeautifierEngine } from '../core/beautifier.js';
import { DeltaMerger } from '../core/merger.js';
import { RegistryAdapter } from '../core/registry_adapter.js';
import { ReadmeArchitect } from '../core/index.js';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 ========================================================');
  console.log('   README-Architect v1.6.0 Automated Test Suite');
  console.log('========================================================\n');

  // ----------------------------------------------------
  // 1. Scanner Tests
  // ----------------------------------------------------
  console.log('📦 [1/8] Testing CodebaseScanner Module...');
  const nodeFixtureDir = path.resolve('tests/fixtures/sample-node');
  const pythonFixtureDir = path.resolve('tests/fixtures/sample-python');
  const goFixtureDir = path.resolve('tests/fixtures/sample-go');

  await itAsync('Should accurately scan Node.js repository with manifests and env vars', async () => {
    const scanner = new CodebaseScanner(nodeFixtureDir);
    const data = await scanner.scan();
    assert.strictEqual(data.project_meta.name, 'sample-nexacloud-api');
    assert.strictEqual(data.ecosystem.primary_language, 'TypeScript');
    assert.strictEqual(data.ecosystem.package_manager, 'npm');
    assert.ok(data.ecosystem.frameworks.some(f => f.includes('Fastify')));
    assert.ok(data.environment.variables.some(v => v.name === 'PORT'));
    assert.ok(data.environment.variables.some(v => v.name === 'DATABASE_URL'));
    assert.strictEqual(data.execution_scripts.dev, 'npm run dev');
  });

  await itAsync('Should accurately scan Python repository with poetry and FastAPI', async () => {
    const scanner = new CodebaseScanner(pythonFixtureDir);
    const data = await scanner.scan();
    assert.strictEqual(data.ecosystem.primary_language, 'Python');
    assert.ok(data.ecosystem.frameworks.includes('FastAPI'));
  });

  await itAsync('Should accurately scan Go repository with go.mod and Fiber', async () => {
    const scanner = new CodebaseScanner(goFixtureDir);
    const data = await scanner.scan();
    assert.strictEqual(data.ecosystem.primary_language, 'Go');
    assert.ok(data.ecosystem.frameworks.includes('Fiber'));
  });

  it('Should detect Java, PHP, and IaC manifests correctly', () => {
    const scanner = new CodebaseScanner(nodeFixtureDir);
    const javaEco = scanner.detectEcosystem({ 'pom.xml': 'pom.xml' });
    assert.strictEqual(javaEco.primary_language, 'Java');
    assert.strictEqual(javaEco.package_manager, 'Maven (mvn)');

    const phpEco = scanner.detectEcosystem({ 'composer.json': 'composer.json' });
    assert.strictEqual(phpEco.primary_language, 'PHP');
    assert.strictEqual(phpEco.package_manager, 'composer');

    const iacEco = scanner.detectEcosystem({ 'main.tf': 'main.tf' });
    assert.strictEqual(iacEco.primary_language, 'HCL (Terraform)');
  });

  // ----------------------------------------------------
  // 2. Anti-Hallucination & Secret Sanitization Tests
  // ----------------------------------------------------
  console.log('\n🛡️ [2/8] Testing ProofEngine (Anti-Hallucination & Sanitization)...');
  it('Should verify real commands from package.json', () => {
    const proof = new ProofEngine(nodeFixtureDir);
    const checkDev = proof.verifyCommand('npm run dev');
    assert.strictEqual(checkDev.verified, true);

    const checkTest = proof.verifyCommand('npm test');
    assert.strictEqual(checkTest.verified, true);
  });

  it('Should strictly REJECT hallucinated / non-existent commands', () => {
    const proof = new ProofEngine(nodeFixtureDir);
    const checkFake = proof.verifyCommand('npm run non_existent_command_123');
    assert.strictEqual(checkFake.verified, false);
    assert.ok(checkFake.reason.includes('Dilarang mengarang perintah'));
  });

  it('Should sanitize AWS keys, API keys, JWTs, and passwords (FR-2.3)', () => {
    const proof = new ProofEngine(nodeFixtureDir);
    assert.strictEqual(proof.sanitizeSecret('AKIAIOSFODNN7EXAMPLE'), '<YOUR_AWS_ACCESS_KEY>');
    assert.strictEqual(proof.sanitizeSecret('sk-abcdef1234567890abcdef123456'), '<YOUR_API_KEY>');
    assert.strictEqual(
      proof.sanitizeSecret('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeak'),
      '<YOUR_JWT_TOKEN>'
    );
    assert.strictEqual(proof.sanitizeSecret('SuperSecretPass999!', 'DATABASE_PASSWORD'), '<YOUR_DATABASE_PASSWORD>');
  });

  it('Should accurately resolve server port without hallucination', () => {
    const proof = new ProofEngine(nodeFixtureDir);
    const envVars = [{ name: 'PORT', default: '4000' }];
    const resolved = proof.resolveServerPort(envVars);
    assert.strictEqual(resolved.port, '4000');
    assert.strictEqual(resolved.source, '.env.example');
  });

  // ----------------------------------------------------
  // 3. Cross-Registry Parity Tests (FR-8.1)
  // ----------------------------------------------------
  console.log('\n🌐 [3/8] Testing RegistryAdapter (Cross-Registry Parity)...');
  it('Should gracefully degrade GitHub alerts to CommonMark for PyPI & npm', () => {
    const adapter = new RegistryAdapter('pypi');
    const input = '> [!NOTE]\n> Ini adalah catatan penting.\n\n> [!WARNING]\n> Perhatikan ini.';
    const output = adapter.adapt(input);
    assert.ok(output.includes('> **Note:**'));
    assert.ok(output.includes('> Ini adalah catatan penting.'));
    assert.ok(output.includes('> **Warning:**'));
    assert.ok(!output.includes('[!NOTE]'));
  });

  // ----------------------------------------------------
  // 4. StyleEngine (12 Personas) Tests
  // ----------------------------------------------------
  console.log('\n✍️ [4/8] Testing StyleEngine (12 Writing Styles)...');
  const allStyles = [
    'showcase', 'developer-centric', 'product-oriented', 'devops-infra',
    'api-first', 'security-first', 'cli-tool', 'storytelling',
    'minimalist', 'enterprise', 'tutorial', 'academic'
  ];

  it('Should correctly validate all 12 styles', () => {
    allStyles.forEach(style => {
      const engine = new StyleEngine(style);
      assert.strictEqual(engine.style, style);
    });
  });

  it('Should render CLI usage and flags table for cli-tool style', () => {
    const engine = new StyleEngine('cli-tool');
    const usage = engine.renderCliUsage('mytool');
    assert.ok(usage.includes('mytool [flags] <command>'));
    assert.ok(usage.includes('--verbose'));
    assert.ok(usage.includes('Exit Codes:'));
  });

  it('Should render BibTeX citation block for academic style', () => {
    const engine = new StyleEngine('academic');
    const bibtex = engine.renderAcademicCitation({ name: 'DeepModel', repository_url: 'https://github.com/org/repo' });
    assert.ok(bibtex.includes('@software{deepmodel'));
    assert.ok(bibtex.includes('Sitasi Akademik'));
  });

  // ----------------------------------------------------
  // 5. StandardsEngine (WCAG 2.2, SPDX, CITATION) Tests
  // ----------------------------------------------------
  console.log('\n🌐 [5/8] Testing StandardsEngine (A11y, SPDX, CITATION.cff)...');
  it('Should format accessible badges with mandatory alt-text (WCAG 2.2 AA)', () => {
    const std = new StandardsEngine();
    const badge = std.formatAccessibleBadge('Build Status: Passing', 'https://img.shields.io/badge/Build-Passing-green');
    assert.strictEqual(badge, '![Build Status: Passing](https://img.shields.io/badge/Build-Passing-green)');
    assert.ok(!badge.includes('[![]('));
  });

  it('Should append textual fallback below Mermaid diagrams for screen readers', () => {
    const std = new StandardsEngine();
    const mermaidA11y = std.formatMermaidWithA11y('flowchart TD\nA-->B', 'Alur dari A ke B');
    assert.ok(mermaidA11y.includes('Ringkasan Aksesibilitas Alur'));
    assert.ok(mermaidA11y.includes('Alur dari A ke B'));
  });

  it('Should generate valid SPDX 3.0 license and copyright block', () => {
    const std = new StandardsEngine();
    const license = std.formatSpdxLicense('MIT', 'NexaCloud Authors', 2026);
    assert.ok(license.spdxIdentifier.includes('SPDX-License-Identifier: MIT'));
    assert.ok(license.copyrightNotice.includes('Copyright (c) 2026 NexaCloud Authors'));
  });

  it('Should generate valid CITATION.cff YAML string', () => {
    const std = new StandardsEngine();
    const cff = std.generateCitationCff({ name: 'TestRepo', version: '2.0.0', license: 'Apache-2.0' });
    assert.ok(cff.includes('cff-version: 1.2.0'));
    assert.ok(cff.includes('title: "TestRepo"'));
    assert.ok(cff.includes('license: "Apache-2.0"'));
  });

  it('Should generate standard All-Contributors emoji table', () => {
    const std = new StandardsEngine();
    const table = std.generateAllContributorsTable();
    assert.ok(table.includes('ALL-CONTRIBUTORS-LIST:START'));
    assert.ok(table.includes('💻'));
    assert.ok(table.includes('📖'));
  });

  // ----------------------------------------------------
  // 6. BeautifierEngine Tests
  // ----------------------------------------------------
  console.log('\n🎨 [6/8] Testing BeautifierEngine (Visual Excellence)...');
  it('Should format centered Hero Header with palette badges', () => {
    const beautifier = new BeautifierEngine('tokyo-night');
    const header = beautifier.generateHeroHeader({ name: 'NexaCloud', description: 'Cloud Engine' });
    assert.ok(header.includes('<div align="center">'));
    assert.ok(header.includes('🚀 NexaCloud'));
    assert.ok(header.includes('tokyo-night') || header.includes('7aa2f7'));
  });

  it('Should format Unicode Directory Tree with emoji icons', () => {
    const beautifier = new BeautifierEngine();
    const tree = beautifier.formatDirectoryTree([
      { name: 'src', icon: '📁', children: [{ name: 'index.js', icon: '📄' }] },
      { name: 'Dockerfile', icon: '🐳' }
    ]);
    assert.ok(tree.includes('├── 📁 src'));
    assert.ok(tree.includes('└── 🐳 Dockerfile'));
  });

  // ----------------------------------------------------
  // 7. DeltaMerger Tests (Non-Destructive Update)
  // ----------------------------------------------------
  console.log('\n🔄 [7/8] Testing DeltaMerger (Non-Destructive Update)...');
  it('Should preserve custom user-written notes when updating sections', () => {
    const merger = new DeltaMerger();
    const existingReadme = `<!-- readme-architect:start(overview) -->
Old Overview
<!-- readme-architect:end(overview) -->

<!-- user-content:start(sponsor) -->
Support my open source work on Patreon!
<!-- user-content:end(sponsor) -->`;

    const updated = merger.merge(existingReadme, {
      overview: 'Brand New High-Performance Overview'
    });

    assert.ok(updated.includes('Brand New High-Performance Overview'));
    assert.ok(updated.includes('Support my open source work on Patreon!'), 'User custom content MUST NOT be lost!');
  });

  // ----------------------------------------------------
  // 8. End-to-End Orchestration & Disk Artifacts Test
  // ----------------------------------------------------
  console.log('\n🚀 [8/8] Testing End-to-End ReadmeArchitect & CITATION.cff Generation...');
  await itAsync('Should generate complete 14-section accessible README and write CITATION.cff for academic style', async () => {
    const academicTestDir = path.resolve('tests/fixtures/sample-python');
    const architect = new ReadmeArchitect({
      rootDir: academicTestDir,
      style: 'academic',
      theme: 'catppuccin',
      registry: 'universal'
    });

    const readme = await architect.generate();
    assert.ok(readme.includes('## 📚 Sitasi Akademik'), 'Missing Academic Citation Block');
    assert.ok(readme.includes('> **Important:**'), 'Missing Graceful Degradation on Universal Registry');

    const cffPath = path.join(academicTestDir, 'CITATION.cff');
    assert.ok(fs.existsSync(cffPath), 'CITATION.cff MUST be written to disk in academic mode!');

    // Cleanup generated fixture file
    if (fs.existsSync(cffPath)) fs.unlinkSync(cffPath);
  });

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n========================================================');
  console.log(`🏁 Total Tests: ${passed + failed}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
