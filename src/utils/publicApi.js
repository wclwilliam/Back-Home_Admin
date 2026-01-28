import axios from 'axios'

export const base = import.meta.env.BASE_URL
export const APIBase = import.meta.env.VITE_API_BASE

export const publicApi = axios.create({
  baseURL: base,
  timeout: 5000,
})

export const backHomeApi = axios.create({
  baseURL: APIBase,
  timeout: 5000,
})

