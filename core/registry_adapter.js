/**
 * RegistryAdapter menjamin "Cross-Registry Parity" (FR-8.1):
 * Mengadaptasi sintaks GitHub Flavored Markdown (GFM) agar tetap tampil sempurna
 * tanpa broken tags saat di-publish ke npmjs.com, pypi.org, crates.io, GitLab, atau Bitbucket.
 */
export class RegistryAdapter {
  constructor(targetRegistry = 'github') {
    this.targetRegistry = (targetRegistry || 'github').toLowerCase();
  }

  /**
   * Mengonversi konten markdown dengan teknik Graceful Degradation
   */
  adapt(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';
    if (this.targetRegistry === 'github') {
      return markdown; // GitHub mendukung semua fitur GFM modern (alert, picture, mermaid)
    }

    let result = markdown;

    // 1. Degradasi GitHub Alerts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])
    // Menjadi sintaks CommonMark murni yang didukung semua parser (PyPI/npm/GitLab)
    result = result.replace(/^>\s*\[!NOTE\]\s*(.*)$/gm, '> **Note:** $1');
    result = result.replace(/^>\s*\[!TIP\]\s*(.*)$/gm, '> **Tip:** $1');
    result = result.replace(/^>\s*\[!IMPORTANT\]\s*(.*)$/gm, '> **Important:** $1');
    result = result.replace(/^>\s*\[!WARNING\]\s*(.*)$/gm, '> **Warning:** $1');
    result = result.replace(/^>\s*\[!CAUTION\]\s*(.*)$/gm, '> **Caution:** $1');

    // 2. Degradasi tag <picture> ganda ke gambar tunggal fallback
    // Banyak parser PyPI / crates.io tidak merender <picture> HTML5
    result = result.replace(
      /<picture>[\s\S]*?<img\s+([^>]*?)src="([^"]+)"([^>]*)>[\s\S]*?<\/picture>/gi,
      '![]($2)'
    );

    // 3. Fallback jika registry adalah PyPI (docutils / ReStructuredText converter kadang sensitif terhadap align="center")
    if (this.targetRegistry === 'pypi') {
      // Ganti <div align="center"> dengan teks Markdown biasa
      result = result.replace(/<div align="center">([\s\S]*?)<\/div>/gi, '$1');
    }

    return result;
  }
}
