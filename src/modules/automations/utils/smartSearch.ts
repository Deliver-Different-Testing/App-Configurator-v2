import type { AutomationRule, CustomerOption, SpeedOption } from '../types';

export interface SearchResult {
  automation: AutomationRule;
  matchReasons: string[];
}

const SYNONYM_MAP: Record<string, string[]> = {
  sms: ['text', 'message', 'txt'],
  send_sms: ['text', 'sms', 'message'],
  notification: ['notify', 'alert', 'email'],
  trigger_notification: ['notify', 'notification', 'alert', 'email'],
  pickup: ['collection', 'collect', 'pick up', 'child_1'],
  delivery: ['deliver', 'drop', 'child_3'],
  flight: ['transport', 'transit', 'child_2'],
  scan: ['barcode', 'scanning'],
  status: ['state', 'change status'],
  late: ['after_scheduled_time', 'overdue', 'delayed'],
  early: ['before_scheduled_time', 'ahead'],
  active: ['enabled', 'on'],
  inactive: ['disabled', 'off'],
  unassigned: ['no driver', 'not assigned'],
  assigned: ['has driver'],
  task: ['create_task', 'complete_task'],
};

function extractTokens(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function fuzzyMatch(text: string, token: string): boolean {
  return text.toLowerCase().includes(token);
}

function resolvesynonyms(token: string): string[] {
  const results = [token];
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (synonyms.includes(token) || key === token) {
      results.push(key, ...synonyms);
    }
  }
  return [...new Set(results)];
}

export function smartSearch(
  query: string,
  automations: AutomationRule[],
  customers: CustomerOption[],
  speeds: SpeedOption[]
): SearchResult[] {
  if (!query.trim()) return [];

  const tokens = extractTokens(query);
  const expandedTokens = tokens.flatMap(resolvesynonyms);
  const results: SearchResult[] = [];

  for (const auto of automations) {
    const reasons: string[] = [];

    // Name/description match
    for (const token of tokens) {
      if (fuzzyMatch(auto.name, token)) {
        reasons.push(`Name contains "${token}"`);
      }
      if (auto.description && fuzzyMatch(auto.description, token)) {
        reasons.push(`Description contains "${token}"`);
      }
    }

    // Status keywords
    for (const token of tokens) {
      if (['active', 'enabled', 'on'].includes(token) && auto.isActive) {
        reasons.push('Status: active');
      }
      if (['inactive', 'disabled', 'off'].includes(token) && !auto.isActive) {
        reasons.push('Status: inactive');
      }
    }

    // Condition type matching
    for (const cond of auto.conditions) {
      for (const token of expandedTokens) {
        if (fuzzyMatch(cond.type, token)) {
          reasons.push(`Condition: ${cond.type}`);
        }
        if (cond.type === 'scan' && 'scanTypes' in cond) {
          for (const st of cond.scanTypes) {
            if (fuzzyMatch(st, token)) {
              reasons.push(`Scan type: ${st}`);
            }
          }
        }
        if ('scheduledTimeField' in cond && fuzzyMatch(cond.scheduledTimeField, token)) {
          reasons.push(`Timing: ${cond.scheduledTimeField}`);
        }
      }
    }

    // Action type matching
    for (const action of auto.actions) {
      for (const token of expandedTokens) {
        if (fuzzyMatch(action.type, token)) {
          reasons.push(`Action: ${action.type}`);
        }
      }
    }

    // Customer scope matching
    const scopeCustomerNames = auto.scope.customerIds
      .map(id => customers.find(c => c.id === id))
      .filter(Boolean);
    for (const token of tokens) {
      for (const c of scopeCustomerNames) {
        if (c && (fuzzyMatch(c.name, token) || fuzzyMatch(c.shortName, token))) {
          reasons.push(`Customer: ${c.shortName}`);
        }
      }
    }

    // Speed scope matching
    const scopeSpeedNames = auto.scope.speedIds
      .map(id => speeds.find(s => s.id === id))
      .filter(Boolean);
    for (const token of tokens) {
      for (const s of scopeSpeedNames) {
        if (s && (fuzzyMatch(s.name, token) || fuzzyMatch(s.code, token))) {
          reasons.push(`Speed: ${s.name}`);
        }
      }
    }

    // Deduplicate reasons
    const uniqueReasons = [...new Set(reasons)];
    if (uniqueReasons.length > 0) {
      results.push({ automation: auto, matchReasons: uniqueReasons });
    }
  }

  // Sort by number of match reasons (most relevant first)
  results.sort((a, b) => b.matchReasons.length - a.matchReasons.length);
  return results;
}
