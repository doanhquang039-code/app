import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import QuickAddExpense from '../components/QuickAddExpense'

export default function MainLayout() {
  return (
    <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      {/* Floating Quick Add - available on all pages */}
      <QuickAddExpense />
    </div>
  )
}
