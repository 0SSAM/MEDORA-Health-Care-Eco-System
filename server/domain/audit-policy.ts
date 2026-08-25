import { and, eq, desc } from "drizzle-orm";
import { auditLogs } from "../../drizzle/schema";
import { hashAuditRecord } from "./internal-auth";
import { getDb } from "../db";

export async function writeDetailedAudit(db: any, input: { 
  userId: number; 
  organizationId: number; 
  branchId?: number | null; 
  jurisdictionId?: number | null; 
  action: string; 
  entityType: string; 
  entityId: string | number;
  metadata?: Record<string, any>;
}) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs)
    .where(and(
      eq(auditLogs.organizationId, input.organizationId), 
      input.branchId ? eq(auditLogs.branchId, input.branchId) : undefined
    ))
    .orderBy(desc(auditLogs.id)).limit(1);
    
  const createdAt = new Date().toISOString();
  const entityIdStr = String(input.entityId);
  
  // We use the requestId field to store entityType:entityId for traceability in the hash
  const recordHash = hashAuditRecord({ 
    eventType: input.action, 
    userId: input.userId, 
    organizationId: input.organizationId, 
    branchId: input.branchId ?? null, 
    jurisdictionId: input.jurisdictionId ?? null, 
    requestId: `${input.entityType}:${entityIdStr}`, 
    createdAt 
  });
  
  await db.insert(auditLogs).values({ 
    userId: input.userId, 
    organizationId: input.organizationId, 
    branchId: input.branchId ?? null, 
    action: input.action, 
    entityType: input.entityType, 
    entityId: entityIdStr, 
    previousHash: previous[0]?.recordHash ?? null, 
    recordHash 
  });
}
