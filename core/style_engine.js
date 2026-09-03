/**
 * StyleEngine menghasilkan dokumentasi sesuai 12 Persona Gaya Penulisan:
 * 1. showcase
 * 2. developer-centric
 * 3. product-oriented
 * 4. devops-infra
 * 5. api-first
 * 6. security-first
 * 7. cli-tool
 * 8. storytelling
 * 9. minimalist
 * 10. enterprise
 * 11. tutorial
 * 12. academic
 *
 * Mendukung multi-bahasa: 'en' (default) & 'id'
 */
export class StyleEngine {
  constructor(style = 'showcase', language = 'en') {
    this.style = this.validateStyle(style);
    this.language = language === 'id' ? 'id' : 'en';
  }

  validateStyle(style) {
    const validStyles = [
      'showcase', 'developer-centric', 'product-oriented', 'devops-infra',
      'api-first', 'security-first', 'cli-tool', 'storytelling',
      'minimalist', 'enterprise', 'tutorial', 'academic'
    ];
    return validStyles.includes(style) ? style : 'showcase';
  }

  /**
   * Menghasilkan teks Overview yang disesuaikan dengan persona gaya dan bahasa
   */
  renderOverview(meta, ecosystem, lang = this.language) {
    const name = meta.name || 'Application';
    const techLang = ecosystem.primary_language || 'TypeScript';
    const isId = lang === 'id';

    if (isId) {
      switch (this.style) {
        case 'developer-centric':
          return `## 🌟 Gambaran Umum
**${name}** dibangun dengan fondasi arsitektur Clean Architecture berbasis **${techLang}**, mengisolasi business logic dari interface adapter dan transport layer. Mengedepankan *Developer Experience (DX)* yang optimal dengan type-safety ketat, dependency injection modular, serta performa eksekusi berlatensi rendah.`;

        case 'product-oriented':
          return `## 🌟 Solusi & Nilai Bisnis
**${name}** adalah platform otomatisasi modern yang dirancang untuk mengatasi hambatan operasional tim. Dengan menyederhanakan alur kerja yang rumit menjadi proses instan, platform ini menghemat waktu kerja tim hingga berjam-jam setiap minggunya serta meminimalkan risiko kesalahan manual.`;

        case 'devops-infra':
          return `## 🌟 Topologi & Keandalan Sistem
Repositori ini mengelola deployment dan orkestrasi infrastruktur cloud **${name}**. Didesain dengan prinsip *Infrastructure as Code (IaC)*, platform ini siap produksi dengan auto-scaling teruji, metrik observabilitas Prometheus, serta health-check probes mandiri.`;

        case 'api-first':
          return `## 🌟 Spesifikasi API & Kontrak Data
**${name}** menyediakan kumpulan RESTful endpoint berkinerja tinggi yang patuh pada standar OpenAPI 3.1. Seluruh payload request dan response divalidasi secara asinkron dengan penanganan otentikasi berbasis token terenkripsi.`;

        case 'security-first':
          return `## 🌟 Postur Keamanan & Kepatuhan
**${name}** dirancang dengan prinsip *Zero-Trust Architecture*. Setiap pertukaran data dienkripsi dengan standar kriptografi modern, dilengkapi audit log forensik yang tidak dapat dimanipulasi, serta pemindaian dependensi otomatis untuk menjamin keamanan pasokan perangkat lunak (*supply chain security*).`;

        case 'cli-tool':
          return `## 🌟 Deskripsi Perintah Terminal
\`${name.toLowerCase()}\` adalah utilitas baris perintah (CLI) yang ultra-cepat dan dirancang untuk efisiensi terminal. Mendukung piping UNIX standar, argumen flag yang intuitif, serta eksekusi instan tanpa beban runtime yang berat.`;

        case 'storytelling':
          return `## 🌟 Mengapa Kami Membangun Ini? (The Manifesto)
Kami lelah dengan tool yang lambat, rumit, dan memerlukan puluhan file konfigurasi hanya untuk tugas sederhana. Itulah alasan kami membangun **${name}** dari nol: sebuah alternatif revolusioner yang cepat, ramping, dan menyenangkan untuk digunakan kembali.`;

        case 'minimalist':
          return `## 🌟 Overview
${meta.description || name + ' - Fast and lightweight service.'}`;

        case 'enterprise':
          return `## 🌟 Ringkasan Eksekutif Perusahaan
**${name}** merupakan komponen inti sistem korporat yang mematuhi standar tata kelola kepatuhan, pemenuhan Service Level Agreement (SLA) 99.99%, serta integrasi Role-Based Access Control (RBAC) terpusat.`;

        case 'tutorial':
          return `## 🌟 Selamat Datang di Panduan ${name}!
Repositori ini dirancang khusus agar mudah dipelajari oleh siapa saja, dari pemula hingga berpengalaman. Kami menyediakan penjelasan langkah demi langkah agar Anda dapat memahami tidak hanya *bagaimana* menjalankannya, melainkan juga *mengapa* sistem ini dirancang demikian.`;

        case 'academic':
          return `## 🌟 Metodologi & Landasan Teori
Repositori ini menyertakan implementasi referensi eksperimental untuk **${name}**. Seluruh algoritma, model, dan prosedur evaluasi telah dirancang agar dapat direproduksi (*reproducible research*) secara konsisten dengan metrik benchmark empiris yang terlampir.`;

        case 'showcase':
        default:
          return `## 🌟 Gambaran Umum
**${name}** hadir sebagai solusi modern untuk menjembatani komunikasi terdistribusi lintas sistem secara aman dan berkinerja tinggi. Proyek open-source ini dibangun dengan semangat kolaborasi komunitas untuk memberikan pengalaman pengembangan perangkat lunak terbaik.`;
      }
    }

    // Default: English ('en')
    switch (this.style) {
      case 'developer-centric':
        return `## 🌟 Overview
**${name}** is engineered on Clean Architecture principles powered by **${techLang}**, isolating business logic from interface adapters and transport layers. It prioritizes optimal *Developer Experience (DX)* with rigorous type-safety, modular dependency injection, and low-latency execution.`;

      case 'product-oriented':
        return `## 🌟 Solution & Business Value
**${name}** is a modern automation platform designed to eliminate operational bottlenecks. By streamlining complex workflows into instant automated pipelines, it saves teams 10+ hours weekly while mitigating manual human error.`;

      case 'devops-infra':
        return `## 🌟 Topology & System Reliability
This repository manages cloud infrastructure deployment and orchestration for **${name}**. Built on *Infrastructure as Code (IaC)* principles, it is production-ready with battle-tested auto-scaling, Prometheus observability metrics, and automated self-healing health probes.`;

      case 'api-first':
        return `## 🌟 API Specification & Data Contracts
**${name}** delivers high-performance RESTful endpoints adhering strictly to OpenAPI 3.1 standards. All payloads are asynchronously validated against runtime schemas with token-based encrypted authentication.`;

      case 'security-first':
        return `## 🌟 Security Posture & Compliance
**${name}** is architected on *Zero-Trust* principles. All network exchanges are encrypted using AES-256-GCM / TLS 1.3, accompanied by immutable audit logging and automated software supply-chain dependency scanning.`;

      case 'cli-tool':
        return `## 🌟 Command-Line Utility Overview
\`${name.toLowerCase()}\` is an ultra-fast command-line utility built for terminal productivity. It supports standard UNIX piping, intuitive command flags, and instant startup latency without heavy runtime overhead.`;

      case 'storytelling':
        return `## 🌟 Why We Built This (The Manifesto)
We grew exhausted by bloated, slow tooling requiring dozens of config files just for basic tasks. That is why we built **${name}** from scratch: a lean, blazingly fast alternative designed to make development enjoyable again.`;

      case 'minimalist':
        return `## 🌟 Overview
${meta.description || name + ' - Fast, modern, and lightweight software service.'}`;

      case 'enterprise':
        return `## 🌟 Enterprise Executive Summary
**${name}** serves as a mission-critical enterprise building block supporting 99.99% availability SLAs, centralized Role-Based Access Control (RBAC), and SOC 2 / ISO 27001 compliance standards.`;

      case 'tutorial':
        return `## 🌟 Welcome to the ${name} Guide!
This project is crafted to be accessible and straightforward for developers of all skill levels. We provide clear step-by-step walkthroughs to understand not just *how* to run it, but *why* it is designed this way.`;

      case 'academic':
        return `## 🌟 Methodology & Theoretical Foundation
This repository contains the reference experimental implementation for **${name}**. All algorithms, mathematical models, and evaluation pipelines are designed for *reproducible research* with empirical benchmark metrics included.`;

      case 'showcase':
      default:
        return `## 🌟 Overview
**${name}** provides a state-of-the-art solution bridging distributed system communications securely and efficiently. Built by open-source contributors dedicated to world-class software engineering craftsmanship.`;
    }
  }

