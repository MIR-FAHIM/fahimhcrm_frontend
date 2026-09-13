export const formatVisitDistance = (distanceMeters) => {
  if (distanceMeters === null || distanceMeters === undefined) return "Not available";
  const value = Number(distanceMeters);
  if (Number.isNaN(value)) return "Not available";
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(2)} km`;
};
