import { ForecastPoint, ResourceId, ScenarioInput } from '../domain/types';

export function generateForecastData(
  resourceId: ResourceId,
  rangeHours: 6 | 12 | 24,
  scenarioInput: ScenarioInput
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const startHour = -4; // 4 hours historical
  const endHour = rangeHours;
  const step = rangeHours === 24 ? 2 : 1; // 1-hour steps for 6/12h, 2-hour for 24h

  // Base parameters per resource
  const configs: Record<ResourceId, { baseDemand: number; capacity: number; threshold: number; unit: string }> = {
    beds: { baseDemand: 24, capacity: 30, threshold: 27, unit: 'beds' },
    icu: { baseDemand: 8, capacity: 10, threshold: 9, unit: 'beds' },
    staff: { baseDemand: 10, capacity: 12, threshold: 11, unit: 'nurses' },
    or: { baseDemand: 2, capacity: 3, threshold: 2.5, unit: 'theatres' },
    emergency: { baseDemand: 4, capacity: 6, threshold: 5, unit: 'holding' },
  };

  const config = configs[resourceId] || configs.icu;

  // Scenario influence factors
  const arrivalsFactor = scenarioInput.emergencyArrivals;
  const nurseDeficit = 10 - scenarioInput.availableNurses;
  const addedIcu = scenarioInput.addedIcuDemand;
  const delayedDischarges = scenarioInput.delayedDischarges;
  const orDelay = scenarioInput.orDelayMinutes / 60;

  for (let h = startHour; h <= endHour; h += step) {
    const isHistorical = h <= 0;
    const hour24 = (14 + h + 24) % 24;
    const timestamp = `${hour24.toString().padStart(2, '0')}:00`;

    let demand = config.baseDemand;
    let uncertainty = 0;

    if (isHistorical) {
      // Historical curve slight deterministic variation
      const histOffset = Math.sin(h * 0.8) * 0.4;
      demand = Math.round((config.baseDemand + histOffset) * 10) / 10;
    } else {
      // Future projection based on resource and scenario
      const hourProgress = h / rangeHours;

      if (resourceId === 'icu') {
        // ICU builds up pressure especially around +2h to +6h
        const naturalIncrease = Math.sin(hourProgress * Math.PI) * 0.8;
        const scenarioImpact = addedIcu * (0.5 + 0.5 * hourProgress) + (arrivalsFactor > 0 ? 0.3 * arrivalsFactor : 0);
        demand = config.baseDemand + naturalIncrease + scenarioImpact;
        uncertainty = 0.4 + hourProgress * 1.2;
      } else if (resourceId === 'beds') {
        const naturalIncrease = Math.sin(hourProgress * Math.PI * 0.7) * 1.2;
        const scenarioImpact = arrivalsFactor * 0.6 + delayedDischarges * 0.8;
        demand = config.baseDemand + naturalIncrease + scenarioImpact;
        uncertainty = 0.8 + hourProgress * 2.0;
      } else if (resourceId === 'staff') {
        // Staff demand rises with patient volume while available staff drops with deficit
        demand = config.baseDemand + (arrivalsFactor * 0.3) + (nurseDeficit > 0 ? nurseDeficit * 0.4 : 0);
        uncertainty = 0.3 + hourProgress * 0.8;
      } else if (resourceId === 'or') {
        demand = config.baseDemand + (orDelay > 0 ? 0.4 : 0) - (h > 6 ? 0.5 : 0);
        uncertainty = 0.2 + hourProgress * 0.5;
      } else if (resourceId === 'emergency') {
        const peak = Math.sin(hourProgress * Math.PI) * 1.5;
        demand = config.baseDemand + arrivalsFactor * 0.8 + peak;
        uncertainty = 0.5 + hourProgress * 1.5;
      }

      demand = Math.round(demand * 10) / 10;
    }

    // Capacity line
    let capacity = config.capacity;
    if (resourceId === 'staff' && !isHistorical) {
      capacity = scenarioInput.availableNurses;
    }

    const lowerConf = Math.max(0, Math.round((demand - uncertainty) * 10) / 10);
    const upperConf = Math.round((demand + uncertainty) * 10) / 10;
    const isBreach = !isHistorical && (demand >= config.threshold || demand > capacity);

    const hasEvent = !isHistorical && h === step && arrivalsFactor > 0;
    const eventLabel = hasEvent ? `+${arrivalsFactor} Emergency Inflow` : undefined;

    points.push({
      timeOffsetHours: h,
      timestamp,
      demand,
      capacity,
      threshold: config.threshold,
      lowerConfidence: lowerConf,
      upperConfidence: upperConf,
      isHistorical,
      hasEvent,
      eventLabel,
      breach: isBreach,
    });
  }

  return points;
}
