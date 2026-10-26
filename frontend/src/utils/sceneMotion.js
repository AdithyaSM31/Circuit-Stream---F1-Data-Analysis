// Scroll-only rendering: no idle frame loop, and no work for off-screen scenes.
export function attachSceneMotion(element) {
  const stage = element.querySelector(".cinema-stage"),
    art = element.querySelector(".velocity-art"),
    lab = element.querySelector(".velocity-section");
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    lastTime = -Infinity,
    heroVisible = false,
    labVisible = false,
    lastProgress = "",
    lastShift = "";
  const enabled = () =>
    !document.hidden &&
    !media.matches &&
    document.documentElement.dataset.effects !== "reduced";
  const cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const update = (time) => {
    frame = 0;
    if (!enabled() || (!heroVisible && !labVisible)) return;
    if (time - lastTime < 32) {
      frame = requestAnimationFrame(update);
      return;
    }
    lastTime = time;
    const height = window.innerHeight;
    // Read geometry before any style writes.
    const top = labVisible && lab ? lab.getBoundingClientRect().top : null;
    const progress = String(
      Math.min(1, Math.max(0, window.scrollY / (height * 0.8))).toFixed(3)
    );
    const shift =
      top === null
        ? null
        : `${Math.max(-90, Math.min(90, (top - height * 0.5) * 0.12)).toFixed(
            1
          )}px`;
    if (heroVisible && stage && progress !== lastProgress) {
      stage.style.setProperty("--hero-progress", progress);
      lastProgress = progress;
    }
    if (labVisible && art && shift !== lastShift) {
      art.style.setProperty("--lab-shift", shift);
      lastShift = shift;
    }
  };
  const schedule = () => {
    if (enabled() && (heroVisible || labVisible) && !frame)
      frame = requestAnimationFrame(update);
  };
  const preference = () => {
    cancel();
    if (!enabled()) {
      stage?.style.setProperty("--hero-progress", "0");
      art?.style.setProperty("--lab-shift", "0px");
      lastProgress = "";
      lastShift = "";
    } else schedule();
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === stage) heroVisible = entry.isIntersecting;
      if (entry.target === lab) labVisible = entry.isIntersecting;
    }
    if (!heroVisible && !labVisible) cancel();
    else schedule();
  });
  if (stage) observer.observe(stage);
  if (lab) observer.observe(lab);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("circuit-stream-effects", preference);
  document.addEventListener("visibilitychange", preference);
  media.addEventListener("change", preference);
  return () => {
    cancel();
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("circuit-stream-effects", preference);
    document.removeEventListener("visibilitychange", preference);
    media.removeEventListener("change", preference);
  };
}
