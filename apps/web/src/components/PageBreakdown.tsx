import type { PageScore } from "../lib/types.js";

export function PageBreakdown({ pages }: { pages: PageScore[] }) {
  const sorted = [...pages].sort((a, b) => b.featureCount - a.featureCount);
  return (
    <div className="panel">
      <h3>Pages analyzed ({pages.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.url}>
              <td>{p.url}</td>
              <td>{p.featureCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
