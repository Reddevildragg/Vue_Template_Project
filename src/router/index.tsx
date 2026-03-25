import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { HomeView } from '@/views/HomeView'
import { AboutView } from '@/views/AboutView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: 'about',
        element: <AboutView />,
      },
    ],
  },
])
