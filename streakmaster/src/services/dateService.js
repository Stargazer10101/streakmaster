import axios from 'axios';

export const fetchDatesApi = async (taskId) => {
  try {
    const response = await axios.get('/api/dates', { params: { taskId } });
    return response.data.dates;
  } catch (error) {
    throw error;
  }
};

export const updateDateApi = async (taskId, date) => {
  try {
    const response = await axios.post('/api/dates', { taskId, date });
    return response.data.dates;
  } catch (error) {
    throw error;
  }
}; 