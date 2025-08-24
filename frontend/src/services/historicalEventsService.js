import axiosInstance from "src/utils/axios"

import { MS_EVENTS } from 'src/config-global';


const historicalEventService = {
  getTopEventsByDate: async (date) => {
    const response = await axiosInstance.get(`${MS_EVENTS}/events/top?date=${date}`)
    return response.data
  },
}

export default historicalEventService
