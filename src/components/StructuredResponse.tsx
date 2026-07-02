import type { EvaResponse } from "@/lib/schema";

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="section">
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function TextSection({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="section">
      <h3>{title}</h3>
      <div>{text}</div>
    </div>
  );
}

export default function StructuredResponse({ data }: { data: EvaResponse }) {
  if (data.needsClarification) {
    return (
      <div>
        {data.jurisdictions.length > 0 && (
          <div className="section">
            <h3>Jurisdiction</h3>
            <div className="chips">
              {data.jurisdictions.map((j, i) => (
                <span className="chip" key={i}>
                  {j}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="section">
          <h3>More information needed</h3>
          <div className="clarify">
            <ul>
              {data.clarifyingQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
        {data.disclaimer && <div className="disclaimer">{data.disclaimer}</div>}
      </div>
    );
  }

  return (
    <div>
      {data.jurisdictions.length > 0 && (
        <div className="section">
          <h3>Jurisdiction</h3>
          <div className="chips">
            {data.jurisdictions.map((j, i) => (
              <span className="chip" key={i}>
                {j}
              </span>
            ))}
          </div>
        </div>
      )}

      <TextSection title="Summary" text={data.summary} />
      <TextSection title="Legal Context" text={data.legalContext} />

      {data.legalDomains.length > 0 && (
        <div className="section">
          <h3>Legal Domains</h3>
          <div className="chips">
            {data.legalDomains.map((d, i) => (
              <span className="chip" key={i}>
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.analysis.length > 0 && (
        <div className="section">
          <h3>Analysis</h3>
          {data.analysis.map((a, i) => (
            <div className="analysis-item" key={i}>
              <div className="issue">{a.issue}</div>
              {a.jurisdiction && <div className="jur">{a.jurisdiction}</div>}
              <div>{a.discussion}</div>
            </div>
          ))}
        </div>
      )}

      {data.risks.length > 0 && (
        <div className="section">
          <h3>Risks</h3>
          {data.risks.map((r, i) => (
            <div className="risk" key={i}>
              <span className={`badge ${r.severity}`}>{r.severity}</span>
              <div>
                <div className="rtype">{r.type}</div>
                <div className="rjust">{r.justification}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListSection title="Uncertainties" items={data.uncertainties} />
      <ListSection title="Options" items={data.options} />
      <ListSection title="Next Steps" items={data.nextSteps} />

      <div className="section">
        <h3>Confidence</h3>
        <div>
          <span className="confidence">{data.confidence}</span>
          {data.confidenceRationale && (
            <div className="rjust" style={{ marginTop: 4 }}>
              {data.confidenceRationale}
            </div>
          )}
        </div>
      </div>

      {data.disclaimer && <div className="disclaimer">{data.disclaimer}</div>}
    </div>
  );
}
