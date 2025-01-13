/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Todo } from '../Types/Todo';
import { client } from '../utils/fetchClient';

const USER_ID = 2226;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const updateTodo = (
  id: number,
  updatedData: Partial<Todo>,
): Promise<Todo> => {
  return client.patch<Todo>(`/todos/${id}`, updatedData);
};

export const createTodo = (title: string) => {
  return client.post<Todo>('/todos', {
    id: Math.floor(Math.random() * 1000),
    userId: USER_ID,
    title,
    completed: false,
  });
};

export const deleteTodo = (id: number) => {
  return client.delete(`/todos/${id}`);
};
