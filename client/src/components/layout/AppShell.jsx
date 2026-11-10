import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Modal from '../ui/Modal'
import ExpenseForm from '../expenses/ExpenseForm'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics & Trends',
  '/reports': 'Monthly Reports',
  '/settings': 'Account Settings',
}

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const location = useLocation()

  const currentTitle = routeTitles[location.pathname] || 'Expense Tracker'

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar
          title={currentTitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddExpense={() => setAddExpenseOpen(true)}
        />
        <main className="content-container">
          <Outlet context={{ openAddExpense: () => setAddExpenseOpen(true) }} />
        </main>
      </div>

      <Modal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSuccess={() => {
            setAddExpenseOpen(false)
            // Trigger custom event so any active page can refresh
            window.dispatchEvent(new CustomEvent('expense:updated'))
          }}
          onCancel={() => setAddExpenseOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default AppShell
