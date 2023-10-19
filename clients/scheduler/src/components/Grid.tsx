export default function Grid({
    children,
    columns,
    gap,
  }: {
    columns: number;
    gap?: number;
    children: React.ReactNode;
  }) {
    return (
      <div className={`grid grid-cols-${columns} gap-${gap ?? 4}`}>
        {children}
      </div>
    );
  }
