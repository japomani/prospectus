import { useEffect, useState } from 'react';
import { getConfig, putConfig } from '../lib/api.js';
import {
  DEFAULT_LICENSE_CONFIG,
  DEFAULT_PROSPECTUS_CONFIG,
  DEFAULT_SMS_CONFIG,
  DEFAULT_SMS_VOLUME_BREAKPOINTS,
  mergeLicenseConfig,
  mergeProspectusConfig,
  mergeSmsConfig,
} from '../lib/smsCredits.js';

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function SmsField({ label, defaultHint, value, onChange, step = 'any' }) {
  return (
    <div className="form-group">
      <label>
        {label}
        {defaultHint != null && (
          <span className="pricing-muted">
            {' '}
            (
            {defaultHint}
            )
          </span>
        )}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </div>
  );
}

export default function AdminSettings({ onConfigSaved }) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const remote = await getConfig();
        if (cancelled) return;
        setDraft({
          license: mergeLicenseConfig(remote?.license),
          sms: mergeSmsConfig(remote?.sms),
          prospectus: mergeProspectusConfig(remote?.prospectus),
        });
      } catch (err) {
        if (cancelled) return;
        setDraft({
          license: mergeLicenseConfig(DEFAULT_LICENSE_CONFIG),
          sms: mergeSmsConfig(DEFAULT_SMS_CONFIG),
          prospectus: mergeProspectusConfig(DEFAULT_PROSPECTUS_CONFIG),
        });
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function updateSms(field, value) {
    setDraft(prev => ({
      ...prev,
      sms: { ...prev.sms, [field]: value },
    }));
  }

  function updateLicenseTier(school, field, value) {
    setDraft(prev => ({
      ...prev,
      license: {
        ...prev.license,
        [school]: { ...prev.license[school], [field]: value },
      },
    }));
  }

  function updateBreakpoint(index, field, value) {
    setDraft(prev => {
      const rows = [...(prev.sms.volumeBreakpoints || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, sms: { ...prev.sms, volumeBreakpoints: rows } };
    });
  }

  function addBreakpoint() {
    setDraft(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        volumeBreakpoints: [
          ...(prev.sms.volumeBreakpoints || []),
          { creditsMo: 0, pctOfList: 1 },
        ],
      },
    }));
  }

  function removeBreakpoint(index) {
    setDraft(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        volumeBreakpoints: (prev.sms.volumeBreakpoints || []).filter((_, i) => i !== index),
      },
    }));
  }

  function updateProspectus(field, value) {
    setDraft(prev => ({
      ...prev,
      prospectus: { ...prev.prospectus, [field]: value },
    }));
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        license: {
          traditional: {
            perStudent: num(draft.license.traditional.perStudent, 5),
            minimum: num(draft.license.traditional.minimum, 3000),
          },
          online: {
            perStudent: num(draft.license.online.perStudent, 6.5),
            minimum: num(draft.license.online.minimum, 3900),
          },
          districtMinimum: num(draft.license.districtMinimum, 6000),
        },
        sms: {
          ...draft.sms,
          carrierFeePerSegment: num(draft.sms.carrierFeePerSegment),
          awsFeePerSegment: num(draft.sms.awsFeePerSegment),
          avgSegmentsPerMessage: num(draft.sms.avgSegmentsPerMessage, 1.3),
          markupMultiple: num(draft.sms.markupMultiple, 3.35),
          accountsServed: num(draft.sms.accountsServed, 5),
          roundToNearest: num(draft.sms.roundToNearest, 100),
          defaultActiveMonths: num(draft.sms.defaultActiveMonths, 10),
          defaultTeachersPerStudent: num(draft.sms.defaultTeachersPerStudent, 7),
          defaultMsgsPerTeacherStudentMo: num(draft.sms.defaultMsgsPerTeacherStudentMo, 5),
          brandRegistration: num(draft.sms.brandRegistration),
          publicProfitAuth: num(draft.sms.publicProfitAuth),
          campaignVetting: num(draft.sms.campaignVetting),
          brandVettingOptional: num(draft.sms.brandVettingOptional),
          monthlyCampaignFee: num(draft.sms.monthlyCampaignFee),
          tenDlcLeasePerNumber: num(draft.sms.tenDlcLeasePerNumber),
          tenDlcNumbers: num(draft.sms.tenDlcNumbers),
          amortizeMonths: num(draft.sms.amortizeMonths, 12),
          volumeBreakpoints: (draft.sms.volumeBreakpoints || [])
            .map(b => ({
              creditsMo: num(b.creditsMo),
              pctOfList: num(b.pctOfList, 1),
            }))
            .sort((a, b) => a.creditsMo - b.creditsMo),
        },
        prospectus: {
          preparedByName: String(draft.prospectus.preparedByName || '').trim()
            || DEFAULT_PROSPECTUS_CONFIG.preparedByName,
          preparedByTitle: String(draft.prospectus.preparedByTitle || '').trim()
            || DEFAULT_PROSPECTUS_CONFIG.preparedByTitle,
        },
      };
      const saved = await putConfig(payload);
      const next = {
        license: mergeLicenseConfig(saved?.license || payload.license),
        sms: mergeSmsConfig(saved?.sms || payload.sms),
        prospectus: mergeProspectusConfig(saved?.prospectus || payload.prospectus),
      };
      setDraft(next);
      setSuccess('Config saved.');
      onConfigSaved?.(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !draft) {
    return <p className="pricing-muted">Loading admin config…</p>;
  }

  const sms = draft.sms;
  const d = DEFAULT_SMS_CONFIG;

  return (
    <div className="admin-settings">
      <div className="card">
        <div className="card-title">Prospectus defaults</div>
        <p className="pricing-hint">
          Default &ldquo;Prepared by&rdquo; name and title for new quotes and the cover page when a quote leaves them blank.
        </p>
        <div className="admin-grid">
          <div className="form-group">
            <label>
              Prepared by — Name
              <span className="pricing-muted">
                {' '}
                (
                {DEFAULT_PROSPECTUS_CONFIG.preparedByName}
                )
              </span>
            </label>
            <input
              type="text"
              value={draft.prospectus.preparedByName}
              onChange={e => updateProspectus('preparedByName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Prepared by — Title
              <span className="pricing-muted">
                {' '}
                (
                {DEFAULT_PROSPECTUS_CONFIG.preparedByTitle}
                )
              </span>
            </label>
            <input
              type="text"
              value={draft.prospectus.preparedByTitle}
              onChange={e => updateProspectus('preparedByTitle', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">License pricing</div>
        <p className="pricing-hint">
          Per-student rates and minimums used by the quote calculator. Changes apply to new edits immediately; saved quotes keep their snapshots.
        </p>
        <div className="admin-grid">
          <SmsField
            label="Online per student"
            defaultHint={`$${DEFAULT_LICENSE_CONFIG.online.perStudent}`}
            value={draft.license.online.perStudent}
            onChange={v => updateLicenseTier('online', 'perStudent', v)}
          />
          <SmsField
            label="Online minimum"
            defaultHint={`$${DEFAULT_LICENSE_CONFIG.online.minimum}`}
            value={draft.license.online.minimum}
            onChange={v => updateLicenseTier('online', 'minimum', v)}
          />
          <SmsField
            label="Traditional per student"
            defaultHint={`$${DEFAULT_LICENSE_CONFIG.traditional.perStudent}`}
            value={draft.license.traditional.perStudent}
            onChange={v => updateLicenseTier('traditional', 'perStudent', v)}
          />
          <SmsField
            label="Traditional minimum"
            defaultHint={`$${DEFAULT_LICENSE_CONFIG.traditional.minimum}`}
            value={draft.license.traditional.minimum}
            onChange={v => updateLicenseTier('traditional', 'minimum', v)}
          />
          <SmsField
            label="District / university minimum"
            defaultHint={`$${DEFAULT_LICENSE_CONFIG.districtMinimum}`}
            value={draft.license.districtMinimum}
            onChange={v => setDraft(prev => ({
              ...prev,
              license: { ...prev.license, districtMinimum: v },
            }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">SMS cost basis (customer pricing)</div>
        <div className="admin-grid">
          <SmsField
            label="Blended carrier fee per segment"
            defaultHint={`$${d.carrierFeePerSegment}`}
            value={sms.carrierFeePerSegment}
            onChange={v => updateSms('carrierFeePerSegment', v)}
            step="0.00001"
          />
          <SmsField
            label="AWS End User Messaging fee per segment"
            defaultHint={`$${d.awsFeePerSegment}`}
            value={sms.awsFeePerSegment}
            onChange={v => updateSms('awsFeePerSegment', v)}
            step="0.00001"
          />
          <SmsField
            label="Average segments per message"
            defaultHint={d.avgSegmentsPerMessage}
            value={sms.avgSegmentsPerMessage}
            onChange={v => updateSms('avgSegmentsPerMessage', v)}
            step="0.1"
          />
          <SmsField
            label="Markup multiple"
            defaultHint={d.markupMultiple}
            value={sms.markupMultiple}
            onChange={v => updateSms('markupMultiple', v)}
            step="0.01"
          />
          <SmsField
            label="Round to nearest (credits/mo)"
            defaultHint={d.roundToNearest}
            value={sms.roundToNearest}
            onChange={v => updateSms('roundToNearest', v)}
            step="1"
          />
          <SmsField
            label="Default active months / year"
            defaultHint={d.defaultActiveMonths}
            value={sms.defaultActiveMonths}
            onChange={v => updateSms('defaultActiveMonths', v)}
            step="1"
          />
          <SmsField
            label="Default teachers per student"
            defaultHint={d.defaultTeachersPerStudent}
            value={sms.defaultTeachersPerStudent}
            onChange={v => updateSms('defaultTeachersPerStudent', v)}
            step="0.1"
          />
          <SmsField
            label="Default msgs per teacher per student / month"
            defaultHint={d.defaultMsgsPerTeacherStudentMo}
            value={sms.defaultMsgsPerTeacherStudentMo}
            onChange={v => updateSms('defaultMsgsPerTeacherStudentMo', v)}
            step="0.1"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">SMS volume discount table</div>
        <p className="pricing-hint">
          Breakpoints are credits/month ≥ → % of list. MATCH uses the largest breakpoint ≤ monthly credits.
        </p>
        <div className="admin-breakpoints">
          <div className="admin-bp-header">
            <span>Credits/mo ≥</span>
            <span>% of list</span>
            <span />
          </div>
          {(sms.volumeBreakpoints || []).map((row, index) => (
            <div className="admin-bp-row" key={`${row.creditsMo}-${index}`}>
              <input
                type="number"
                value={row.creditsMo}
                onChange={e => updateBreakpoint(index, 'creditsMo', Number(e.target.value))}
              />
              <input
                type="number"
                step="0.01"
                value={row.pctOfList}
                onChange={e => updateBreakpoint(index, 'pctOfList', Number(e.target.value))}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => removeBreakpoint(index)}
                disabled={(sms.volumeBreakpoints || []).length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="admin-actions-row">
          <button type="button" className="btn btn-secondary btn-sm" onClick={addBreakpoint}>
            Add breakpoint
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => updateSms(
              'volumeBreakpoints',
              DEFAULT_SMS_VOLUME_BREAKPOINTS.map(b => ({ ...b })),
            )}
          >
            Reset table to defaults
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">SMS overhead (admin / margin only — never on customer quote)</div>
        <div className="admin-grid">
          <SmsField
            label="Brand registration"
            defaultHint={`$${d.brandRegistration}`}
            value={sms.brandRegistration}
            onChange={v => updateSms('brandRegistration', v)}
          />
          <SmsField
            label="Public-profit auth"
            defaultHint={`$${d.publicProfitAuth}`}
            value={sms.publicProfitAuth}
            onChange={v => updateSms('publicProfitAuth', v)}
          />
          <SmsField
            label="Campaign vetting"
            defaultHint={`$${d.campaignVetting}`}
            value={sms.campaignVetting}
            onChange={v => updateSms('campaignVetting', v)}
          />
          <SmsField
            label="Brand vetting (optional)"
            defaultHint={`$${d.brandVettingOptional}`}
            value={sms.brandVettingOptional}
            onChange={v => updateSms('brandVettingOptional', v)}
          />
          <SmsField
            label="Monthly campaign fee"
            defaultHint={`$${d.monthlyCampaignFee}`}
            value={sms.monthlyCampaignFee}
            onChange={v => updateSms('monthlyCampaignFee', v)}
          />
          <SmsField
            label="10DLC lease per number"
            defaultHint={`$${d.tenDlcLeasePerNumber}`}
            value={sms.tenDlcLeasePerNumber}
            onChange={v => updateSms('tenDlcLeasePerNumber', v)}
          />
          <SmsField
            label="Numbers leased"
            defaultHint={d.tenDlcNumbers}
            value={sms.tenDlcNumbers}
            onChange={v => updateSms('tenDlcNumbers', v)}
          />
          <SmsField
            label="Amortize months"
            defaultHint={d.amortizeMonths}
            value={sms.amortizeMonths}
            onChange={v => updateSms('amortizeMonths', v)}
          />
          <SmsField
            label="Accounts served (overhead allocation)"
            defaultHint={d.accountsServed}
            value={sms.accountsServed}
            onChange={v => updateSms('accountsServed', v)}
          />
        </div>
      </div>

      {error && <p className="pricing-error">{error}</p>}
      {success && <p className="pricing-success">{success}</p>}
      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save config'}
      </button>
    </div>
  );
}
