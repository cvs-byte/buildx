import { type ReactNode } from 'react';

export interface Column<T> {
  header?: string;
  title?: string;
  key?: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  isLoading = false,
}: TableProps<T>) {
  const getKey = (row: T, index: number): string => {
    if (keyExtractor) return keyExtractor(row);
    const item = row as any;
    return item.id || item.userId || item._id || item.key || String(index);
  };

  if (isLoading) {
    return (
      <div className="ag-table-loading">
        <div className="ag-spinner"></div>
        <p>Loading table records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="ag-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="ag-table-container">
      <table className="ag-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={col.key || index} className={col.className}>
                {col.header || col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={getKey(row, rowIndex)}>
              {columns.map((col, colIndex) => {
                let content: ReactNode = null;
                if (col.render) {
                  content = col.render(row);
                } else if (typeof col.accessor === 'function') {
                  content = col.accessor(row);
                } else if (col.accessor) {
                  content = row[col.accessor] as unknown as ReactNode;
                }
                return (
                  <td key={col.key || colIndex} className={col.className}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
