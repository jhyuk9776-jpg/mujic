// Credit pricing for a single generation, shared by the client (to preview the
// cost) and the API route (to actually charge it).
//
//   base            1 credit
//   duration        1분 +0, 2분 +1, 3분 +2   (one per extra minute)
//   batch size      1곡 +0, 2곡 +1, 3곡 +2, 4곡 +3   (one per extra song)

export const BASE_CREDIT_COST = 1;

/** Extra credits charged for durations beyond the 1-minute baseline. */
export function durationSurcharge(durationSeconds: number): number {
    const minutes = Math.round(durationSeconds / 60);
    return Math.max(0, minutes - 1);
}

/** Extra credits charged for generating more than one song. */
export function batchSurcharge(batchSize: number): number {
    return Math.max(0, Math.round(batchSize) - 1);
}

/** Total credits a generation with the given options costs. */
export function creditCost(durationSeconds: number, batchSize: number): number {
    return BASE_CREDIT_COST + durationSurcharge(durationSeconds) + batchSurcharge(batchSize);
}
