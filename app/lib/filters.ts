// Filter taxonomy adapted from the Figma filter panel (node 73:8959).
// Groups with `children` are pure "select all" headers — their own value
// is never a real filter value, only their leaves are.

export type FilterOption = {
  value: string;
  label: string;
  children?: FilterOption[];
};

export type FilterGroup = {
  key: string;
  label: string;
  options: FilterOption[];
};

function leaf(value: string): FilterOption {
  return { value, label: value };
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: "state",
    label: "State",
    options: [
      {
        value: "__state_open",
        label: "Open",
        children: [
          leaf("Open"),
          leaf("Reopened"),
          leaf("False Positive"),
          leaf("Risk Acceptance"),
        ],
      },
      leaf("Closed"),
    ],
  },
  {
    key: "severity",
    label: "Severity",
    options: ["Critical", "High", "Moderate", "Low", "Informational"].map(leaf),
  },
  {
    key: "slaStatus",
    label: "SLA Status",
    options: [
      {
        value: "__sla_open",
        label: "Open",
        children: [
          leaf("In SLA"),
          leaf("Near SLA"),
          leaf("Missed SLA"),
          leaf("Exception"),
        ],
      },
      {
        value: "__sla_closed",
        label: "Closed",
        children: [leaf("Remediated"), leaf("Exception")],
      },
    ],
  },
  {
    key: "exceptionStatus",
    label: "Exception Status",
    options: ["Active", "Archived", "Expired", "Pending", "Denied"].map(leaf),
  },
];

/** Every leaf under `options`, deduplicated by value (some leaves, like
 * "Exception" in SLA Status, are reachable from more than one parent). */
export function flattenLeaves(options: FilterOption[]): FilterOption[] {
  const seen = new Map<string, FilterOption>();
  function walk(opts: FilterOption[]) {
    for (const opt of opts) {
      if (opt.children) walk(opt.children);
      else if (!seen.has(opt.value)) seen.set(opt.value, opt);
    }
  }
  walk(options);
  return [...seen.values()];
}

export type FilterState = Record<string, Set<string>>;

export function createEmptyFilterState(): FilterState {
  return Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, new Set<string>()]));
}

export function cloneFilterState(state: FilterState): FilterState {
  return Object.fromEntries(
    Object.entries(state).map(([key, values]) => [key, new Set(values)]),
  );
}

export function countSelected(state: FilterState): number {
  return Object.values(state).reduce((sum, values) => sum + values.size, 0);
}

export type GroupSelectionState = "checked" | "indeterminate" | "unchecked";

export function getOptionState(
  option: FilterOption,
  selected: Set<string>,
): GroupSelectionState {
  if (!option.children) {
    return selected.has(option.value) ? "checked" : "unchecked";
  }
  const leaves = flattenLeaves(option.children);
  const selectedCount = leaves.filter((l) => selected.has(l.value)).length;
  if (selectedCount === 0) return "unchecked";
  if (selectedCount === leaves.length) return "checked";
  return "indeterminate";
}

export type ActiveChip = { groupKey: string; value: string; label: string };

export function getActiveChips(state: FilterState): ActiveChip[] {
  const chips: ActiveChip[] = [];
  for (const group of FILTER_GROUPS) {
    const selected = state[group.key];
    if (!selected) continue;
    for (const leaf of flattenLeaves(group.options)) {
      if (selected.has(leaf.value)) {
        chips.push({ groupKey: group.key, value: leaf.value, label: leaf.label });
      }
    }
  }
  return chips;
}

/**
 * Matches an entity's field values against a FilterState. A group is only
 * enforced when the entity actually provides a value for it — pass just
 * the keys that make sense for the entity you're filtering (e.g. Services
 * rows only pass `severity`), and the rest are treated as not applicable
 * rather than "never matches".
 */
export function matchesFilters(
  fieldValues: Partial<Record<string, string>>,
  state: FilterState,
): boolean {
  for (const group of FILTER_GROUPS) {
    if (!(group.key in fieldValues)) continue;
    const selected = state[group.key];
    if (!selected || selected.size === 0) continue;
    const value = fieldValues[group.key];
    if (value === undefined || !selected.has(value)) return false;
  }
  return true;
}
