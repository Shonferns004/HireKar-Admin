export const calculateTotalDuration = (chapters = []) => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return "—";
  }

  let totalMinutes = 0;

  chapters.forEach((chapter) => {
    const duration = chapter.duration?.toLowerCase() || "";

    // Match hours (e.g. 2h, 3 h)
    const hoursMatch = duration.match(/(\d+)\s*h/);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }

    // Match minutes (e.g. 30m, 45 m)
    const minutesMatch = duration.match(/(\d+)\s*m/);
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1], 10);
    }
  });

  if (totalMinutes === 0) return "—";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;

  return `${hours} hrs ${minutes} mins`;
};
