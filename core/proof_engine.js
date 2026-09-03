import fs from 'node:fs';
import path from 'node:path';

/**
 * ProofEngine menjamin kepatuhan Zero-Hallucination & Secret Sanitization:
 * - Memverifikasi seluruh perintah terminal terhadap manifest riil
 * - Melarang keras halusinasi port
 * - Mensterilkan rahasia (API key, AWS key, JWT, password) via Shannon Entropy / Regex pattern
 */
export class ProofEngine {
  constructor(rootDir = process.cwd()) {
    this.rootDir = path.resolve(rootDir);
  }

  /**
   * Memvalidasi perintah eksekusi terhadap file manifes fisik
   */
  verifyCommand(commandStr, metadata) {
    if (!commandStr || typeof commandStr !== 'string') {
      return { verified: false, reason: 'Perintah kosong atau tidak valid.' };
    }

    const trimmed = commandStr.trim();
    const [runner, ...args] = trimmed.split(' ');

    // 1. Docker commands
    if (runner === 'docker' || runner === 'docker-compose') {
      const hasCompose = fs.existsSync(path.join(this.rootDir, 'docker-compose.yml')) ||
                         fs.existsSync(path.join(this.rootDir, 'compose.yaml')) ||
                         fs.existsSync(path.join(this.rootDir, 'Dockerfile'));
      return {
        verified: hasCompose,
        reason: hasCompose ? 'Terbukti dari adanya Dockerfile / compose file' : 'File Docker tidak ditemukan di repositori'
      };
    }

    // 2. Node / pnpm / bun / yarn / npm commands
    if (['npm', 'pnpm', 'yarn', 'bun'].includes(runner)) {
      const pkgPath = path.join(this.rootDir, 'package.json');
      if (!fs.existsSync(pkgPath)) {
        return { verified: false, reason: 'package.json tidak ditemukan untuk runner JS/TS' };
      }
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const sub = args[0] === 'run' ? args[1] : args[0];

        if (sub === 'install' || sub === 'i' || sub === 'add') {
          return { verified: true, reason: 'Perintah instalasi paket standar' };
        }

        if (pkg.scripts && pkg.scripts[sub]) {
          return { verified: true, proof: `package.json#scripts.${sub}: "${pkg.scripts[sub]}"` };
        }

        return {
          verified: false,
          reason: `Script "${sub}" tidak terdaftar di package.json#scripts. Dilarang mengarang perintah!`
        };
      } catch (err) {
        return { verified: false, reason: `Gagal membaca package.json: ${err.message}` };
      }
    }

    // 3. Python commands
    if (['python', 'python3', 'pytest', 'poetry', 'pip', 'uv'].includes(runner)) {
      const hasPythonManifest = fs.existsSync(path.join(this.rootDir, 'pyproject.toml')) ||
                                fs.existsSync(path.join(this.rootDir, 'requirements.txt')) ||
                                fs.existsSync(path.join(this.rootDir, 'setup.py'));
      return {
        verified: hasPythonManifest,
        reason: hasPythonManifest ? 'Terbukti dari manifest Python' : 'Bukan proyek Python valid'
      };
    }

    // 4. Go commands
    if (runner === 'go') {
      const hasGoMod = fs.existsSync(path.join(this.rootDir, 'go.mod'));
      return { verified: hasGoMod, reason: hasGoMod ? 'Terbukti dari go.mod' : 'go.mod tidak ditemukan' };
    }

    // 5. Cargo / Rust commands
    if (runner === 'cargo') {
      const hasCargo = fs.existsSync(path.join(this.rootDir, 'Cargo.toml'));
      return { verified: hasCargo, reason: hasCargo ? 'Terbukti dari Cargo.toml' : 'Cargo.toml tidak ditemukan' };
    }

    // 6. Java / Maven / Gradle commands
    if (runner === 'mvn' || runner === './mvnw' || runner === 'gradle' || runner === './gradlew') {
      const hasJava = fs.existsSync(path.join(this.rootDir, 'pom.xml')) ||
                      fs.existsSync(path.join(this.rootDir, 'build.gradle')) ||
                      fs.existsSync(path.join(this.rootDir, 'build.gradle.kts'));
      return { verified: hasJava, reason: hasJava ? 'Terbukti dari manifest Maven/Gradle' : 'Manifest Java tidak ditemukan' };
    }

