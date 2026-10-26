import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Telemetry from "./Telemetry";
import { axios } from "../config/api";
jest.mock("../config/api", () => ({
  __esModule: true,
  default: "http://example.test",
  axios: { get: jest.fn() },
}));
jest.mock("recharts", () => {
  const actual = jest.requireActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      require("react").cloneElement(children, { width: 800, height: 300 }),
  };
});
const samples = [
  {
    session_time: "0 days 01:00:00",
    speed: 100,
    rpm: 8000,
    throttle: 50,
    gear: 3,
    brake: false,
    drs: 8,
  },
  {
    session_time: "0 days 01:00:01",
    speed: 300,
    rpm: 12000,
    throttle: 100,
    gear: 8,
    brake: true,
    drs: 12,
  },
];
let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  axios.get.mockReset().mockImplementation((url) =>
    Promise.resolve({
      data: url.includes("/schedule/")
        ? { events: [{ round_number: 1, event_name: "Test Grand Prix" }] }
        : url.includes("/drivers/")
        ? { drivers: [{ number: "1", full_name: "Test Driver" }] }
        : { driver: "1", lap_number: 1, telemetry: samples },
    })
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});
async function renderLab() {
  await act(async () => {
    root.render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Telemetry />
      </MemoryRouter>
    );
  });
}
it("loads an actual lap response, renders its chart and clears it when selection changes", async () => {
  await renderLab();
  expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
  await act(async () => {
    Simulate.submit(container.querySelector("form"));
  });
  expect(axios.get.mock.calls.some(([url]) => url.endsWith("/R/1/1"))).toBe(
    true
  );
  expect(container.textContent).toContain("300");
  expect(container.textContent).toContain("75");
  expect(container.textContent).toContain("2 SAMPLES");
  expect(container.querySelector(".recharts-line-curve")).not.toBeNull();
  const inputs = [...container.querySelectorAll('[role="tab"]')].find(
    (e) => e.textContent === "Driver inputs"
  );
  act(() => Simulate.click(inputs));
  expect(inputs.getAttribute("aria-selected")).toBe("true");
  expect(container.querySelector(".lab-chart-legend").textContent).toContain(
    "Brake"
  );
  act(() =>
    Simulate.change(container.querySelector('input[type="number"]'), {
      target: { value: "2" },
    })
  );
  expect(container.querySelector(".lab-results")).toBeNull();
  expect(container.querySelector(".lab-empty")).not.toBeNull();
});
it("shows a useful unavailable-session message without exposing backend internals", async () => {
  await renderLab();
  axios.get.mockRejectedValueOnce({
    response: {
      data: {
        error:
          "The data you are trying to access has not been loaded yet. See Session.load",
      },
    },
  });
  await act(async () => {
    Simulate.submit(container.querySelector("form"));
  });
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    "Please try again"
  );
  expect(container.textContent).not.toContain("Session.load");
  expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
});
it("uses the selected session roster and sends the driver code with telemetry requests", async () => {
  const roster = [
    { number: "1", abbreviation: "NOR", full_name: "Lando Norris" },
    { number: "3", abbreviation: "VER", full_name: "Max Verstappen" },
  ];
  axios.get.mockImplementation((url) =>
    Promise.resolve({
      data: url.includes("/schedule/")
        ? { events: [{ round_number: 4, event_name: "Miami Grand Prix" }] }
        : url.includes("/drivers/")
        ? { drivers: roster }
        : {
            driver: "3",
            driver_code: "VER",
            driver_name: "Max Verstappen",
            lap_number: 1,
            telemetry: samples,
            source: "OpenF1",
          },
    })
  );
  await renderLab();
  act(() =>
    Simulate.change(container.querySelectorAll("select")[3], {
      target: { value: "3" },
    })
  );
  await act(async () =>
    Simulate.change(container.querySelectorAll("select")[2], {
      target: { value: "Q" },
    })
  );
  expect(
    axios.get.mock.calls.some(([url]) =>
      url.endsWith("/drivers/" + new Date().getFullYear() + "/4/Q")
    )
  ).toBe(true);
  expect(container.querySelectorAll("select")[3].value).toBe("3");
  await act(async () => Simulate.submit(container.querySelector("form")));
  const request = axios.get.mock.calls.find(([url]) =>
    url.includes("/api/telemetry/")
  );
  expect(request[0]).toContain("/4/Q/3/1");
  expect(request[1].params).toEqual({ driver_code: "VER" });
  expect(container.querySelector(".lab-result-heading").textContent).toContain(
    "Max Verstappen"
  );
  expect(container.querySelector(".lab-data-note").textContent).toContain(
    "OpenF1"
  );
});
