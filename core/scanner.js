import fs from 'node:fs';
import path from 'node:path';

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'target', 'vendor',
  '.next', '.nuxt', '__pycache__', '.pytest_cache', '.turbo',
  'coverage', '.idea', '.vscode', '.gradle', 'bin', 'obj'
]);

/**
 * Memindai basis kode untuk mendeteksi ekosistem, dependensi, variabel lingkungan,
 * monorepo packages, dan struktur folder fisik.
 */
export class CodebaseScanner {
  constructor(rootDir = process.cwd(), options = {}) {
    this.rootDir = path.resolve(rootDir);
    this.maxDepth = options.maxDepth ?? 3;
  }

  /**
   * Menjalankan pemindaian lengkap dan mengembalikan metadata repositori
   */
  async scan() {
    const manifestFiles = this.findManifestFiles();
    const ecosystem = this.detectEcosystem(manifestFiles);
    const envVars = this.extractEnvVariables();
    const scripts = this.extractScripts(manifestFiles, ecosystem);
    const directoryTree = this.buildDirectoryTree(this.rootDir, 0);
    const gitInfo = this.extractGitInfo();
    const monorepoPackages = ecosystem.monorepo ? this.scanMonorepoPackages() : [];

    return {
      project_meta: {
        name: scripts.name || path.basename(this.rootDir),
        description: scripts.description || 'Modern software repository with automated documentation.',
        version: scripts.version || '1.0.0',
        license: scripts.license || 'MIT',
        repository_url: gitInfo.url || ''
      },
      ecosystem: {
        ...ecosystem,
        packages: monorepoPackages
      },
      execution_scripts: scripts.commands,
      environment: {
        variables: envVars
      },
      directory_tree: directoryTree
    };
  }

  findManifestFiles() {
    const manifests = {};
    const checkFile = (filename) => {
      const fullPath = path.join(this.rootDir, filename);
      if (fs.existsSync(fullPath)) {
        manifests[filename] = fullPath;
      }
    };

    [
      'package.json', 'pnpm-lock.yaml', 'bun.lockb', 'yarn.lock', 'package-lock.json',
      'pyproject.toml', 'requirements.txt', 'poetry.lock', 'setup.py', 'Pipfile',
      'go.mod', 'go.sum',
      'Cargo.toml', 'Cargo.lock',
      'pom.xml', 'build.gradle', 'build.gradle.kts',
      'composer.json', 'composer.lock',
      'main.tf', 'terraform.tfvars', 'Chart.yaml', 'values.yaml',
      'Dockerfile', 'docker-compose.yml', 'compose.yaml',
      '.env.example', '.env.template', '.env.sample'
    ].forEach(checkFile);

    return manifests;
  }

