import { useState } from "react";
import { ArrowDown, ChevronDown, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PageIntro, ButtonLink } from "../components/Common";
import { mortgage, currency } from "../logic";
function Calculator() {
  const [values, setValues] = useState({
    price: 100000000,
    deposit: 20000000,
    rate: 18,
    years: 20,
    fees: 0,
  });
  const update = (key: keyof typeof values, value: number) =>
    setValues({ ...values, [key]: value });
  let result;
  let error = "";
  try {
    result = mortgage(
      values.price,
      values.deposit,
      values.rate,
      values.years,
      values.fees,
    );
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="calculator" id="calculator">
      <div>
        <p className="eyebrow">PLAN WITH A LITTLE MORE CLARITY</p>
        <h2>Make room for the numbers.</h2>
        <p>Adjust the details to explore a fixed-rate repayment estimate.</p>
        <div className="calculator-inputs">
          {(
            [
              ["price", "Property price (₦)"],
              ["deposit", "Deposit amount (₦)"],
              ["years", "Loan term (years)"],
              ["fees", "Additional fees (₦)"],
            ] as const
          ).map(([k, t]) => (
            <label key={k}>
              {t}
              <input
                type="number"
                min="0"
                max={k === "years" ? 50 : undefined}
                value={values[k]}
                onChange={(e) => update(k, +e.target.value)}
              />
            </label>
          ))}
          <label className="full-width">
            Annual interest rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={values.rate}
              onChange={(e) => update("rate", +e.target.value)}
            />
            <input
              aria-label="Annual interest rate slider"
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={Math.min(Math.max(values.rate, 0), 100)}
              onChange={(e) => update("rate", +e.target.value)}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </div>
      <div className="calculator-result" aria-live="polite">
        {result ? (
          <>
            <p className="eyebrow">ESTIMATED MONTHLY REPAYMENT</p>
            <strong data-testid="monthly-payment">
              {currency(result.monthly)}
            </strong>
            <div className="repayment-totals">
              <span>
                Loan principal<b>{currency(result.principal)}</b>
              </span>
              <span>
                Total interest<b>{currency(result.interest)}</b>
              </span>
              <span>
                Additional fees<b>{currency(result.fees)}</b>
              </span>
              <span>
                Total repayment, including fees<b>{currency(result.total)}</b>
              </span>
            </div>
            <div
              className="chart"
              role="img"
              aria-label="Estimated remaining loan balance by year"
            >
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={result.schedule}>
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => currency(Number(v))} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#cd5708"
                    fill="#f5ddc9"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <details>
              <summary>
                View annual repayment schedule <ChevronDown size={15} />
              </summary>
              <div className="schedule">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Remaining</th>
                      <th>Interest paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((s) => (
                      <tr key={s.year}>
                        <td>{s.year}</td>
                        <td>{currency(s.balance)}</td>
                        <td>{currency(s.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <p>Update the figures to see your estimate.</p>
        )}
        <p className="fine">
          Illustration only. Assumes monthly payments and a constant interest
          rate. Fees are separate and not financed. This is not a mortgage offer
          or personalised financial advice.
        </p>
      </div>
    </div>
  );
}
export default function Mortgage() {
  return (
    <>
      <PageIntro
        eyebrow="A LITTLE KNOWLEDGE. A CLEARER NEXT STEP."
        title="Understanding your mortgage"
      >
        <p>
          A home is personal. Financing it should be understandable.
          <br />
          Explore the basics, then see what the numbers could look like.
        </p>
        <a className="button" href="#calculator">
          Explore the calculator <ArrowDown size={17} />
        </a>
      </PageIntro>
      <section className="wrap">
        <div className="mortgage-basics">
          <div>
            <p className="eyebrow">THE BUILDING BLOCKS</p>
            <h2>
              A mortgage,
              <br />
              <em>without the mystery.</em>
            </h2>
            <p>
              A mortgage is a loan used to finance a property, generally secured
              against that property. Your repayment depends on the amount
              borrowed, the rate and the length of the loan.
            </p>
            <div className="notice">
              Introductory video coming soon. A verified, captioned video has
              not been supplied. Start with the written guide here.
            </div>
          </div>
          <div className="accordions">
            {[
              [
                "Deposit & loan-to-value",
                "Your deposit is the amount you contribute upfront. Loan-to-value compares the amount borrowed with the property value. A larger deposit generally reduces the amount you need to finance.",
              ],
              [
                "Interest: fixed or variable?",
                "A fixed rate stays the same for an agreed period. A variable rate may change, affecting repayments. Ask a lender how and when rates can change.",
              ],
              [
                "Tenure & monthly repayments",
                "A longer term spreads payments over more months. It may reduce a monthly payment while increasing total interest. Compare both figures.",
              ],
              [
                "Closing costs & extra fees",
                "Ask for a written cost breakdown covering lender charges and any relevant legal, valuation, insurance or transaction costs.",
              ],
              [
                "The application process",
                "Prepare income and identity information, compare lender terms, obtain independent advice and complete any required property assessment. Lender approval is separate from a property enquiry.",
              ],
            ].map(([t, b]) => (
              <details key={t}>
                <summary>
                  {t}
                  <Plus size={17} />
                </summary>
                <p>{b}</p>
              </details>
            ))}
          </div>
        </div>
        <Calculator />
        <section className="section narrow">
          <p className="eyebrow">A FEW COMMON QUESTIONS</p>
          <h2>A little more clarity.</h2>
          {[
            [
              "Can I use this as an approval?",
              "No. The calculator is an illustration. A lender must assess eligibility, property suitability and final terms.",
            ],
            [
              "Does the estimate include all costs?",
              "Only the additional fees you enter are included in total repayment. Confirm all transaction and recurring costs separately.",
            ],
            [
              "What if the rate changes?",
              "This calculator assumes a constant rate. Change the interest input to explore a different scenario and speak to a qualified adviser.",
            ],
          ].map(([t, b]) => (
            <details key={t}>
              <summary>
                {t}
                <Plus size={17} />
              </summary>
              <p>{b}</p>
            </details>
          ))}
          <ButtonLink to="/contact?type=Mortgage">
            Speak to a mortgage advisor
          </ButtonLink>
        </section>
      </section>
    </>
  );
}
