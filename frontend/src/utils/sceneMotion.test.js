import { attachSceneMotion } from "./sceneMotion";
let element, notify, frames, next, stop;
const originalObserver = global.IntersectionObserver;
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  document.documentElement.dataset.effects = "full";
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
  element = document.createElement("div");
  element.innerHTML =
    '<div class="cinema-stage"></div><div class="velocity-section"><div class="velocity-art"></div></div>';
  document.body.appendChild(element);
  frames = new Map();
  next = 1;
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    const id = next++;
    frames.set(id, callback);
    return id;
  });
  jest
    .spyOn(window, "cancelAnimationFrame")
    .mockImplementation((id) => frames.delete(id));
  window.matchMedia = () => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  global.IntersectionObserver = class {
    constructor(callback) {
      notify = callback;
    }
    observe() {}
    disconnect() {}
  };
  stop = attachSceneMotion(element);
});
afterEach(() => {
  stop();
  element.remove();
  jest.restoreAllMocks();
  global.IntersectionObserver = originalObserver;
  window.matchMedia = originalMatchMedia;
  delete document.documentElement.dataset.effects;
});
function flush(time = 100) {
  const queued = [...frames.values()];
  frames.clear();
  queued.forEach((fn) => fn(time));
}
it("has no idle frame loop and scopes scroll styles to the visible scene", () => {
  expect(frames.size).toBe(0);
  const stage = element.querySelector(".cinema-stage");
  notify([{ target: stage, isIntersecting: true }]);
  expect(frames.size).toBe(1);
  flush();
  expect(stage.style.getPropertyValue("--hero-progress")).not.toBe("");
  expect(element.style.getPropertyValue("--hero-progress")).toBe("");
  expect(frames.size).toBe(0);
  window.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(1);
  flush(150);
  expect(frames.size).toBe(0);
});
it("does not schedule work for off-screen scenes or hidden tabs", () => {
  window.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
  const stage = element.querySelector(".cinema-stage");
  notify([{ target: stage, isIntersecting: true }]);
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
  expect(frames.size).toBe(0);
  window.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
});
it("motion-off cancels pending rendering and restores static positioning", () => {
  const stage = element.querySelector(".cinema-stage");
  notify([{ target: stage, isIntersecting: true }]);
  expect(frames.size).toBe(1);
  document.documentElement.dataset.effects = "reduced";
  window.dispatchEvent(new Event("circuit-stream-effects"));
  expect(frames.size).toBe(0);
  expect(stage.style.getPropertyValue("--hero-progress")).toBe("0");
  window.dispatchEvent(new Event("scroll"));
  expect(frames.size).toBe(0);
});
