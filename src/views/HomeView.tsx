import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { increment, decrement } from '@/stores/counterSlice'

export function HomeView() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Home View</h1>
      <p className="mb-4">Welcome to your new React + Vite + Tailwind CSS 4 project!</p>

      <div className="flex items-center gap-4 mb-8">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className="text-2xl font-bold">{count}</span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>

      <nav>
        <Link to="/about" className="text-blue-500 hover:underline">
          Go to About
        </Link>
      </nav>
    </div>
  )
}
