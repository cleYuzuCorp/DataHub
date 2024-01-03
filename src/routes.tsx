import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages'

const AppRoutes = () => {
  const pagesContext = (require as any).context('./pages', true, /\.(tsx|jsx)$/)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {pagesContext.keys().map((modulePath: string) => {
          const module = pagesContext(modulePath)
          const pageName = modulePath.replace('./', '').replace(/\.(tsx|jsx)$/, '')
          const PageComponent = module.default || module

          return (
            <Route key={pageName} path={`/${pageName}`} element={<PageComponent />} />
          )
        })}
      </Routes>
    </Router>
  )
}

export default AppRoutes