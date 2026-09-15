import type { PartialDate } from './dates.ts';

/**
 * Canonical domain model consumed by the UI.
 *
 * Everything here is already validated, trimmed, sorted and shaped for
 * presentation. Components must never reach back into the raw JSON.
 */

export interface DateRange {
  readonly start: PartialDate;
  /** `null` means ongoing. */
  readonly end: PartialDate | null;
}

export interface Position {
  /** Stable id derived from company + title + start, usable as a DOM id. */
  readonly id: string;
  readonly company: string;
  readonly title: string;
  readonly location?: string;
  readonly range: DateRange;
  /** Short narrative paragraph, when the source had one. */
  readonly summary?: string;
  /** Outcome-oriented bullet points. */
  readonly highlights: readonly string[];
  /** Scope/duties, shown with less emphasis than highlights. */
  readonly responsibilities: readonly string[];
}

/** Consecutive positions at the same company, newest first. */
export interface CompanyTenure {
  readonly id: string;
  readonly company: string;
  readonly range: DateRange;
  readonly positions: readonly Position[];
}

export interface Experience {
  /** The career the profile is positioning for, newest first. */
  readonly primary: readonly CompanyTenure[];
  /** Roles before the career pivot. Still part of the story, shown collapsed. */
  readonly earlier: readonly CompanyTenure[];
}

export interface Education {
  readonly school: string;
  readonly degree: string;
  readonly range: DateRange;
}

export interface Skill {
  /** The name as it appears in the source (and on LinkedIn). */
  readonly name: string;
  /** What we display; may be a shorter editorial label. */
  readonly label: string;
}

export interface SkillGroup {
  readonly name: string;
  readonly skills: readonly Skill[];
}

export interface Language {
  readonly name: string;
  readonly proficiency: string;
}

export interface Certification {
  readonly name: string;
  readonly authority: string;
  readonly issuedOn: PartialDate;
  readonly url?: string;
  readonly licenseNumber?: string;
}

export interface Honor {
  readonly title: string;
  readonly description?: string;
  readonly issuedOn: PartialDate;
}

export interface Project {
  readonly title: string;
  readonly range: DateRange;
  readonly description: string;
  readonly url?: string;
}

export interface Publication {
  readonly name: string;
  readonly publisher: string;
  readonly publishedOn: PartialDate;
  readonly url?: string;
  readonly description?: string;
}

export interface Highlight {
  readonly value: string;
  readonly label: string;
  readonly detail?: string;
}

export interface Contact {
  /** Editorial sentence introducing the channels. */
  readonly lead?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly linkedin?: string;
  readonly github?: string;
  readonly website?: string;
}

export interface Identity {
  readonly name: string;
  readonly headline: string;
  readonly location?: string;
  /** The summary split into paragraphs; the first doubles as the elevator pitch. */
  readonly summaryParagraphs: readonly string[];
}

export interface Profile {
  readonly identity: Identity;
  readonly contact: Contact;
  readonly highlights: readonly Highlight[];
  readonly experience: Experience;
  readonly education: readonly Education[];
  readonly skillGroups: readonly SkillGroup[];
  readonly languages: readonly Language[];
  readonly certifications: readonly Certification[];
  readonly honors: readonly Honor[];
  readonly projects: readonly Project[];
  readonly publications: readonly Publication[];
}
