import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import API_BASE_URL, { axios } from "../config/api";
export function useArchiveData(path) {
  const [attempt, setAttempt] = useState(0),
    [state, setState] = useState({
      key: "",
      data: null,
      error: "",
      loading: true,
    });
  useEffect(() => {
    const controller = new AbortController();
    setState({ key: path, data: null, error: "", loading: true });
    axios
      .get(`${API_BASE_URL}${path}`, {
        signal: controller.signal,
        timeout: 45000,
      })
      .then((response) => {
        if (!controller.signal.aborted)
          setState({
            key: path,
            data: response.data,
            error: "",
            loading: false,
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            key: path,
            data: null,
            error: "The archive could not be reached. Please try again.",
            loading: false,
          });
      });
    return () => controller.abort();
  }, [path, attempt]);
  return {
    ...(state.key === path ? state : { data: null, error: "", loading: true }),
    retry: () => setAttempt((a) => a + 1),
  };
}
export function SeasonPicker({ year, onChange }) {
  return (
    <label className="archive-season">
      SEASON
      <select value={year} onChange={(e) => onChange(Number(e.target.value))}>
        {Array.from(
          { length: new Date().getFullYear() - 2017 },
          (_, i) => new Date().getFullYear() - i
        ).map((y) => (
          <option value={y} key={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
export function ArchiveStatus({ loading, error, retry, empty = false }) {
  if (loading)
    return (
      <div className="archive-status" role="status">
        <span className="lab-eyebrow">CONNECTING TO THE ARCHIVE</span>
        <h2>A closer look, coming up.</h2>
        <p>Loading the season’s details.</p>
      </div>
    );
  if (error)
    return (
      <div className="lab-notice" role="alert">
        <AlertCircle size={19} />
        <p>{error}</p>
        <button onClick={retry}>
          Try again <RefreshCw size={13} />
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="archive-status">
        <span className="lab-eyebrow">THE ARCHIVE</span>
        <h2>No entries to show.</h2>
        <p>Try another season or adjust your filters.</p>
      </div>
    );
  return null;
}
export function ArchiveImage({ src, alt, className = "", fallback = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={`archive-image-fallback ${className}`} aria-label={alt}>
      {fallback || "ARCHIVE"}
    </span>
  );
}
