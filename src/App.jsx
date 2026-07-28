import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import PageLoader from './components/PageLoader'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy Load Page Routes for Code Splitting & Faster Initial PWA Load Time
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Timetable = lazy(() => import('./pages/Timetable'))
const Notes = lazy(() => import('./pages/Notes'))
const Settings = lazy(() => import('./pages/Settings'))

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
