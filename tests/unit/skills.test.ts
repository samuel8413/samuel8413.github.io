import { describe, expect, it } from 'vitest';
import { groupSkills, UNMAPPED_GROUP_NAME } from '../../src/domain/skills.ts';

const taxonomy = {
  groups: [
    { name: 'Frontend', skills: ['React.js', 'Next.js'] },
    { name: 'Cloud', skills: ['Amazon Web Services (AWS)', 'Terraform'] },
  ],
  labels: { 'Amazon Web Services (AWS)': 'AWS', 'React.js': 'React' },
};

describe('groupSkills', () => {
  it('follows taxonomy order and applies display labels', () => {
    const { groups } = groupSkills(
      ['Terraform', 'React.js', 'Amazon Web Services (AWS)'],
      taxonomy,
    );
    expect(groups).toEqual([
      { name: 'Frontend', skills: [{ name: 'React.js', label: 'React' }] },
      {
        name: 'Cloud',
        skills: [
          { name: 'Amazon Web Services (AWS)', label: 'AWS' },
          { name: 'Terraform', label: 'Terraform' },
        ],
      },
    ]);
  });

  it('reports unmapped skills and still renders them', () => {
    const { groups, unmapped } = groupSkills(['React.js', 'Rust'], taxonomy);
    expect(unmapped).toEqual(['Rust']);
    expect(groups.at(-1)).toEqual({
      name: UNMAPPED_GROUP_NAME,
      skills: [{ name: 'Rust', label: 'Rust' }],
    });
  });

  it('reports stale taxonomy entries and drops empty groups', () => {
    const { groups, stale } = groupSkills(['React.js'], taxonomy);
    expect(stale).toEqual(['Next.js', 'Amazon Web Services (AWS)', 'Terraform']);
    expect(groups.map((g) => g.name)).toEqual(['Frontend']);
  });
});
