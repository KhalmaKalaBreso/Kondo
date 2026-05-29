import { activities } from "../data/mockData.js";
export default function ActivityFeed() {
  return <div className="activity-feed">{activities.map((item) => <article className="activity-item" key={item.id}><span className="activity-dot" /><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.time}</small></div></article>)}</div>;
}
