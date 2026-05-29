export default function ProgressRing({ value = 70, label, description }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="progress-card"><div className="progress-ring" style={{ "--progress": `${safeValue}%` }}><span>{safeValue}%</span></div><div><strong>{label}</strong><p>{description}</p></div></div>;
}
