'use client';

import { useState, useEffect } from 'react';
import { useStore, PlatformSettings, DEFAULT_SETTINGS } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { progress, updateSettings } = useStore();
  const { toast } = useToast();

  const settings = progress.settings || DEFAULT_SETTINGS;
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'branding' | 'security'>('general');

  const isAdmin = user?.role === 'admin';

  // Hydrate local state when store settings load
  useEffect(() => {
    if (progress.settings) {
      setFormData(progress.settings);
    }
  }, [progress.settings]);

  const handleChange = (key: keyof PlatformSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!isAdmin) return;
    
    // Validations
    if (!formData.platformName.trim()) {
      toast('Platform Name cannot be empty', 'error');
      return;
    }
    if (formData.passThreshold < 0 || formData.passThreshold > 100) {
      toast('Pass threshold must be between 0% and 100%', 'error');
      return;
    }
    if (!formData.orgName.trim()) {
      toast('Organization Name cannot be empty', 'error');
      return;
    }
    if (!formData.subdomain.trim()) {
      toast('Subdomain cannot be empty', 'error');
      return;
    }

    updateSettings(formData);
    toast('Platform settings updated successfully!', 'success');
  };

  // Helper Toggle Component
  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-tertiary)', padding: 14, borderRadius: 'var(--border-radius-md)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{description}</div>
      </div>
      <button
        type="button"
        disabled={!isAdmin}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? 'var(--tf-teal)' : 'var(--color-border-secondary)',
          border: 'none',
          position: 'relative',
          cursor: isAdmin ? 'pointer' : 'not-allowed',
          opacity: isAdmin ? 1 : 0.6,
          transition: 'background-color 0.2s',
          padding: 0,
          flexShrink: 0,
          marginTop: 2
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );

  // Helper Select Card Component
  const SelectCard = ({ active, title, subtitle, icon, onClick }: { active: boolean; title: string; subtitle: string; icon: string; onClick: () => void }) => (
    <div
      onClick={!isAdmin ? undefined : onClick}
      style={{
        border: `1px solid ${active ? 'var(--tf-teal)' : 'var(--color-border-secondary)'}`,
        background: active ? 'rgba(29, 158, 117, 0.04)' : 'var(--color-background-tertiary)',
        borderRadius: 'var(--border-radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isAdmin ? 'pointer' : 'default',
        opacity: !isAdmin && !active ? 0.6 : 1,
        transition: 'all 0.2s',
        flex: 1,
        minWidth: '180px',
      }}
    >
      <div style={{ color: active ? 'var(--tf-teal)' : 'var(--color-text-secondary)', fontSize: '18px', display: 'flex' }}>
        <i className={`ti ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );

  return (
    <main className="page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(216, 90, 48, 0.12)', color: 'var(--tf-orange)', border: '0.5px solid rgba(216, 90, 48, 0.2)' }}>
            System Settings Panel
          </div>
          <h1 className="page-title">Platform Configuration</h1>
          <p className="page-subtitle">
            Configure system rules, AI evaluations, white-label subdomains, and security parameters.
          </p>
        </div>
      </div>

      {/* Roster Protection Banner */}
      {!isAdmin && (
        <div style={{ background: 'rgba(186, 117, 23, 0.1)', border: '1px solid rgba(186, 117, 23, 0.25)', color: 'var(--tf-amber)', borderRadius: 'var(--border-radius-lg)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <i className="ti ti-eye" style={{ fontSize: 16 }} aria-hidden="true" />
          <span><strong>View-Only Mode:</strong> Only administrators can edit and update platform settings configuration.</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          {[
            { id: 'general', label: 'General Rules', icon: 'ti-settings' },
            { id: 'ai', label: 'AI & Proctoring', icon: 'ti-brain' },
            { id: 'branding', label: 'Branding Layout', icon: 'ti-palette' },
            { id: 'security', label: 'Security & Legal', icon: 'ti-shield-lock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md)',
                background: activeTab === tab.id ? 'var(--color-background-tertiary)' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 14, color: activeTab === tab.id ? 'var(--tf-orange)' : 'inherit' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configurations Form Panel */}
        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-settings" style={{ color: 'var(--tf-orange)' }} /> General Platform Rules
              </h3>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Platform Display Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-device-desktop" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.platformName}
                    onChange={(e) => handleChange('platformName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Verification Pass Threshold (%)</label>
                <div className="login-input-wrap">
                  <i className="ti ti-chart-bar" />
                  <input
                    type="number"
                    disabled={!isAdmin}
                    min="0"
                    max="100"
                    value={formData.passThreshold}
                    onChange={(e) => handleChange('passThreshold', parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' }}>
                  The minimum percentage score required for a student assessment to clear and mint a verified credential badge.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-brain" style={{ color: 'var(--tf-orange)' }} /> Evaluation AI Engine & Proctoring
              </h3>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>AI Evaluation LLM Model</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { model: 'gpt-4o', label: 'GPT-4o Omnimodal', sub: 'High accuracy coding & NLP', icon: 'ti-sparkles' },
                    { model: 'gpt-4-turbo', label: 'GPT-4 Turbo', sub: 'Balanced logic speed', icon: 'ti-bolt' },
                    { model: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', sub: 'Massive context grader', icon: 'ti-award' }
                  ].map((item) => (
                    <SelectCard
                      key={item.model}
                      active={formData.aiModel === item.model}
                      title={item.label}
                      subtitle={item.sub}
                      icon={item.icon}
                      onClick={() => handleChange('aiModel', item.model)}
                    />
                  ))}
                </div>
              </div>

              <ToggleSwitch
                checked={formData.irtEnabled}
                onChange={(v) => handleChange('irtEnabled', v)}
                label="Adaptive IRT Grading Algorithm"
                description="Automatically scale challenge question difficulty dynamically based on real-time candidate answers."
              />

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Proctoring Sensitivity Level</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { level: 'low', label: 'Basic Monitoring', sub: 'Flags multiple tab changes', icon: 'ti-eye-off' },
                    { level: 'medium', label: 'Standard Proctoring', sub: 'Flags tab changes + window loss', icon: 'ti-eye' },
                    { level: 'high', label: 'High Security (Webcam)', sub: 'Liveness proctoring + face checks', icon: 'ti-camera' }
                  ].map((item) => (
                    <SelectCard
                      key={item.level}
                      active={formData.proctoringLevel === item.level}
                      title={item.label}
                      subtitle={item.sub}
                      icon={item.icon}
                      onClick={() => handleChange('proctoringLevel', item.level)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-palette" style={{ color: 'var(--tf-orange)' }} /> White-Label Branding Layout
              </h3>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>White-Label Organization Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-building" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.orgName}
                    onChange={(e) => handleChange('orgName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Custom Portal Subdomain</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="login-input-wrap" style={{ flex: 1 }}>
                    <i className="ti ti-link" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.subdomain}
                      onChange={(e) => handleChange('subdomain', e.target.value)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>.talentforge.in</span>
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Primary Theme Accent Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--border-radius-md)', background: formData.themeColor, border: '1px solid var(--color-border-secondary)', flexShrink: 0 }} />
                  <div className="login-input-wrap" style={{ flex: 1 }}>
                    <i className="ti ti-color-swatch" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.themeColor}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      placeholder="#1D9E75"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-shield-lock" style={{ color: 'var(--tf-orange)' }} /> Security & DPDP Compliance
              </h3>

              <ToggleSwitch
                checked={formData.dpdpEnabled}
                onChange={(v) => handleChange('dpdpEnabled', v)}
                label="DPDP Act 2023 Compliance Mode"
                description="Enforce strict local user data residency limits, require dynamic cookie consent on sign-in, and auto-delete inactive grading logs after 90 days."
              />

              <ToggleSwitch
                checked={formData.soc2Enabled}
                onChange={(v) => handleChange('soc2Enabled', v)}
                label="SOC 2 Audit Trail Logging"
                description="Maintain cryptographic event logs for all administrative operations, team additions, role changes, and API overrides."
              />

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>NFT Minting Solidity Gas Limit</label>
                <div className="login-input-wrap">
                  <i className="ti ti-flame" />
                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={formData.gasLimit}
                    onChange={(e) => handleChange('gasLimit', parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' }}>
                  The safety gas ceiling configuration passed to Polygon blockchain nodes during batch Soulbound token (SBT) minting operations.
                </span>
              </div>
            </div>
          )}

          {/* Form Save Button Footer */}
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 16 }}>
              <button
                type="button"
                className="theme-btn"
                onClick={handleSave}
                style={{
                  background: 'var(--tf-orange)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />
                Save Configurations
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
