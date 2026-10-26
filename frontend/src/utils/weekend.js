export const raceDate = (event) =>
  event.session5_date || event.session4_date || event.event_date;
export function splitSeason(events, now = Date.now()) {
  const scheduled = events
    .filter(
      (e) =>
        e.round_number > 0 && Number.isFinite(new Date(raceDate(e)).getTime())
    )
    .sort((a, b) => a.round_number - b.round_number);
  const upcoming = scheduled.filter(
    (e) => new Date(raceDate(e)).getTime() + 10800000 >= now
  );
  return { scheduled, upcoming, completed: scheduled.length - upcoming.length };
}
const timestamp = (value) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const escapeICS = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
// RFC 5545 limits content lines to 75 UTF-8 octets; continuation lines start with a space.
function fold(line) {
  let result = "",
    part = "",
    size = 0;
  for (const char of line) {
    const length = encodeURIComponent(char).replace(
      /%[A-F\d]{2}/gi,
      "x"
    ).length;
    if (size + length > 75) {
      result += part + "\r\n";
      part = " ";
      size = 1;
    }
    part += char;
    size += length;
  }
  return result + part;
}
export function buildWeekendCalendar(event, now = new Date()) {
  const sessions = [1, 2, 3, 4, 5].filter(
    (i) =>
      event[`session${i}`] &&
      Number.isFinite(new Date(event[`session${i}_date`] || "").getTime())
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Circuit Stream//Race Weekend//EN",
    "CALSCALE:GREGORIAN",
    ...sessions.flatMap((i) => {
      const start = event[`session${i}_date`];
      return [
        "BEGIN:VEVENT",
        `UID:${new Date(start).getUTCFullYear()}-${
          event.round_number
        }-${i}@circuitstream`,
        `DTSTAMP:${timestamp(now)}`,
        `DTSTART:${timestamp(start)}`,
        `DTEND:${timestamp(new Date(new Date(start).getTime() + 7200000))}`,
        `SUMMARY:${escapeICS(event.event_name)} - ${escapeICS(
          event[`session${i}`]
        )}`,
        `LOCATION:${escapeICS(event.location)}`,
        "END:VEVENT",
      ];
    }),
    "END:VCALENDAR",
    "",
  ]
    .map(fold)
    .join("\r\n");
}
