export const Card = ({ children, className }) => (
  <div className={`rounded-xl shadow p-2 ${className}`}>{children}</div>
);

export const CardContent = ({ children }) => (
  <div>{children}</div>
);