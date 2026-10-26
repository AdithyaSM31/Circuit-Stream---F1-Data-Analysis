import { buildWeekendCalendar, splitSeason } from "./weekend";
const event = {
  round_number: 3,
  event_name: "Grand Prix, Test; Event",
  location: "City\nCircuit",
  session1: "Practice 1",
  session1_date: "2026-05-01T10:00:00Z",
  session5: "Race",
  session5_date: "2026-05-03T13:00:00Z",
};
it("exports valid UTC events, escapes text, and skips missing sessions", () => {
  const calendar = buildWeekendCalendar(
    event,
    new Date("2026-01-01T00:00:00Z")
  );
  expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  expect(calendar).toContain("DTSTART:20260503T130000Z");
  expect(calendar).toContain("DTEND:20260503T150000Z");
  expect(calendar).toContain("SUMMARY:Grand Prix\\, Test\\; Event - Race");
  expect(calendar).toContain("LOCATION:City\\nCircuit");
  expect(calendar).not.toContain("Invalid");
});
it("keeps calendar IDs distinct across seasons and ignores invalid session dates", () => {
  const next = {
    ...event,
    session1_date: "invalid",
    session5_date: "2027-05-03T13:00:00Z",
  };
  const calendar = buildWeekendCalendar(next);
  expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  expect(calendar).toContain("UID:2027-3-5@circuitstream");
});
it("folds long UTF-8 content lines without corrupting the name", () => {
  const name = "São Paulo ".repeat(20);
  const calendar = buildWeekendCalendar({ ...event, event_name: name });
  for (const line of calendar.split("\r\n"))
    expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
  expect(calendar.replace(/\r\n /g, "")).toContain(`SUMMARY:${name} - Race`);
});
it("sorts rounds, ignores testing and invalid dates, and handles a completed season", () => {
  const future = {
    ...event,
    round_number: 4,
    session5_date: "2026-05-10T13:00:00Z",
  };
  const list = [
    future,
    { ...event, round_number: 0 },
    event,
    { round_number: 5 },
  ];
  expect(splitSeason(list, Date.parse("2026-05-04")).upcoming).toEqual([
    future,
  ]);
  expect(splitSeason(list, Date.parse("2026-05-04")).completed).toBe(1);
  expect(splitSeason(list, Date.parse("2026-12-31")).upcoming).toEqual([]);
  expect(splitSeason([], Date.now()).completed).toBe(0);
});
