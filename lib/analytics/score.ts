export interface EditorialMetrics {
  views: number;
  uniqueVisitors: number;
  averageReadingTime: number;
  completedReads: number;
  clicks: number;
  impressions: number;
  shares: number;
}

export interface EditorialScore {
  score: number;
  level: "excellent" | "bon" | "moyen" | "faible";
  color: string;
  label: string;
}

export function calculateEditorialScore(
  metrics: EditorialMetrics
): EditorialScore {
  let score = 0;

  /*
   * Cette première version est volontairement simple.
   * Les pondérations évolueront avec les données réelles.
   */

  score += Math.min(metrics.views / 100, 30);

  score += Math.min(metrics.uniqueVisitors / 100, 20);

  score += Math.min(metrics.averageReadingTime / 10, 20);

  score += Math.min(metrics.completedReads / 10, 20);

  score += Math.min(metrics.shares * 2, 10);

  const rounded = Math.round(score);

  if (rounded >= 85) {
    return {
      score: rounded,
      level: "excellent",
      color: "emerald",
      label: "Excellent",
    };
  }

  if (rounded >= 65) {
    return {
      score: rounded,
      level: "bon",
      color: "blue",
      label: "Bon",
    };
  }

  if (rounded >= 40) {
    return {
      score: rounded,
      level: "moyen",
      color: "amber",
      label: "Moyen",
    };
  }

  return {
    score: rounded,
    level: "faible",
    color: "red",
    label: "À renforcer",
  };
}