import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  PieChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export const Landing = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container nav-container">
          <div className="landing-brand">
            <div className="brand-icon">
              <Wallet size={26} color="#6366F1" />
            </div>
            <span className="brand-name">ExpenseTracker</span>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-container hero-container">
          <div className="badge-pill">
            <Sparkles size={16} />
            <span>Smart Personal Finance Tracker</span>
          </div>
          <h1 className="hero-title">
            Take Full Control of Your <span className="gradient-text">Money & Expenses</span>
          </h1>
          <p className="hero-description">
            Track transactions, set monthly budgets, inspect analytics, and download
            reports with ease. Built with high performance, bank-grade encryption, and
            PostgreSQL security.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              <span>Start Free Today</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Existing User Login
            </Link>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#6366F120', color: '#6366F1' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Live Financial Analytics</h3>
              <p>Visual trends, donut charts, and spending heatmaps updated in real time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#EC489920', color: '#EC4899' }}>
                <PieChart size={24} />
              </div>
              <h3>Category Budgets</h3>
              <p>Set spending ceilings per category and receive alert indicators when close to limits.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#22C55E20', color: '#22C55E' }}>
                <ShieldCheck size={24} />
              </div>
              <h3>Isolated & Private</h3>
              <p>All data is bound strictly to your authenticated account with row-level ownership checks.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-container">
          <p>© {new Date().getFullYear()} ExpenseTracker full-stack application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
