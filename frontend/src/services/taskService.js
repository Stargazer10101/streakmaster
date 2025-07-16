import axios from 'axios';

export const fetchTasksApi = async () => {
  try {
    const response = await axios.get('/api/tasks');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addTaskApi = async (name) => {
  try {
    const response = await axios.post('/api/tasks', { name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTaskApi = async (taskId) => {
  try {
    const response = await axios.delete(`/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 