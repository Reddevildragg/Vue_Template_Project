import { Link } from 'react-router-dom'

export function AboutView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">About View</h1>
      <p className="mb-8">This is the about page.</p>
      <nav>
        <Link to="/" className="text-blue-500 hover:underline">
          Go back Home
        </Link>
      </nav>
    </div>
  )
}