  /**
   * Menghasilkan tabel fitur yang cocok dengan gaya yang dipilih dan bahasa
   */
  renderFeatures(ecosystem, lang = this.language) {
    const isId = lang === 'id';
    const isProduct = this.style === 'product-oriented';
    const isSecurity = this.style === 'security-first';
    const isDevOps = this.style === 'devops-infra';
    const isCli = this.style === 'cli-tool';
    const isApi = this.style === 'api-first';

    if (isId) {
      if (isProduct) {
        return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Fitur & Manfaat Produk

| Masalah yang Dihadapi | Solusi yang Diberikan | Manfaat Nyata bagi Tim | Status |
| :--- | :--- | :--- | :--- |
| Proses data manual memakan waktu lama | Mesin otomatisasi sinkronisasi data | Menghemat 10+ jam kerja setiap pekan | ⚡ Aktif |
| Risiko kebocoran kredensial pelanggan | Enkripsi otomatis standar industri | Menjamin rasa aman dan kepatuhan data | 🔒 Aman |
| Kesulitan integrasi sistem lama | API modular siap pakai | Mempercepat peluncuran fitur baru | 🚀 Siap |`;
      }

      if (isSecurity) {
        return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Fitur Keamanan & Mitigasi Risiko

| Vektor Keamanan | Kontrol Mitigasi Teknis | Standar Kepatuhan | Status |
| :--- | :--- | :--- | :--- |
| Autentikasi & Sesi | Asymmetric RS256 JWT dengan auto key-rotation | OAuth 2.0 / NIST SP 800-63 | 🔒 Terverifikasi |
| Keamanan Data | AES-256-GCM encryption at-rest & in-transit | SOC 2 / GDPR | 🛡️ Aktif |
| Integritas Paket | Verifikasi tanda tangan digital & SBOM otomatis | OpenSSF Level 3 | ✅ Patuh |`;
      }

      if (isDevOps) {
        return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Fitur Infrastruktur & Keandalan

| Komponen Operasional | Mekanisme Implementasi | SLA / Metrik Target | Status |
| :--- | :--- | :--- | :--- |
| Orkestrasi Kontainer | Kubernetes Deployment dengan HPA auto-scaling | 99.95% Ketersediaan | 🐳 Siap Pakai |
| Monitoring & Metrik | Prometheus scraping & Grafana Dashboard export | Latensi p99 < 50ms | 📊 Aktif |
| Self-Healing | Liveness & Readiness probes otomatis | Auto restart < 5 detik | ⚡ Stabil |`;
      }

      if (isCli) {
        return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Kemampuan CLI & Fitur Terminal

| Fitur | Syntax / Flag | Deskripsi Fungsional | Status |
| :--- | :--- | :--- | :--- |
| **UNIX Piping** | \`cat input | tool\` | Mendukung streaming input via STDIN | ⚡ Aktif |
| **Silent Execution** | \`-q, --quiet\` | Menekan seluruh output non-error untuk skrip cron | 🤫 Siap |
| **JSON Output** | \`--json\` | Menghasilkan struktur output terurai untuk jq | 📄 Aktif |`;
      }

      if (isApi) {
        return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Karakteristik Arsitektur API

| Karakteristik | Spesifikasi | Keterangan | Status |
| :--- | :--- | :--- | :--- |
| **Protokol** | REST over HTTPS & HTTP/2 | Komunikasi asinkron efisien | ⚡ Aktif |
| **Validasi DTO** | Schema validation runtime | Penolakan otomatis pada invalid payload | 🔒 Ketat |
| **Rate Limiting** | Sliding-window algorithm | Mencegah lonjakan beban & serangan DoS | 🛡️ Stabil |`;
      }

      // Default & Developer-Centric / Showcase (ID)
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Fitur Utama

| Fitur | Kategori | Deskripsi Teknis | Status |
| :--- | :--- | :--- | :--- |
| **High-Throughput Ingestion** | Core Engine | Mampu menangani beban komputasi tinggi secara asinkron | ⚡ Aktif |
| **Type-Safe Architecture** | Code Quality | Validasi skema ketat dengan penanganan error terpusat | 🔒 Aman |
| **Modular Extensibility** | DX | Arsitektur plugin dan event hooks yang mudah diperluas | 🚀 Siap |`;
    }

    // Default: English ('en')
    if (isProduct) {
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Features & Business Benefits

| Problem Addressed | Solution Provided | Tangible Team Impact | Status |
| :--- | :--- | :--- | :--- |
| Manual data processing causes delays | Automated synchronization engine | Saves 10+ hours per week | ⚡ Active |
| Credential leak and compliance risks | Industry-standard auto-encryption | Guarantees compliance and peace of mind | 🔒 Secure |
| Legacy system integration friction | Plug-and-play modular APIs | Accelerates feature shipping | 🚀 Ready |`;
    }

    if (isSecurity) {
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Security Features & Risk Mitigation

| Security Vector | Technical Mitigation Control | Compliance Standard | Status |
| :--- | :--- | :--- | :--- |
| Authentication & Session | Asymmetric RS256 JWT with auto key-rotation | OAuth 2.0 / NIST SP 800-63 | 🔒 Verified |
| Data Protection | AES-256-GCM encryption at-rest & in-transit | SOC 2 / GDPR | 🛡️ Active |
| Package Integrity | Digital signature verification & automated SBOM | OpenSSF Level 3 | ✅ Compliant |`;
    }

    if (isDevOps) {
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Infrastructure & Reliability

| Operational Component | Implementation Mechanism | Target SLA / Metric | Status |
| :--- | :--- | :--- | :--- |
| Container Orchestration | Kubernetes Deployment with HPA auto-scaling | 99.95% Availability | 🐳 Ready |
| Metrics & Observability | Prometheus scraping & Grafana dashboard export | Latency p99 < 50ms | 📊 Active |
| Self-Healing | Automated liveness & readiness health probes | Auto restart < 5s | ⚡ Stable |`;
    }

    if (isCli) {
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ CLI Capabilities & Terminal Features

| Feature | Syntax / Flag | Functional Description | Status |
| :--- | :--- | :--- | :--- |
| **UNIX Piping** | \`cat input | tool\` | Supports streaming input via STDIN | ⚡ Active |
| **Silent Execution** | \`-q, --quiet\` | Suppresses non-error output for cron automation | 🤫 Ready |
| **JSON Output** | \`--json\` | Generates machine-readable output for jq parsing | 📄 Active |`;
    }

    if (isApi) {
      return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ API Architectural Characteristics

| Characteristic | Specification | Notes | Status |
| :--- | :--- | :--- | :--- |
| **Protocol** | REST over HTTPS & HTTP/2 | Efficient asynchronous communications | ⚡ Active |
| **DTO Validation** | Schema validation runtime | Automated rejection of invalid payloads | 🔒 Strict |
| **Rate Limiting** | Sliding-window algorithm | Prevents traffic spikes & DoS attacks | 🛡️ Stable |`;
    }

    // Default & Developer-Centric / Showcase (EN)
    return `<span id="key-features"></span>\n<span id="fitur-utama"></span>\n## ✨ Key Features

| Feature | Category | Technical Description | Status |
| :--- | :--- | :--- | :--- |
| **High-Throughput Ingestion** | Core Engine | Capable of handling high-load async workloads | ⚡ Active |
| **Type-Safe Architecture** | Code Quality | Strict schema validation with centralized error handling | 🔒 Secure |
| **Modular Extensibility** | DX | Clean plugin architecture & event hooks | 🚀 Ready |`;
  }

  /**
   * Menghasilkan seksi khusus CLI Tool (flags table, UNIX piping, exit codes)
   */
  renderCliUsage(toolName = 'app', lang = this.language) {
    const isId = lang === 'id';
    if (isId) {
      return `## 💻 Penggunaan Baris Perintah (CLI Flags)

\`\`\`bash
${toolName.toLowerCase()} [flags] <command> [args...]
\`\`\`

### Tabel Flags Lengkap:
| Short | Long Flag | Default | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- |
| \`-h\` | \`--help\` | - | Menampilkan panduan penggunaan perintah |
| \`-v\` | \`--verbose\` | \`false\` | Menampilkan log debug mendalam ke STDOUT |
| \`-o\` | \`--output\` | \`-\` | Menentukan file target keluaran |
| \`-q\` | \`--quiet\` | \`false\` | Mode senyap (hanya mencetak error ke STDERR) |

### Contoh Piping Terminal:
\`\`\`bash
cat data.json | ${toolName.toLowerCase()} --output result.json
\`\`\`

### Daftar Exit Codes:
- \`0\`: Eksekusi sukses (*Success*)
- \`1\`: Terjadi error umum (*General Error*)
- \`2\`: Kesalahan sintaks argumen (*Command-Line Misuse*)`;
    }

    return `## 💻 Command-Line Interface (CLI Flags)

\`\`\`bash
${toolName.toLowerCase()} [flags] <command> [args...]
\`\`\`

### Available Flags:
| Short | Long Flag | Default | Functional Description |
| :--- | :--- | :--- | :--- |
| \`-h\` | \`--help\` | - | Display command usage guide |
| \`-v\` | \`--verbose\` | \`false\` | Output detailed debug logs to STDOUT |
| \`-o\` | \`--output\` | \`-\` | Specify output file path |
| \`-q\` | \`--quiet\` | \`false\` | Silent mode (errors only to STDERR) |

### Terminal Piping Example:
\`\`\`bash
cat data.json | ${toolName.toLowerCase()} --output result.json
\`\`\`

### Exit Codes:
- \`0\`: Execution successful (*Success*)
- \`1\`: General runtime error (*General Error*)
- \`2\`: Invalid syntax or arguments (*Command-Line Misuse*)`;
  }

  /**
   * Menghasilkan blok Sitasi BibTeX resmi untuk mode Academic
   */
  renderAcademicCitation(meta = {}, lang = this.language) {
    const key = (meta.name || 'project').toLowerCase().replace(/[^a-z0-9]/g, '');
    const year = new Date().getFullYear();
    const isId = lang === 'id';

    const header = isId ? '## 📚 Sitasi Akademik (Citation)' : '## 📚 Academic Citation';
    const note = isId
      ? 'Jika Anda menggunakan proyek atau algoritma ini dalam penelitian ilmiah Anda, silakan sitasi sebagai berikut:'
      : 'If you use this project or its algorithms in scientific research, please cite it as:';

    return `${header}

${note}

\`\`\`bibtex
@software{${key}${year},
  author = {Core Contributors},
  title = {${meta.name || 'Software Project'}: Implementation and Benchmarks},
  year = {${year}},
  url = {${meta.repository_url || 'https://github.com/example/repo'}}
}
\`\`\``;
  }
}
