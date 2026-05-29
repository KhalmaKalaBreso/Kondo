export default function QuickAction({ icon, title, description, onClick }) {
  return <button className="quick-action" onClick={onClick} type="button"><img src={icon} alt="" /><span><strong>{title}</strong><small>{description}</small></span></button>;
}
