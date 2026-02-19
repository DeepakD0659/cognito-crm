/** In-memory audit trail for compliance logging */

export interface AuditEntry {
  id: string;
  flowId: string;
  action: string;
  actor: string;
  timestamp: Date;
  prevState?: string;
  newState?: string;
  metadata?: Record<string, unknown>;
}

let auditEntries: AuditEntry[] = [];

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(),
  };
  auditEntries = [full, ...auditEntries].slice(0, 500); // keep last 500
  return full;
}

export function getAuditEntries(): AuditEntry[] {
  return auditEntries;
}

export function clearAuditLog(): void {
  auditEntries = [];
}