  detectEcosystem(manifests) {
    let language = 'Unknown';
    let packageManager = 'Unknown';
    let frameworks = [];
    let isMonorepo = false;

    // 1. Node.js / TypeScript
    if (manifests['package.json']) {
      language = 'TypeScript';
      if (manifests['bun.lockb']) packageManager = 'bun';
      else if (manifests['pnpm-lock.yaml']) packageManager = 'pnpm';
      else if (manifests['yarn.lock']) packageManager = 'yarn';
      else packageManager = 'npm';

      try {
        const pkg = JSON.parse(fs.readFileSync(manifests['package.json'], 'utf8'));
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        if (!deps.typescript && !fs.existsSync(path.join(this.rootDir, 'tsconfig.json'))) {
          language = 'JavaScript';
        }

        if (deps.next) frameworks.push('Next.js ' + (deps.next.replace(/[\^~]/g, '') || '15'));
        if (deps.react) frameworks.push('React');
        if (deps.fastify) frameworks.push('Fastify');
        if (deps.express) frameworks.push('Express');
        if (deps.nestjs || deps['@nestjs/core']) frameworks.push('NestJS');
        if (deps.tailwindcss) frameworks.push('TailwindCSS');
        if (deps.prisma || deps['@prisma/client']) frameworks.push('Prisma ORM');
        if (deps.vitest) frameworks.push('Vitest');
        if (deps.jest) frameworks.push('Jest');

        if (pkg.workspaces || fs.existsSync(path.join(this.rootDir, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(this.rootDir, 'turbo.json'))) {
          isMonorepo = true;
        }
      } catch {}
    }
    // 2. Python
    else if (manifests['pyproject.toml'] || manifests['requirements.txt'] || manifests['setup.py']) {
      language = 'Python';
      if (manifests['poetry.lock']) packageManager = 'poetry';
      else if (manifests['Pipfile']) packageManager = 'pipenv';
      else packageManager = 'pip (or uv)';

      frameworks.push('Python 3.x');
      const text = (manifests['pyproject.toml'] ? fs.readFileSync(manifests['pyproject.toml'], 'utf8') : '') +
                   (manifests['requirements.txt'] ? fs.readFileSync(manifests['requirements.txt'], 'utf8') : '');
      if (text.includes('fastapi')) frameworks.push('FastAPI');
      if (text.includes('django')) frameworks.push('Django');
      if (text.includes('flask')) frameworks.push('Flask');
      if (text.includes('torch')) frameworks.push('PyTorch');
    }
    // 3. Go
    else if (manifests['go.mod']) {
      language = 'Go';
      packageManager = 'go mod';
      try {
        const mod = fs.readFileSync(manifests['go.mod'], 'utf8');
        if (mod.includes('github.com/gofiber/fiber')) frameworks.push('Fiber');
        if (mod.includes('github.com/gin-gonic/gin')) frameworks.push('Gin');
      } catch {}
    }
    // 4. Rust
    else if (manifests['Cargo.toml']) {
      language = 'Rust';
      packageManager = 'cargo';
    }
    // 5. Java / Kotlin (Maven / Gradle)
    else if (manifests['pom.xml'] || manifests['build.gradle'] || manifests['build.gradle.kts']) {
      language = manifests['build.gradle.kts'] ? 'Kotlin' : 'Java';
      packageManager = manifests['pom.xml'] ? 'Maven (mvn)' : 'Gradle';
      const pomPath = manifests['pom.xml'];
      const gradlePath = manifests['build.gradle'];
      const text = (pomPath && fs.existsSync(pomPath) ? fs.readFileSync(pomPath, 'utf8') : '') +
                   (gradlePath && fs.existsSync(gradlePath) ? fs.readFileSync(gradlePath, 'utf8') : '');
      if (text.includes('spring-boot')) frameworks.push('Spring Boot');
      else frameworks.push('JVM Application');
    }
    // 6. PHP (Composer)
    else if (manifests['composer.json']) {
      language = 'PHP';
      packageManager = 'composer';
      try {
        const compPath = manifests['composer.json'];
        if (compPath && fs.existsSync(compPath)) {
          const comp = fs.readFileSync(compPath, 'utf8');
          if (comp.includes('laravel/framework')) frameworks.push('Laravel');
          else if (comp.includes('symfony/')) frameworks.push('Symfony');
        }
      } catch {}
    }
    // 7. Infrastructure as Code (Terraform / Helm)
    else if (manifests['main.tf'] || manifests['Chart.yaml']) {
      language = manifests['main.tf'] ? 'HCL (Terraform)' : 'Helm (Kubernetes)';
      packageManager = manifests['main.tf'] ? 'terraform' : 'helm';
      frameworks.push(manifests['main.tf'] ? 'Terraform IaC' : 'Kubernetes Helm Chart');
    }

    if (manifests['Dockerfile'] || manifests['docker-compose.yml']) {
      frameworks.push('Docker');
    }

    return {
      primary_language: language,
      package_manager: packageManager,
      frameworks: frameworks.length > 0 ? frameworks : [language],
      monorepo: isMonorepo
    };
  }

  extractScripts(manifests, ecosystem) {
    let name = '';
    let description = '';
    let version = '1.0.0';
    let license = 'MIT';
    const commands = {};

    if (manifests['package.json']) {
      try {
        const pkg = JSON.parse(fs.readFileSync(manifests['package.json'], 'utf8'));
        name = pkg.name;
        description = pkg.description;
        version = pkg.version || version;
        license = pkg.license || license;

        const pm = ecosystem.package_manager === 'npm' ? 'npm run' : ecosystem.package_manager;
        const s = pkg.scripts || {};

        commands.install = `${ecosystem.package_manager} install`;
        if (s.dev) commands.dev = `${pm} dev`;
        else if (s.start) commands.dev = `${pm} start`;

        if (s.build) commands.build = `${pm} build`;
        if (s.test) commands.test = `${pm} test`;
        if (s.lint) commands.lint = `${pm} lint`;
        if (s['db:migrate']) commands.migrate = `${pm} db:migrate`;
        else if (s.migrate) commands.migrate = `${pm} migrate`;
      } catch {}
    } else if (ecosystem.primary_language === 'Python') {
      commands.install = ecosystem.package_manager.includes('poetry') ? 'poetry install' : 'pip install -r requirements.txt';
      commands.dev = 'python main.py';
      commands.test = 'pytest';
    } else if (ecosystem.primary_language === 'Go') {
      commands.install = 'go mod download';
      commands.dev = 'go run .';
      commands.build = 'go build -o app .';
      commands.test = 'go test ./...';
    } else if (ecosystem.primary_language === 'Rust') {
      commands.install = 'cargo fetch';
      commands.dev = 'cargo run';
      commands.build = 'cargo build --release';
      commands.test = 'cargo test';
    } else if (ecosystem.primary_language.includes('Java') || ecosystem.primary_language.includes('Kotlin')) {
      const isMaven = manifests['pom.xml'];
      commands.install = isMaven ? './mvnw clean install' : './gradlew build';
      commands.dev = isMaven ? './mvnw spring-boot:run' : './gradlew bootRun';
      commands.test = isMaven ? './mvnw test' : './gradlew test';
    } else if (ecosystem.primary_language === 'PHP') {
      commands.install = 'composer install';
      commands.dev = 'php artisan serve';
      commands.test = 'composer test';
    } else if (ecosystem.primary_language.includes('Terraform')) {
      commands.install = 'terraform init';
      commands.dev = 'terraform plan';
      commands.build = 'terraform apply';
    } else if (ecosystem.primary_language.includes('Helm')) {
      commands.install = 'helm dependency update';
      commands.dev = 'helm lint .';
      commands.build = 'helm package .';
    }

    if (manifests['docker-compose.yml'] || manifests['compose.yaml']) {
      commands.docker = 'docker compose up -d --build';
    }

    return { name, description, version, license, commands };
  }

  scanMonorepoPackages() {
    const packages = [];
    const searchDirs = ['packages', 'apps', 'services', 'libs'];

    for (const dirName of searchDirs) {
      const fullDir = path.join(this.rootDir, dirName);
      if (fs.existsSync(fullDir) && fs.statSync(fullDir).isDirectory()) {
        try {
          const items = fs.readdirSync(fullDir, { withFileTypes: true });
          for (const item of items) {
            if (item.isDirectory()) {
              const subPkgPath = path.join(fullDir, item.name, 'package.json');
              if (fs.existsSync(subPkgPath)) {
                try {
                  const subPkg = JSON.parse(fs.readFileSync(subPkgPath, 'utf8'));
                  packages.push({
                    name: subPkg.name || item.name,
                    path: `${dirName}/${item.name}`,
                    version: subPkg.version || '1.0.0',
                    description: subPkg.description || 'Sub-package module'
                  });
                } catch {}
              }
            }
          }
        } catch {}
      }
    }

    return packages;
  }

  extractEnvVariables() {
    const envFiles = ['.env.example', '.env.template', '.env.sample'];
    const vars = [];

    for (const f of envFiles) {
      const p = path.join(this.rootDir, f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const [rawKey, ...valParts] = trimmed.split('=');
          const key = rawKey.trim();
          const defaultVal = valParts.join('=').trim().replace(/^["']|["']$/g, '');
          
          vars.push({
            name: key,
            type: this.inferEnvType(key, defaultVal),
            required: !defaultVal || key.includes('SECRET') || key.includes('KEY'),
            default: defaultVal || '-',
            description: this.inferEnvDescription(key)
          });
        }
        break;
      }
    }

    return vars;
  }

  inferEnvType(key, val) {
    if (/^\d+$/.test(val) || key.includes('PORT')) return 'Number';
    if (/^(true|false)$/i.test(val)) return 'Boolean';
    if (key.includes('URL') || key.includes('URI')) return 'URL / Connection String';
    return 'String';
  }

  inferEnvDescription(key) {
    const lower = key.toLowerCase();
    if (lower.includes('port')) return 'Port server HTTP listen';
    if (lower.includes('database') || lower.includes('db_')) return 'Koneksi database utama';
    if (lower.includes('redis')) return 'URL koneksi cache/queue Redis';
    if (lower.includes('secret') || lower.includes('key')) return 'Kunci enkripsi / signature sesi privat';
    if (lower.includes('jwt')) return 'Secret token otentikasi JWT';
    return 'Parameter konfigurasi runtime aplikasi';
  }

  buildDirectoryTree(dirPath, depth = 0) {
    if (depth >= this.maxDepth) return [];
    const entries = [];

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const item of items) {
        if (IGNORED_DIRS.has(item.name) || item.name.startsWith('.')) continue;

        const isDir = item.isDirectory();
        const node = {
          name: item.name,
          type: isDir ? 'directory' : 'file',
          icon: this.getIcon(item.name, isDir),
          children: isDir ? this.buildDirectoryTree(path.join(dirPath, item.name), depth + 1) : null
        };
        entries.push(node);
      }
    } catch {}

    return entries;
  }

  getIcon(name, isDir) {
    if (isDir) {
      if (name === 'src' || name === 'lib') return '📁';
      if (name === 'config') return '⚙️';
      if (name === 'tests' || name === 'test') return '🧪';
      if (name === 'docs') return '📖';
      if (name === 'packages' || name === 'apps') return '📦';
      return '📁';
    }
    if (name.includes('docker')) return '🐳';
    if (name.endsWith('.md')) return '📄';
    if (name.includes('config') || name.endsWith('.json') || name.endsWith('.toml')) return '⚙️';
    return '📄';
  }

  extractGitInfo() {
    try {
      const gitConfigPath = path.join(this.rootDir, '.git', 'config');
      if (fs.existsSync(gitConfigPath)) {
        const text = fs.readFileSync(gitConfigPath, 'utf8');
        const match = text.match(/url\s*=\s*(.+)/);
        if (match) {
          let url = match[1].trim();
          if (url.startsWith('git@github.com:')) {
            url = url.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '');
          }
          return { url };
        }
      }
    } catch {}
    return { url: '' };
  }
}
