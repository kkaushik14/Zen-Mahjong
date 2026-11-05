import type { AssistKind } from './concentration-model';
import { applyEconomyTransaction, type LocalEconomyStateV1 } from './local-economy';

export const ADVERTISEMENT_STATE_SCHEMA_VERSION = 1 as const;
export const ADVERTISEMENT_RECEIPT_SCHEMA_VERSION = 1 as const;

export type AdvertisementPlacement = 'assist-reward' | 'revival';
export type AdvertisementFailureReason =
  'cancelled' | 'provider-error' | 'provider-unavailable' | 'unverified';

export type AdvertisementReward =
  { assist: AssistKind; kind: 'assist'; quantity: number } | { kind: 'revival' };

export interface AdvertisementRequest {
  placement: AdvertisementPlacement;
  requestId: string;
  sessionId: string;
}

export type AdvertisementResult =
  | {
      completedAt: string;
      impressionId: string;
      requestId: string;
      status: 'completed';
      verification: 'development' | 'verified';
    }
  | {
      reason: AdvertisementFailureReason;
      requestId: string;
      status: 'not-completed';
    };

export interface AdvertisementAvailability {
  available: boolean;
  reason: 'available' | 'offline' | 'provider-unavailable';
}

export interface AdvertisementProvider {
  getAvailability(placement: AdvertisementPlacement): Promise<AdvertisementAvailability>;
  showRewarded(request: AdvertisementRequest): Promise<AdvertisementResult>;
}

export interface AdvertisementReceiptV1 {
  completedAt: string;
  impressionId: string;
  placement: AdvertisementPlacement;
  qualifiesForZenScore: boolean;
  receiptId: string;
  requestId: string;
  reward: AdvertisementReward;
  schemaVersion: typeof ADVERTISEMENT_RECEIPT_SCHEMA_VERSION;
  sessionId: string;
  verification: 'development' | 'verified';
}

export interface AdvertisementStateV1 {
  receipts: readonly AdvertisementReceiptV1[];
  schemaVersion: typeof ADVERTISEMENT_STATE_SCHEMA_VERSION;
}

export interface AdvertisementGrantResult {
  accepted: boolean;
  advertisements: AdvertisementStateV1;
  economy: LocalEconomyStateV1;
  reason: 'already-granted' | 'invalid-result' | null;
  receipt: AdvertisementReceiptV1 | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function validateAdvertisementReward(value: unknown): value is AdvertisementReward {
  if (!isRecord(value)) return false;
  if (value.kind === 'revival') return true;
  return (
    value.kind === 'assist' &&
    (value.assist === 'hint' || value.assist === 'shuffle' || value.assist === 'undo') &&
    value.quantity === 1
  );
}

export function validateAdvertisementReceipt(value: unknown): value is AdvertisementReceiptV1 {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === ADVERTISEMENT_RECEIPT_SCHEMA_VERSION &&
    isNonEmptyString(value.completedAt) &&
    isNonEmptyString(value.impressionId) &&
    (value.placement === 'assist-reward' || value.placement === 'revival') &&
    typeof value.qualifiesForZenScore === 'boolean' &&
    isNonEmptyString(value.receiptId) &&
    isNonEmptyString(value.requestId) &&
    validateAdvertisementReward(value.reward) &&
    isNonEmptyString(value.sessionId) &&
    (value.verification === 'development' || value.verification === 'verified') &&
    ((value.placement === 'assist-reward' &&
      value.reward.kind === 'assist' &&
      value.qualifiesForZenScore) ||
      (value.placement === 'revival' &&
        value.reward.kind === 'revival' &&
        !value.qualifiesForZenScore))
  );
}

export function validateAdvertisementState(value: unknown): value is AdvertisementStateV1 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== ADVERTISEMENT_STATE_SCHEMA_VERSION ||
    !Array.isArray(value.receipts) ||
    !value.receipts.every(validateAdvertisementReceipt)
  ) {
    return false;
  }
  const receiptIds = value.receipts.map((receipt) => receipt.receiptId);
  const impressionIds = value.receipts.map((receipt) => receipt.impressionId);
  const requestIds = value.receipts.map((receipt) => receipt.requestId);
  return (
    new Set(receiptIds).size === receiptIds.length &&
    new Set(impressionIds).size === impressionIds.length &&
    new Set(requestIds).size === requestIds.length
  );
}

export function createInitialAdvertisementState(): AdvertisementStateV1 {
  return { receipts: [], schemaVersion: ADVERTISEMENT_STATE_SCHEMA_VERSION };
}

function createReceipt(
  request: AdvertisementRequest,
  result: Extract<AdvertisementResult, { status: 'completed' }>,
  reward: AdvertisementReward,
): AdvertisementReceiptV1 {
  return {
    completedAt: result.completedAt,
    impressionId: result.impressionId,
    placement: request.placement,
    qualifiesForZenScore: reward.kind === 'assist',
    receiptId: `advertisement:${result.impressionId}`,
    requestId: request.requestId,
    reward,
    schemaVersion: ADVERTISEMENT_RECEIPT_SCHEMA_VERSION,
    sessionId: request.sessionId,
    verification: result.verification,
  };
}

export function grantAdvertisementAssist(
  advertisements: AdvertisementStateV1,
  economy: LocalEconomyStateV1,
  request: AdvertisementRequest,
  result: AdvertisementResult,
  assist: AssistKind,
): AdvertisementGrantResult {
  if (
    request.placement !== 'assist-reward' ||
    result.status !== 'completed' ||
    result.requestId !== request.requestId
  ) {
    return { accepted: false, advertisements, economy, reason: 'invalid-result', receipt: null };
  }
  const receipt = createReceipt(request, result, { assist, kind: 'assist', quantity: 1 });
  if (advertisements.receipts.some((existing) => existing.receiptId === receipt.receiptId)) {
    return { accepted: false, advertisements, economy, reason: 'already-granted', receipt };
  }
  const transaction = applyEconomyTransaction(economy, {
    createdAt: result.completedAt,
    mutations: [
      {
        asset: assist,
        delta: 1,
        reason: 'advertisement-reward',
        sessionId: request.sessionId,
      },
    ],
    transactionId: `${receipt.receiptId}:reward`,
  });
  if (!transaction.applied) {
    return { accepted: false, advertisements, economy, reason: 'already-granted', receipt };
  }
  return {
    accepted: true,
    advertisements: { ...advertisements, receipts: [...advertisements.receipts, receipt] },
    economy: transaction.state,
    reason: null,
    receipt,
  };
}

export function recordAdvertisementRevival(
  advertisements: AdvertisementStateV1,
  request: AdvertisementRequest,
  result: AdvertisementResult,
): {
  accepted: boolean;
  advertisements: AdvertisementStateV1;
  receipt: AdvertisementReceiptV1 | null;
} {
  if (
    request.placement !== 'revival' ||
    result.status !== 'completed' ||
    result.requestId !== request.requestId
  ) {
    return { accepted: false, advertisements, receipt: null };
  }
  const receipt = createReceipt(request, result, { kind: 'revival' });
  if (advertisements.receipts.some((existing) => existing.receiptId === receipt.receiptId)) {
    return { accepted: false, advertisements, receipt };
  }
  return {
    accepted: true,
    advertisements: { ...advertisements, receipts: [...advertisements.receipts, receipt] },
    receipt,
  };
}

export function countQualifyingAssistAdvertisements(
  advertisements: AdvertisementStateV1,
  sessionId: string,
): number {
  return advertisements.receipts.filter(
    (receipt) => receipt.sessionId === sessionId && receipt.qualifiesForZenScore,
  ).length;
}
