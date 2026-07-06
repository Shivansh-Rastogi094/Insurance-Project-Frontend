import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/Plans.css";

const PLANS = [
  { name: "Term Life Gold",      type: "LIFE",   coverage: "₹50,00,000",    premium: "₹8,000/yr",  badge: "",          features: ["Death Benefit","Critical Illness Cover","Tax Benefits u/s 80C","Nominee Support"] },
  { name: "Health Shield Plus",  type: "HEALTH", coverage: "₹10,00,000",    premium: "₹12,000/yr", badge: <><i className="ph ph-fire"></i> Popular</>, features: ["Hospitalisation Cover","Cashless Treatment","Pre & Post Hospitalisation","Day-Care Procedures"] },
  { name: "Motor Protect Pro",   type: "MOTOR",  coverage: "₹15,00,000",    premium: "₹5,500/yr",  badge: "",          features: ["Own Damage Cover","Third-Party Liability","Roadside Assistance","Zero Depreciation"] },
  { name: "Platinum Life Shield",type: "LIFE",   coverage: "₹1,00,0,000",  premium: "₹22,000/yr", badge: <><i className="ph ph-star"></i> Premium</>, features: ["Comprehensive Death Benefit","Accidental Disability","Waiver of Premium","Global Coverage"] },
  { name: "Family Health Floater",type:"HEALTH", coverage: "₹25,00,000",    premium: "₹18,000/yr", badge: "",          features: ["Entire Family Covered","Maternity Benefit","New-Born Cover","Annual Health Check"] },
  { name: "Commercial Vehicle",  type: "MOTOR",  coverage: "₹30,00,000",    premium: "₹9,500/yr",  badge: "",          features: ["Commercial Fleet","Driver Cover","Goods in Transit","No-Claim Bonus"] },
];

const TYPE_COLORS = { LIFE: "#2563A8", HEALTH: "#16A34A", MOTOR: "#F59E0B" };

const Plans = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = React.useState("ALL");
  const filtered = filter === "ALL" ? PLANS : PLANS.filter(p => p.type === filter);

  return (
    <LandingLayout>
      <div className="plans-page">
        <div className="plans-inner">
          <div className="page-hero">
            <div className="ph-b1" /><div className="ph-b2" />
            <i className="page-hero-icon ph ph-clipboard"></i>
            <h1>Our Insurance Plans</h1>
            <p>Life, Health, and Motor coverage designed for every Indian family and budget.</p>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {["ALL","LIFE","HEALTH","MOTOR"].map(t => (
              <button key={t} className={`filter-tab${filter===t?" active":""}`} onClick={() => setFilter(t)}>
                {t === "ALL" ? <><i className="ph ph-globe"></i> All Plans</> : t === "LIFE" ? <><i className="ph ph-heart"></i> Life</> : t === "HEALTH" ? <><i className="ph ph-hospital"></i> Health</> : <><i className="ph ph-car"></i> Motor</>}
              </button>
            ))}
          </div>

          <div className="plans-grid">
            {filtered.map(p => (
              <div className="plan-card" key={p.name}>
                <div className="plan-top">
                  {p.badge ? <span className="plan-badge-tag">{p.badge}</span> : <span />}
                  <span className="plan-type-chip" style={{ background: `${TYPE_COLORS[p.type]}18`, color: TYPE_COLORS[p.type] }}>{p.type}</span>
                </div>
                <div className="plan-name">{p.name}</div>
                <div className="plan-coverage">{p.coverage}</div>
                <div className="plan-coverage-lbl">Max Coverage Amount</div>
                <ul className="plan-features">{p.features.map(f => <li key={f}>{f}</li>)}</ul>
                <div className="plan-premium">Starting at <span>{p.premium}</span></div>
                <button className="btn-plan-buy" onClick={() => navigate("/register")}>Buy Now →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Plans;
