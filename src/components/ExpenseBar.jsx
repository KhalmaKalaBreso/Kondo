export default function ExpenseBar({ item }) {
  return (
    <div className="expense-row">
      <div className="expense-info"><strong>{item.category}</strong><span>{item.description}</span></div>
      <div className="expense-chart"><div className="expense-bar"><span style={{ width: `${item.percentage}%` }} /></div><div className="expense-numbers"><strong>{item.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><span>{item.percentage}%</span></div></div>
    </div>
  );
}
