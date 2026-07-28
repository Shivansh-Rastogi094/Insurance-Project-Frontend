import React, { useState, useEffect, useCallback } from 'react';
import { calculateAutomaticPremium } from '../services/PremiumCalculatorService';

const PremiumCalculatorWidget = ({ onSelectCalculatedPlan }) => {
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [durationYears, setDurationYears] = useState(5);
  const [productType, setProductType] = useState('LIFE');
  const [premiumType, setPremiumType] = useState('ANNUAL');
  const [age, setAge] = useState(30);
  const [isSmoker, setIsSmoker] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const performCalculation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await calculateAutomaticPremium({
        coverageAmount: Number(coverageAmount),
        durationYears: Number(durationYears),
        productType,
        premiumType,
        age: Number(age),
        isSmoker
      });
      setResult(res);
    } catch (err) {
      console.error('Error calculating premium:', err);
    } finally {
      setLoading(false);
    }
  }, [coverageAmount, durationYears, productType, premiumType, age, isSmoker]);


  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation();
    }, 250);
    return () => clearTimeout(timer);
  }, [performCalculation]);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(37, 99, 168, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          <i className="ph ph-calculator"></i>
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Automatic Policy Premium Calculator</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Dynamically compute your exact policy installment & term costs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Product Category & Premium Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Policy Category</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="LIFE">Life Insurance</option>
                <option value="HEALTH">Health Insurance</option>
                <option value="MOTOR">Motor Insurance</option>
                <option value="TRAVEL">Travel Insurance</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Payment Frequency</label>
              <select
                value={premiumType}
                onChange={(e) => setPremiumType(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="ANNUAL">Annual (100% per yr)</option>
                <option value="HALF_YEARLY">Half-Yearly (55% x 2)</option>
                <option value="QUARTERLY">Quarterly (27.5% x 4)</option>
              </select>
            </div>
          </div>

          {/* Coverage Amount Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>Coverage Insured (Sum Assured)</label>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                ₹{Number(coverageAmount).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="10000000"
              step="50000"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>₹50,000</span>
              <span>₹50 Lakhs</span>
              <span>₹1 Crore</span>
            </div>
          </div>

          {/* Duration & Age Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Term Duration ({durationYears} Year{durationYears > 1 ? 's' : ''})</label>
              <input
                type="number"
                min="1"
                max="40"
                value={durationYears}
                onChange={(e) => setDurationYears(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Applicant Age ({age} Yrs)</label>
              <input
                type="number"
                min="18"
                max="85"
                value={age}
                onChange={(e) => setAge(Math.max(18, Number(e.target.value)))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Smoker Status Toggle (Only for LIFE & HEALTH) */}
          {productType === 'LIFE' || productType === 'HEALTH' ? (
            <div style={{ background: isSmoker ? 'rgba(239, 68, 68, 0.06)' : 'var(--surface)', border: isSmoker ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: isSmoker ? '#EF4444' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ph ph-warning-octagon"></i> Smoker Risk Loading
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={isSmoker}
                    onChange={(e) => setIsSmoker(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Is Smoker (+15% to +75%)</span>
                </div>
              </label>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              ℹ️ Tobacco / Smoker surcharge is Not Applicable for {productType} Insurance.
            </div>
          )}
        </div>



        {/* Calculation Result Summary Column */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Calculating optimal premium...
            </div>
          ) : result ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculated Premium</span>
                <span style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                  AUTO-CALCULATED
                </span>
              </div>

              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                ₹{result.calculatedPremium?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>
                  / {premiumType === 'ONE_TIME' ? 'one-time' : 'year'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Risk Premium:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{result.riskPremium?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>+ Loading Charges (Age & Admin):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>+ ₹{result.loadingCharges?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>- Savings & Discounts:</span>
                  <span style={{ color: '#16a34a', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>- ₹{result.discounts?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', margin: '4px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Paid Over Term:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>₹{result.totalPremiumPaidOverTerm?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Product Rate:</span>
                  <span>{result.baseRatePercentage}% / yr</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: 'rgba(37, 99, 168, 0.05)', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: 'var(--primary-light)', lineHeight: 1.4 }}>
                <i className="ph ph-info" style={{ marginRight: '4px' }}></i>
                {result.breakdownSummary}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PremiumCalculatorWidget;
