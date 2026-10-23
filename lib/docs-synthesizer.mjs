/**
 * Antigravity Memory Bank — Living Documentation Synthesizer Library Wrapper (`lib/docs-synthesizer.mjs`)
 *
 * Re-exports the self-contained synthesizer and validator from `scripts/sync-living-docs.mjs`
 * so `lib/repo-organizer.mjs`, `bin/cli.mjs`, and standalone downstream `scripts/sync-living-docs.mjs`
 * share a single source of truth.
 */

export {
  CANONICAL_LIVING_DOCS,
  LEGACY_DOC_MAPPING,
  rewriteConsolidatedDocLinks,
  synthesizeLivingDocs,
  validateLivingDocsHierarchy
} from '../scripts/sync-living-docs.mjs';
