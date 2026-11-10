import React, { useState } from 'react'
import { User, DollarSign, Moon, Sun, Shield, LogOut, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { formatDate } from '../utils/dates'
import Button from '../components/ui/Button'

export const Settings = () => {
  const { user, updateCurrency, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'INR')
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [currencySuccess, setCurrencySuccess] = useState(false)
  const [currencyError, setCurrencyError] = useState('')

  const handleSaveCurrency = async (e) => {
    e.preventDefault()
    setSavingCurrency(true)
    setCurrencySuccess(false)
    setCurrencyError('')
    try {
      await updateCurrency(selectedCurrency)
      setCurrencySuccess(true)
      setTimeout(() => setCurrencySuccess(false), 3000)
    } catch (err) {
      setCurrencyError(err.response?.data?.message || 'Failed to update currency')
    } finally {
      setSavingCurrency(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="page-header-row">
        <div>
          <h2>Account & App Settings</h2>
          <p className="subtitle">Manage your profile, currency preference, and theme</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="panel settings-panel">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <User size={20} className="text-primary" />
              <h3>User Profile</h3>
            </div>
          </div>
          <div className="panel-body">
            <div className="profile-details-list">
              <div className="profile-row">
                <span className="profile-label">Full Name</span>
                <span className="profile-value">{user?.name}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email Address</span>
                <span className="profile-value">{user?.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Member Since</span>
                <span className="profile-value">{formatDate(user?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Card */}
        <div className="panel settings-panel">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <DollarSign size={20} className="text-primary" />
              <h3>Currency Preference</h3>
            </div>
          </div>
          <div className="panel-body">
            <p className="settings-description">
              Choose your primary currency format for displaying all expenses, budgets, and reports.
            </p>

            {currencySuccess && (
              <div className="form-alert success">
                <Check size={16} /> Currency updated successfully!
              </div>
            )}
            {currencyError && <div className="form-alert error">{currencyError}</div>}

            <form onSubmit={handleSaveCurrency} className="currency-form">
              <div className="form-group">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="form-select"
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>
              <Button type="submit" variant="primary" size="sm" disabled={savingCurrency}>
                {savingCurrency ? 'Saving...' : 'Save Currency'}
              </Button>
            </form>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="panel settings-panel">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              {theme === 'dark' ? (
                <Moon size={20} className="text-primary" />
              ) : (
                <Sun size={20} className="text-primary" />
              )}
              <h3>Appearance</h3>
            </div>
          </div>
          <div className="panel-body">
            <p className="settings-description">
              Toggle between high-contrast Dark Mode and clean Light Mode.
            </p>
            <div className="theme-toggle-row">
              <span className="current-theme-label">
                Current theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security & Session */}
        <div className="panel settings-panel">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Shield size={20} className="text-primary" />
              <h3>Security & Session</h3>
            </div>
          </div>
          <div className="panel-body">
            <p className="settings-description">
              Tokens expire automatically after 7 days. Sign out of this session anytime.
            </p>
            <Button variant="danger" icon={LogOut} size="sm" onClick={logout}>
              Sign Out from Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
