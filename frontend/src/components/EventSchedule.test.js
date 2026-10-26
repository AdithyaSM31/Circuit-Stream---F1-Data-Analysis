import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import EventSchedule from "./EventSchedule";
import { axios } from "../config/api";
jest.mock("../config/api", () => ({
  __esModule: true,
  default: "http://example.test",
  axios: { get: jest.fn() },
}));
it("renders loaded calendar cards and resolves event-specific circuit artwork", async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  axios.get.mockResolvedValueOnce({
    data: {
      events: [
        {
          round_number: 1,
          event_name: "Australian Grand Prix",
          location: "Melbourne",
          country: "Australia",
          event_date: "2026-03-08T04:00:00Z",
        },
        {
          round_number: 21,
          event_name: "Las Vegas Grand Prix",
          location: "Las Vegas",
          country: "United States",
          event_date: "2026-11-22T04:00:00Z",
        },
      ],
    },
  });
  try {
    await act(async () => root.render(<EventSchedule />));
    expect(container.querySelectorAll(".calendar-card")).toHaveLength(2);
    expect(
      container.querySelector(
        'img[src="/images/circuits/Las_Vegas_Circuit.avif"]'
      )
    ).not.toBeNull();
    act(() =>
      Simulate.change(container.querySelector("input"), {
        target: { value: "Las Vegas" },
      })
    );
    expect(container.querySelectorAll(".calendar-card")).toHaveLength(1);
    expect(container.querySelector(".calendar-card h2").textContent).toBe(
      "Las VegasGrand Prix"
    );
  } finally {
    act(() => root.unmount());
    container.remove();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
});
