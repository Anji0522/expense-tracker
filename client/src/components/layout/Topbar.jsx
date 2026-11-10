import React from 'react'
import { Menu, Sun, Moon, Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../ui/Button'

export const Topbar = ({ onToggleSidebar, onOpenAddExpense, title }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <h1 className="page-heading">{title}</h1>
      </div>

      <div className="topbar-right">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {onOpenAddExpense && (
          <Button variant="primary" size="sm" icon={Plus} onClick={onOpenAddExpense}>
            Add Expense
          </Button>
        )}
      </div>
    </header>
  )
}

export default Topbar
