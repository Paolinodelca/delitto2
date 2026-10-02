# IMAGO Visual Design System

Status: **Product Authority — Candidate-facing visual design**

Future Candidate-facing rendering and UX tasks MUST read this document before implementation. Authority order remains `docs/20-product/` → `docs/00-continuity/` → current task → implementation.

## 1. Purpose
IMAGO uses one reusable visual grammar. Visual semantics express **information state, not judgement of the Candidate**. Unknown/not observed is never an error state. Color is never the sole semantic carrier.

## 2. Design principles
- Semantic meaning precedes concrete appearance.
- Supported means documented/authorised support, not “good Candidate”.
- Clarification means unresolved/useful to clarify, not weakness.
- Build means confirmed bounded absence only.
- Informational means contextual information that is neither support nor absence.
- Candidate-facing text remains localized.
- Prefer progressive disclosure and one clear hierarchy over repeated boxes.

## 3. Semantic color model
Canonical tokens live in the single `:root` token block in `src/app/renderPrivateBetaUiJourneyHtml.js`. Use semantic names, never page-local green/orange/blue names.

Core groups: page/surfaces; primary/secondary/muted/inverse text; default/strong/subtle borders; supported; clarify; build; informational; navigation active/inactive; focus; hover; disabled. Concrete palette values may change without changing component semantics.

SUPPORTED = authorised support. CLARIFICATION = unresolved. BUILD = confirmed bounded absence. INFORMATIONAL = contextual only. NEUTRAL = ordinary content. ACTIVE/INACTIVE = selection state. GROUNDING = secondary provenance. DISABLED = unavailable action. FOCUS = keyboard focus.

## 4. Surface hierarchy
- **Surface 0** — page/background: `--imago-color-page`.
- **Surface 1** — primary page section: `--imago-color-surface-primary`.
- **Surface 2** — card/interactive unit: primary or secondary surface with canonical border/radius.
- **Surface 3** — expanded/nested detail: `--imago-color-surface-nested`; visibly belongs to parent.
- **Semantic surface** — supported/clarify/build/info variants.

Avoid unrelated box-inside-box styling. Nested detail normally uses surface/border hierarchy, not extra heavy shadow.

## 5. Typography hierarchy
Canonical stack: `Arial, sans-serif`; no additional font dependency.

PAGE_TITLE > SECTION_TITLE > CARD_TITLE > BODY > METADATA/HELPER. Tokens define page, section, card, body and metadata sizes plus regular/medium/bold weights and body line-height. Same semantic level must render consistently; do not invent component-local font sizes/weights when a token exists.

## 6. Spacing scale
Use `--imago-space-1/2/3/4/5/6/8` for inline gaps, row/card padding, section rhythm and nested spacing. Do not introduce arbitrary primary spacing values when the scale covers the need.

## 7. Radius scale
- small: compact controls/tags;
- medium: rows, inputs, expandable items;
- large: cards/major surfaces;
- pill: status chips/navigation pills only.

Use `--imago-radius-small/medium/large/pill`.

## 8. Border system
Widths: subtle/default/emphasis. Colors: default/strong/subtle plus semantic supported/clarify/build/info. Selected items combine surface + text + border/indicator + weight; state is never border color alone.

## 9. Elevation
`none`, `subtle`, `raised`. Use sparingly. Primary cards may use subtle elevation; nested information normally does not stack shadows.

## 10. Navigation states
NAV_DEFAULT, NAV_HOVER, NAV_ACTIVE, NAV_FOCUS, NAV_DISABLED. Active direction must be immediately visible through a combination of surface, text, border/indicator and weight. PD-077 Career Direction navigation is the reference pattern.

## 11. Interaction states
Primary/secondary/tertiary actions, links, expandable rows, menu options, tabs, inputs and textareas share default/hover/focus/active/disabled semantics. Focus must remain keyboard-visible. Hover is never required to understand state.

## 12. Status semantics
Supported: check/label + supported semantic surface/border. Clarification: question/info label + clarify surface. Confirmed build: bounded build indicator only where authority exists. Informational: neutral/info treatment. No star ratings, performance gauges or aggregate red/green verdicts.

## 13. Expandable / nested pattern
Collapsed row = compact primary information. Expanded row = visibly nested surface with spacing/background/border change and secondary grounding. Expansion must not be communicated only by a chevron/triangle. Requirement Map rows are the reference implementation.

## 14. Layout rules
Use canonical page max width, readable text width and grid gap tokens. Candidate pages should not invent independent main-column widths. Existing breakpoint behavior may remain until touched; new layouts should reuse established responsive constraints.

## 15. Accessibility
Maintain readable sizes, visible keyboard focus, sufficient contrast, and semantic labels/icons/text in addition to color. Unknown must never inherit build/error styling. Critical meaning cannot depend on hover or green/red distinction alone.

## 16. Token naming convention
Name tokens by semantic role: `--imago-color-supported-border`, `--imago-color-surface-nested`, `--imago-color-text-secondary`. Do not name tokens after concrete appearance such as `--light-green-box`. Compatibility aliases may exist while older surfaces migrate.

## 17. Raw-value prohibition
Candidate-facing components SHOULD NOT introduce new raw semantic colors, font sizes/weights, radii, primary spacing, border styling or elevation when a canonical token exists. Any exception must be intentional and documented.

## 18. Visual primitive inventory
PageHeader; SectionHeader; DirectionNavigation; Card; SemanticCard; RequirementRow; ExpandableRow; NestedDetail; StateIndicator; GroundingDisclosure; PrimaryButton; SecondaryButton; InlineAction; FormField; HelperText. This is a visual contract, not a requirement to introduce a component framework.

## 19. Migration strategy
1. This document is Product Authority.
2. The PD-077 token layer is consolidated rather than replaced.
3. PD-082 Career Direction detail is the first reference surface.
4. Future Candidate-facing UI must use this system.
5. Older Beta surfaces migrate when touched or where inconsistency is severe. No broad rewrite is implied.

## 20. Builder implementation checklist
Before implementing Candidate-facing UI:

- [ ] Read `IMAGO_VISUAL_DESIGN_SYSTEM.md`
- [ ] Use existing semantic tokens
- [ ] No new raw semantic colors
- [ ] No arbitrary typography values
- [ ] No arbitrary radii
- [ ] No duplicate visual state meanings
- [ ] Unknown != confirmed gap visually
- [ ] Color not sole semantic carrier
- [ ] Nested surfaces follow canonical hierarchy
- [ ] Active/selected state clearly visible
- [ ] All Candidate-facing text localized
- [ ] Existing semantic authority preserved
