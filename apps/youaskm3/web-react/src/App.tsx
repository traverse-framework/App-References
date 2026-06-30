function App() {
  const runtimeUrl = import.meta.env.VITE_TRAVERSE_RUNTIME_URL || 'http://localhost:3000'

  return (
    <main>
      <h1>youaskm3</h1>
      <p>Runtime: {runtimeUrl}</p>
    </main>
  )
}

export default App
