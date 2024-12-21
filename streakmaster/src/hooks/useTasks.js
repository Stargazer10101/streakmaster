import { useState, useCallback, useEffect } from 'react';
import { fetchTasksApi, addTaskApi, deleteTaskApi } from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTasksApi();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(async (name) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await addTaskApi(name);
      setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (err) {
      setError(err.message || 'Failed to add task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteTaskApi(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    deleteTask,
    fetchTasks
  };
}; 