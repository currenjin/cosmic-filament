import type { Concept, Thought, ThoughtDatabase, ThoughtLink } from './types'

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(object: JsonObject, field: string, location: string): string {
  const value = object[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${location}.${field} must be a non-empty string`)
  }
  return value
}

function optionalString(object: JsonObject, field: string): string | undefined {
  const value = object[field]
  return typeof value === 'string' ? value : undefined
}

function requireArrayEnvelope(value: unknown, field: string): unknown[] {
  if (!isObject(value) || !Array.isArray(value[field])) {
    throw new Error(`${field} must be an array`)
  }
  return value[field] as unknown[]
}

function parseThought(value: unknown, index: number): Thought {
  if (!isObject(value)) throw new Error(`thoughts[${index}] must be an object`)
  return {
    id: requiredString(value, 'id', `thoughts[${index}]`),
    title: requiredString(value, 'title', `thoughts[${index}]`),
    summary: optionalString(value, 'summary'),
    created: optionalString(value, 'created'),
    source: optionalString(value, 'source'),
    status: optionalString(value, 'status'),
    thought_form: optionalString(value, 'thought_form'),
    card_path: optionalString(value, 'card_path'),
  }
}

function parseConcept(value: unknown, index: number): Concept {
  if (!isObject(value)) throw new Error(`concepts[${index}] must be an object`)
  const aliases = Array.isArray(value.aliases)
    ? value.aliases.filter((alias): alias is string => typeof alias === 'string')
    : undefined
  return {
    id: requiredString(value, 'id', `concepts[${index}]`),
    name: requiredString(value, 'name', `concepts[${index}]`),
    status: optionalString(value, 'status'),
    aliases,
    mention_count: typeof value.mention_count === 'number' ? value.mention_count : undefined,
  }
}

function parseEdge(value: unknown, index: number): ThoughtLink {
  if (!isObject(value)) throw new Error(`edges[${index}] must be an object`)
  return {
    id: requiredString(value, 'id', `edges[${index}]`),
    source: requiredString(value, 'source', `edges[${index}]`),
    target: requiredString(value, 'target', `edges[${index}]`),
    type: requiredString(value, 'type', `edges[${index}]`),
    confidence: optionalString(value, 'confidence'),
    basis: optionalString(value, 'basis'),
    reason: optionalString(value, 'reason'),
    created: optionalString(value, 'created'),
  }
}

export function parseThoughtDatabase(
  thoughtsEnvelope: unknown,
  conceptsEnvelope: unknown,
  linksEnvelope: unknown,
): ThoughtDatabase {
  return {
    thoughts: requireArrayEnvelope(thoughtsEnvelope, 'thoughts').map(parseThought),
    concepts: requireArrayEnvelope(conceptsEnvelope, 'concepts').map(parseConcept),
    edges: requireArrayEnvelope(linksEnvelope, 'edges').map(parseEdge),
  }
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store', signal })
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`)
  return response.json()
}

export async function loadThoughtDatabase(baseUrl: string, signal?: AbortSignal): Promise<ThoughtDatabase> {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const [thoughts, concepts, links] = await Promise.all([
    fetchJson(`${normalizedBase}thoughts.json`, signal),
    fetchJson(`${normalizedBase}concepts.json`, signal),
    fetchJson(`${normalizedBase}links.json`, signal),
  ])
  return parseThoughtDatabase(thoughts, concepts, links)
}
