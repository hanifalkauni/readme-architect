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
 */
export class StyleEngine {
  constructor(style = 'showcase') {
    this.style = this.validateStyle(style);
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
   * Menghasilkan teks Overview yang disesuaikan dengan persona gaya
   */
  renderOverview(meta, ecosystem) {
    const name = meta.name || 'Application';
    const lang = ecosystem.primary_language || 'TypeScript';

    switch (this.style) {
      case 'developer-centric':
        return `## 🌟 Gambaran Umum
**${name}** dibangun dengan fondasi arsitektur Clean Architecture berbasis **${lang}**, mengisolasi business logic dari interface adapter dan transport layer. Mengedepankan *Developer Experience (DX)* yang optimal dengan type-safety ketat, dependency injection modular, serta performa eksekusi berlatensi rendah.`;

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

  /**
   * Menghasilkan tabel fitur yang cocok dengan gaya yang dipilih
   */
  renderFeatures(ecosystem) {
    const isProduct = this.style === 'product-oriented';
    const isSecurity = this.style === 'security-first';
    const isDevOps = this.style === 'devops-infra';
    const isCli = this.style === 'cli-tool';
    const isApi = this.style === 'api-first';

    if (isProduct) {
      return `## ✨ Fitur & Manfaat Produk

| Masalah yang Dihadapi | Solusi yang Diberikan | Manfaat Nyata bagi Tim | Status |
| :--- | :--- | :--- | :--- |
| Proses data manual memakan waktu lama | Mesin otomatisasi sinkronisasi data | Menghemat 10+ jam kerja setiap pekan | ⚡ Aktif |
| Risiko kebocoran kredensial pelanggan | Enkripsi otomatis standar industri | Menjamin rasa aman dan kepatuhan data | 🔒 Aman |
| Kesulitan integrasi sistem lama | API modular siap pakai | Mempercepat peluncuran fitur baru | 🚀 Siap |`;
    }

    if (isSecurity) {
      return `## ✨ Fitur Keamanan & Mitigasi Risiko

| Vektor Keamanan | Kontrol Mitigasi Teknis | Standar Kepatuhan | Status |
| :--- | :--- | :--- | :--- |
| Autentikasi & Sesi | Asymmetric RS256 JWT dengan auto key-rotation | OAuth 2.0 / NIST SP 800-63 | 🔒 Terverifikasi |
| Keamanan Data | AES-256-GCM encryption at-rest & in-transit | SOC 2 / GDPR | 🛡️ Aktif |
| Integritas Paket | Verifikasi tanda tangan digital & SBOM otomatis | OpenSSF Level 3 | ✅ Patuh |`;
    }

    if (isDevOps) {
      return `## ✨ Fitur Infrastruktur & Keandalan

| Komponen Operasional | Mekanisme Implementasi | SLA / Metrik Target | Status |
| :--- | :--- | :--- | :--- |
| Orkestrasi Kontainer | Kubernetes Deployment dengan HPA auto-scaling | 99.95% Ketersediaan | 🐳 Siap Pakai |
| Monitoring & Metrik | Prometheus scraping & Grafana Dashboard export | Latensi p99 < 50ms | 📊 Aktif |
| Self-Healing | Liveness & Readiness probes otomatis | Auto restart < 5 detik | ⚡ Stabil |`;
    }

    if (isCli) {
      return `## ✨ Kemampuan CLI & Fitur Terminal

| Fitur | Syntax / Flag | Deskripsi Fungsional | Status |
| :--- | :--- | :--- | :--- |
| **UNIX Piping** | \`cat input \| tool\` | Mendukung streaming input via STDIN | ⚡ Aktif |
| **Silent Execution** | \`-q, --quiet\` | Menekan seluruh output non-error untuk skrip cron | 🤫 Siap |
| **JSON Output** | \`--json\` | Menghasilkan struktur output terurai untuk jq | 📄 Aktif |`;
    }

    if (isApi) {
      return `## ✨ Karakteristik Arsitektur API

| Karakteristik | Spesifikasi | Keterangan | Status |
| :--- | :--- | :--- | :--- |
| **Protokol** | REST over HTTPS & HTTP/2 | Komunikasi asinkron efisien | ⚡ Aktif |
| **Validasi DTO** | Schema validation runtime | Penolakan otomatis pada invalid payload | 🔒 Ketat |
| **Rate Limiting** | Sliding-window algorithm | Mencegah lonjakan beban & serangan DoS | 🛡️ Stabil |`;
    }

    // Default & Developer-Centric / Showcase
    return `## ✨ Fitur Utama

| Fitur | Kategori | Deskripsi Teknis | Status |
| :--- | :--- | :--- | :--- |
| **High-Throughput Ingestion** | Core Engine | Mampu menangani beban komputasi tinggi secara asinkron | ⚡ Aktif |
| **Type-Safe Architecture** | Code Quality | Validasi skema ketat dengan penanganan error terpusat | 🔒 Aman |
| **Modular Extensibility** | DX | Arsitektur plugin dan event hooks yang mudah diperluas | 🚀 Siap |`;
  }

  /**
   * Menghasilkan seksi khusus CLI Tool (flags table, UNIX piping, exit codes)
   */
  renderCliUsage(toolName = 'app') {
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

  /**
   * Menghasilkan blok Sitasi BibTeX resmi untuk mode Academic
   */
  renderAcademicCitation(meta = {}) {
    const key = (meta.name || 'project').toLowerCase().replace(/[^a-z0-9]/g, '');
    const year = new Date().getFullYear();

    return `## 📚 Sitasi Akademik (Citation)

Jika Anda menggunakan proyek atau algoritma ini dalam penelitian ilmiah Anda, silakan sitasi sebagai berikut:

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
