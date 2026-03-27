export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatFloor(floor: string | number): string {
  const n = typeof floor === "string" ? parseInt(floor) : floor;
  if (isNaN(n)) return "";
  return `${getOrdinal(n)} floor`;
}

export function parseFloorNumber(floor: string): string {
  if (!floor) return "";
  const match = floor.match(/\d+/);
  return match ? match[0] : "";
}
