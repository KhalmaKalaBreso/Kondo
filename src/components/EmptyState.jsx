export default function EmptyState({ icon = "/icons/notice.svg", title, description }) {
  return (
    <div className="empty-state-card">
      <img src={icon} alt="" aria-hidden="true" />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
