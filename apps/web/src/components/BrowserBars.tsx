import type { BrowserSupport } from "../lib/types.js";

export function BrowserBars({ byBrowser }: { byBrowser: BrowserSupport[] }) {
  return (
    <div className="panel">
      <h3>Support by browser</h3>
      <table>
        <tbody>
          {byBrowser.map((b) => (
            <tr key={`${b.browser.id}-${b.browser.version}`}>
              <td>
                {b.browser.name} {b.browser.version}
              </td>
              <td style={{ width: "50%" }}>
                <div className="bar">
                  <span
                    style={{ width: `${Math.round(b.supportRatio * 100)}%` }}
                  />
                </div>
              </td>
              <td>{Math.round(b.supportRatio * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
