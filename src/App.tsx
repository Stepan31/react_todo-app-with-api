/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useEffect, useState } from 'react';
import { TodoList } from './Components/TodoList/TodoList';
import { Footer } from './Components/Footer/Footer';
import { ErrorMessage } from './Components/ErrorMessage/ErrorMessage';
import { Errors } from './Types/Error';
import { Todo } from './Types/Todo';
import { Filter } from './Types/Filter';

import { getTodos, deleteTodo, updateTodo } from './api/todos';

import { Header } from './Components/Header/Header';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const areAllTodosCompleted = todos.every(todo => todo.completed);
  const noCompletedTodos = todos.every(todo => !todo.completed);
  const [todosToBeDeleted, setTodosToBeDeleted] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filter, setFilter] = useState<Filter>(Filter.All);

  const handleFilter = (filteringCriteria: Filter) => {
    setFilter(filteringCriteria);
  };

  const handleErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(Errors.NoError), 3000);
  };

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        handleErrorMessage(Errors.CantLoad);
      });
  }, []);

  const handleDelete = async (id: number) => {
    setTodosToBeDeleted(prev => [...prev, id]);
    try {
      setIsLoading(true);
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? todo : { ...todo, deleted: false })),
      );
      handleErrorMessage(Errors.CantDelete);
    } finally {
      setIsLoading(false);
      setTodosToBeDeleted([]);
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const idsToDelete = completedTodos.map(todo => todo.id);

    try {
      await Promise.all(idsToDelete.map(id => handleDelete(id)));
    } catch (error) {
      handleErrorMessage(Errors.CantDelete);
    } finally {
      setTodosToBeDeleted([]);
    }
  };

  const handleAddTodoToState = (todo: Todo) => {
    setTodos(prev => [...prev, todo]);
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedTodo = await updateTodo(id, { completed });

      setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch {
      handleErrorMessage(Errors.CantUpdate);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (id: number, title: string) => {
    try {
      const updatedTodo = await updateTodo(id, { title });

      setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch {
      handleErrorMessage(Errors.CantUpdate);
    }
  };

  const handleToggleAll = async () => {
    const targetStatus = !areAllTodosCompleted;

    const todosToUpdate = todos.filter(todo => todo.completed !== targetStatus);

    try {
      const updatedTodos = await Promise.all(
        todosToUpdate.map(todo =>
          updateTodo(todo.id, { completed: targetStatus }),
        ),
      );

      setTodos(prev =>
        prev.map(
          todo => updatedTodos.find(updated => updated.id === todo.id) || todo,
        ),
      );
    } catch {
      handleErrorMessage(Errors.CantUpdate);
    }
  };

  return (
    <div className="todoapp">
      {isLoading && (
        <div className="modal overlay is-active">
          <p>Loading...</p>
        </div>
      )}
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todosToBeDeleted={todosToBeDeleted}
          areAllTodosCompleted={areAllTodosCompleted}
          handleErrorMessage={handleErrorMessage}
          handleAddTodoToState={handleAddTodoToState}
          handleToggleAll={handleToggleAll}
          setTempTodo={setTempTodo}
        />
        {!!todos.length && (
          <>
            <TodoList
              todoToBeDeleted={todosToBeDeleted}
              tempTodo={tempTodo}
              todos={todos}
              handleToggle={handleToggle}
              handleRename={handleRename}
              filter={filter}
              handleDelete={handleDelete}
            />
            <Footer
              todos={todos}
              handleFilter={handleFilter}
              filter={filter}
              noCompletedTodos={noCompletedTodos}
              handleClearCompleted={handleClearCompleted}
            />
          </>
        )}
      </div>

      <ErrorMessage errorMessageText={errorMessage} />
    </div>
  );
};
