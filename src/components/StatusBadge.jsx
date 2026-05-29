export default function StatusBadge({ status }) {
  const normalized = status.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
  return <span className={`status-badge ${normalized}`}>{status}</span>;
}
