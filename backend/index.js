const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

let todos = [
  { id: '1', title: 'Herääminen', completed: false },
  { id: '2', title: 'Aamupala', completed: false },
  { id: '3', title: 'Pukeutuminen', completed: false },
  { id: '4', title: 'Koulu tai työt', completed: false },
  { id: '5', title: 'Lounas', completed: false },
  { id: '6', title: 'Liikuntaa tai ulkoilua', completed: false },
  { id: '7', title: 'Päivällinen', completed: false },
  { id: '8', title: 'Nukkumaan valmistautuminen', completed: false },
]

app.get('/', (_request, response) => {
  response.send('<h1>Päivälista API</h1>')
})

app.get('/api/todos', (_request, response) => {
  response.json(todos)
})

app.post('/api/todos', (request, response) => {
  const { title } = request.body

  if (!title || title.trim() === '') {
    return response.status(400).json({ error: 'title puuttuu' })
  }

  const todo = {
    id: String(Math.max(0, ...todos.map((item) => Number(item.id))) + 1),
    title: title.trim(),
    completed: false,
  }

  todos = todos.concat(todo)
  response.status(201).json(todo)
})

app.put('/api/todos/:id', (request, response) => {
  const todo = todos.find((item) => item.id === request.params.id)

  if (!todo) {
    return response.status(404).end()
  }

  const updatedTodo = {
    ...todo,
    title: request.body.title?.trim() || todo.title,
    completed: Boolean(request.body.completed),
  }

  todos = todos.map((item) => (item.id === todo.id ? updatedTodo : item))
  response.json(updatedTodo)
})

app.delete('/api/todos/:id', (request, response) => {
  todos = todos.filter((todo) => todo.id !== request.params.id)
  response.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