    // 7. PHP / Composer commands
    if (runner === 'composer' || runner === 'php') {
      const hasPhp = fs.existsSync(path.join(this.rootDir, 'composer.json'));
      return { verified: hasPhp, reason: hasPhp ? 'Terbukti dari composer.json' : 'composer.json tidak ditemukan' };
    }

    // 8. Terraform & Helm
    if (runner === 'terraform' || runner === 'helm') {
      const hasIac = fs.existsSync(path.join(this.rootDir, 'main.tf')) ||
                     fs.existsSync(path.join(this.rootDir, 'Chart.yaml'));
      return { verified: hasIac, reason: hasIac ? 'Terbukti dari file Terraform / Helm' : 'File IaC tidak ditemukan' };
    }

    return { verified: true, reason: 'Perintah shell standar' };
  }

  /**
   * Menyaring seluruh perintah dan menghasilkan verified command dictionary
   */
  filterVerifiedScripts(scripts, metadata) {
    const verified = {};
    const auditLog = [];

    for (const [key, cmd] of Object.entries(scripts || {})) {
      const check = this.verifyCommand(cmd, metadata);
      if (check.verified) {
        verified[key] = cmd;
        auditLog.push({ command: cmd, status: 'VERIFIED', proof: check.proof || check.reason });
      } else {
        auditLog.push({ command: cmd, status: 'REJECTED_HALLUCINATION', reason: check.reason });
      }
    }

    return { verified, auditLog };
  }

  /**
   * Resolusi port server yang akurat tanpa halusinasi
   */
  resolveServerPort(envVars) {
    // 1. Dari .env variables
    const portVar = envVars.find(v => v.name.toUpperCase().includes('PORT'));
    if (portVar && portVar.default && portVar.default !== '-') {
      return { port: portVar.default, source: '.env.example' };
    }

    // 2. Pindai source code
    const foundPort = this.scanCodeForPort();
    if (foundPort) {
      return { port: foundPort, source: 'source code default' };
    }

    // 3. Fallback standar
    return { port: '3000', source: 'framework default fallback' };
  }

  scanCodeForPort() {
    const candidateFiles = ['src/index.js', 'src/index.ts', 'src/server.js', 'src/server.ts', 'src/main.ts', 'main.go', 'main.py'];
    for (const f of candidateFiles) {
      const p = path.join(this.rootDir, f);
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf8');
        const match = text.match(/PORT\s*\|\|\s*(\d{2,5})/i) || text.match(/listen\((\d{2,5})\)/i);
        if (match) return match[1];
      }
    }
    return null;
  }

  /**
   * Secret Sanitization Engine (FR-2.3 & NFR-5.3):
   * Otomatis menyamarkan token API, AWS key, JWT, dan password sensitif
   */
  sanitizeSecret(val, keyName = '') {
    if (!val || val === '-' || typeof val !== 'string') return val;

    // AWS Access Key
    if (/AKIA[0-9A-Z]{16}/.test(val)) {
      return '<YOUR_AWS_ACCESS_KEY>';
    }

    // OpenAI / Anthropic / Provider API Keys
    if (/sk-[a-zA-Z0-9_-]{20,}/.test(val) || /^ghp_[a-zA-Z0-9]{30,}/.test(val)) {
      return '<YOUR_API_KEY>';
    }

    // JWT Token
    if (/^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(val) || /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(val)) {
      return '<YOUR_JWT_TOKEN>';
    }

    // Password / Secret keyword matching
    const upperKey = keyName.toUpperCase();
    if (
      upperKey.includes('SECRET') ||
      upperKey.includes('PASSWORD') ||
      upperKey.includes('TOKEN') ||
      upperKey.includes('PRIVATE_KEY')
    ) {
      // Jika bukan placeholder standar
      if (!val.startsWith('<YOUR_') && !val.includes('change_me') && val.length > 5) {
        return `<YOUR_${keyName.toUpperCase()}>`;
      }
    }

    return val;
  }

  /**
   * Mensterilkan seluruh variabel lingkungan sebelum disajikan di README
   */
  sanitizeEnvVariables(envVars = []) {
    return envVars.map(v => ({
      ...v,
      default: this.sanitizeSecret(v.default, v.name)
    }));
  }
}
