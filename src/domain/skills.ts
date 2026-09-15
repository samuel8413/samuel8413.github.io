import type { SkillGroup } from './model.ts';
import type { SkillTaxonomy } from './schema/site-config.schema.ts';

export interface SkillGrouping {
  readonly groups: readonly SkillGroup[];
  /** Skills present in the profile but missing from the taxonomy. */
  readonly unmapped: readonly string[];
  /** Skills listed in the taxonomy but no longer in the profile. */
  readonly stale: readonly string[];
}

export const UNMAPPED_GROUP_NAME = 'Other';

/**
 * Projects the flat LinkedIn skill list onto the editorial taxonomy.
 *
 * Order inside a group follows the taxonomy (a deliberate ranking), not the
 * source. Unmapped skills are still rendered, in a trailing group, so a new
 * skill added on LinkedIn is never silently dropped; the content audit turns
 * that into a build-blocking error in strict mode.
 */
export function groupSkills(skillNames: readonly string[], taxonomy: SkillTaxonomy): SkillGrouping {
  const available = new Set(skillNames);
  const assigned = new Set<string>();
  const stale: string[] = [];

  const groups: SkillGroup[] = taxonomy.groups.flatMap((group) => {
    const skills = group.skills.flatMap((name) => {
      if (!available.has(name)) {
        stale.push(name);
        return [];
      }
      assigned.add(name);
      return [{ name, label: taxonomy.labels[name] ?? name }];
    });
    return skills.length > 0 ? [{ name: group.name, skills }] : [];
  });

  const unmapped = skillNames.filter((name) => !assigned.has(name));
  if (unmapped.length > 0) {
    groups.push({
      name: UNMAPPED_GROUP_NAME,
      skills: unmapped.map((name) => ({ name, label: taxonomy.labels[name] ?? name })),
    });
  }

  return { groups, unmapped, stale };
}
