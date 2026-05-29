export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <article className="stat-card">
      <div><p>{title}</p><strong>{value}</strong><span>{subtitle}</span>{trend && <small className="trend-pill">{trend}</small>}</div>
      {icon && <img src={icon} alt="" aria-hidden="true" />}
    </article>
  );
}
