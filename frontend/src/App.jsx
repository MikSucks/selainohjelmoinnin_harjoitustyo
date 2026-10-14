import { useEffect, useState } from 'react'
import todoService from './services/todos'

const filters = [
  { key: 'all', label: 'Kaikki' },
  { key: 'active', label: 'Tekemättä' },
  { key: 'completed', label: 'Tehty' },
]

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTodos() {
      try {
        setTodos(await todoService.getAll())
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const remainingCount = todos.filter((todo) => !todo.completed).length

  async function addTodo(event) {
    event.preventDefault()
    const title = newTodo.trim()

    if (!title) return

    try {
      const createdTodo = await todoService.create({ title })
      setTodos((currentTodos) => [...currentTodos, createdTodo])
      setNewTodo('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function toggleTodo(todo) {
    try {
      const updatedTodo = await todoService.update(todo.id, {
        ...todo,
        completed: !todo.completed,
      })
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item.id === todo.id ? updatedTodo : item)),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteTodo(id) {
    try {
      await todoService.remove(id)
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">OMA TEHTÄVÄLISTA</p>
          <h1>TODO</h1>
          <p className="intro">Päivän askareet</p>
        </div>
        <div className="progress-summary" aria-label={`${remainingCount} tehtävää tekemättä`}>
          <span className="summary-number">{remainingCount}</span>
          <span> tehtävää tekemättä</span>
        </div>
      </header>

      <section className="todo-panel" aria-labelledby="todo-heading">
        <h2 id="todo-heading">Lisää tehtävä</h2>
        <form className="todo-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="new-todo">Uusi tehtävä </label>
          <input
            id="new-todo"
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Mitä haluat tehdä tänään?"
            maxLength="120"
          />
          <button type="submit">Lisää tehtävä</button>
        </form>
      </section>

      {error && <p role="alert">{error}</p>}

      <section className="list-section" aria-labelledby="list-heading">
        <div className="list-heading-row">
          <div>
            <p className="eyebrow">TÄNÄÄN</p>
            <h2 id="list-heading">Tehtäväsi</h2>
          </div>
          <span className="todo-count">{todos.length} {todos.length === 1 ? 'tehtävä' : 'tehtävää'}</span>
        </div>

        <div className="filter-tabs" role="group" aria-label="Suodata tehtäviä">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={filter === item.key ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Ladataan tehtäviä...</p>
        ) : visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <li className={todo.completed ? 'todo-item completed' : 'todo-item'} key={todo.id}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  <span className="checkmark" aria-hidden="true"></span>
                  <span className="todo-title">{todo.title}</span>
                </label>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Poista tehtävä: ${todo.title}`}
                  title="Poista tehtävä"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">✓</span>
            <h3>{todos.length === 0 ? 'Lista odottaa ensimmäistä tehtävääsi' : 'Tässä näkymässä ei ole tehtäviä'}</h3>
            <p>{todos.length === 0 ? 'Kirjoita yllä olevaan kenttään päivän ensimmäinen tehtävä.' : 'Vaihda suodatinta nähdäksesi muut tehtävät.'}</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
