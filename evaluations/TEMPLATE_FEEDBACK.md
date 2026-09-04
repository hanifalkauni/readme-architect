# [Evaluation Title]: README-Architect Tuning & Preset RFC

> **Proposal Title**: [e.g., Support Elixir Mix / Turborepo Monorepo Manifest Detection]  
> **Target Case Study**: [e.g., Repository Type, Language, or Package Ecosystem]  
> **Ecosystem / Language**: [e.g., Rust (Cargo), Elixir (Mix), Go (Modules), Python (Poetry/PDM)]  
> **Author / Contributor**: [@username]  
> **Date**: YYYY-MM-DD  
> **Status**: Draft / In-Review / Ready for Implementation / Implemented  

---

## 1. Executive Summary

Provide a concise overview of the evaluation:
- What type of project or repository structure was analyzed?
- What package manager, framework, or cloud toolings are used?
- What was missed, misclassified, or could be aesthetically/structurally improved in the generated README?

---

## 2. Real-World Codebase Characteristics vs Scanner Challenges

### A. Manifest or Configuration Sample

```json
// Paste snippet of the project manifest (e.g. package.json, Cargo.toml, pyproject.toml, etc.)
```

### B. Directory Structure (Ground Truth)

```
my-project/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared-ui/
├── turbo.json
└── package.json
```

### C. Identified Gaps

1. **Gap 1**: [e.g., Manifest sniffer failed to recognize secondary framework / sub-packages]
2. **Gap 2**: [e.g., Port resolution defaulted to 3000 when environment variables specified 8080]
3. **Gap 3**: [e.g., Generated command block hallucinated `npm run build` when only `yarn build` is valid]

---

## 3. Proposed Technical Tuning Recommendations

Provide concrete suggestions on where adjustments are needed:

### 🔧 Recommendation 1: Scanner Triggers (`core/scanner.js`)
* Add manifest detection triggers or dependency regex patterns:

```javascript
// Example new sniffer trigger
if (hasFile('mix.exs')) {
  techStack.push({ name: 'Elixir', category: 'language' });
}
```

### 🔧 Recommendation 2: Beautifier or Compliance Rules (`core/beautifier.js` / `core/compliance.js`)
* Enhancements for badge templates, directory tree depth, or SPDX validation.

---

## 4. Target Ideal Output README Layout

Provide a sample of the expected README section or badge header:

```markdown
<div align="center">
  <h1>My Awesome Monorepo</h1>
  <p>Production-grade micro-frontends and services.</p>
</div>
```

---

## 5. Maintainer Implementation Checklist

| No | Target File | Task / Enhancement | Status |
|---|---|---|---|
| 1 | `core/scanner.js` | Add manifest trigger and dependency parsing | [ ] Pending / [x] Done |
| 2 | `core/beautifier.js` | Update badge palette or directory tree formatting | [ ] Pending / [x] Done |
| 3 | `tests/fixtures/sample_<name>/` | Add representative mock project fixture | [ ] Pending / [x] Done |
| 4 | `tests/test_all.js` | Add automated regression test assertion | [ ] Pending / [x] Done |
