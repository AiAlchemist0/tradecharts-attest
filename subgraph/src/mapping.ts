import { Attested } from "../generated/EAS/EAS"

/**
 * Bootstrap: listen to Base Sepolia EAS. Map/Conflict entities are written
 * once MapConfirmed is deployed; this handler keeps the subgraph syncing.
 */
export function handleAttested(_event: Attested): void {}
