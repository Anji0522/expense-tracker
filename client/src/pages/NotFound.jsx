import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../components/ui/Button'

export const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The screen or transaction page you are looking for does not exist.</p>
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
