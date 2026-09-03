/**
 * DeltaMerger memungkinkan pembaruan README secara cerdas tanpa menimpa catatan
 * manual pengembang (Non-destructive update using HTML comments markers).
 */
export class DeltaMerger {
  /**
   * Membungkus konten seksi yang dikelola otomatis oleh agen dengan marker resmi
   */
  wrapManagedSection(sectionId, content) {
    return `<!-- readme-architect:start(${sectionId}) -->\n${content.trim()}\n<!-- readme-architect:end(${sectionId}) -->`;
  }

  /**
   * Menggabungkan konten baru ke dalam file README lama yang sudah ada.
   * Konten di dalam <!-- user-content --> atau di luar seksi yang dikelola dipertahankan utuh.
   */
  merge(existingMarkdown, newManagedSections = {}) {
    if (!existingMarkdown || typeof existingMarkdown !== 'string' || !existingMarkdown.trim()) {
      // Jika file lama kosong, gabungkan seluruh seksi baru
      return Object.entries(newManagedSections)
        .map(([id, content]) => this.wrapManagedSection(id, content))
        .join('\n\n---\n\n');
    }

    let merged = existingMarkdown;
    let anyReplaced = false;

    // Cari dan ganti setiap blok yang dikelola oleh readme-architect
    for (const [sectionId, newContent] of Object.entries(newManagedSections)) {
      const regex = new RegExp(
        `<!-- readme-architect:start\\(${sectionId}\\) -->[\\s\\S]*?<!-- readme-architect:end\\(${sectionId}\\) -->`,
        'g'
      );

      if (regex.test(merged)) {
        merged = merged.replace(regex, this.wrapManagedSection(sectionId, newContent));
        anyReplaced = true;
      }
    }

    // Jika tidak ada marker sebelumnya di file lama (brownfield tanpa marker),
    // kita preserve user content dengan menyertakannya di blok khusus
    if (!anyReplaced && !merged.includes('readme-architect:start')) {
      const wrappedUserContent = `<!-- user-content:start(legacy-custom-notes) -->\n${merged.trim()}\n<!-- user-content:end(legacy-custom-notes) -->`;
      const generatedSections = Object.entries(newManagedSections)
        .map(([id, content]) => this.wrapManagedSection(id, content))
        .join('\n\n---\n\n');

      return `${generatedSections}\n\n---\n\n## 📝 Catatan Kustom Pengembang\n${wrappedUserContent}`;
    }

    return merged;
  }
}
