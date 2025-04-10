'use client';

import { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../lib/api';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const newTodo = await createTodo(newTodoTitle);
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      const updatedTodo = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  }

  async function handleDeleteTodo(id: string) {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleAddTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new todo"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              className="h-5 w-5"
            />
            <span className={todo.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}>
              {todo.title}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-gray-500 text-center">No todos yet. Add one above!</p>
      )}
    </div>
  );
} 