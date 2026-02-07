/**
 * 後台 API 服務
 * 使用 JWT Token 驗證
 * Token 儲存在 localStorage，不建立 token table
 */

// API 基礎路徑（從環境變數讀取）
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8888/api/'

// 移除末尾的斜線（如果有的話），統一格式
const normalizeApiBase = (base) => base.replace(/\/$/, '')

/**
 * 獲取儲存的 Token（從 localStorage）
 * @returns {string|null}
 */
const getToken = () => {
  return localStorage.getItem('ADMIN_TOKEN')
}

/**
 * 建立帶有認證的 Headers
 * @param {boolean} includeAuth - 是否包含 Authorization header
 * @returns {Object}
 */
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (includeAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}

/**
 * 處理 API 錯誤回應
 * @param {Response} response
 * @param {boolean} isLoginRequest - 是否為登入請求
 * @returns {Promise}
 */
const handleResponse = async (response, isLoginRequest = false) => {
  // 檢查 Content-Type 是否為 JSON
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')

  if (response.ok) {
    if (isJson) {
      return response.json()
    } else {
      throw new Error('伺服器返回格式錯誤：預期 JSON，收到 HTML')
    }
  }

  // 401 未授權 - 可能 token 過期或無效
  if (response.status === 401) {
    // 如果是登入請求的 401，不要清除 token（因為本來就沒有）
    if (isLoginRequest) {
      throw new Error('invalid_credentials')
    }

    // 其他 API 的 401，清除 token 並導向登入頁
    localStorage.removeItem('ADMIN_TOKEN')
    localStorage.removeItem('ADMIN_USER')

    // 導向登入頁
    if (window.location.pathname.split('/').pop() !== 'login') {
      window.location.href = import.meta.env.VITE_BASE +'login'
    }

    throw new Error('請重新登入')
  }

  // 其他錯誤
  let errorMessage = `${response.status} ${response.statusText}`

  if (isJson) {
    try {
      const error = await response.json()
      errorMessage = error.error || error.message || errorMessage
    } catch (e) {
      // JSON 解析失敗
    }
  } else {
    // 如果不是 JSON，可能是 PHP 錯誤頁面
    const text = await response.text()
    if (text.includes('<?php') || text.includes('<br />')) {
      errorMessage = 'PHP 腳本錯誤，請檢查後端 API'
    } else {
      errorMessage = `伺服器錯誤：${errorMessage}`
    }
  }

  throw new Error(errorMessage)
}

// 登入 API
export const authAPI = {
  /**
   * 後台登入
   * @param {Object} params
   * @param {string} params.ADMIN_ID - 管理員帳號
   * @param {string} params.ADMIN_PWD - 密碼
   * @returns {Promise}
   */
  login: async (params) => {
    const response = await fetch(`${normalizeApiBase(API_BASE)}/admin/auth_login.php`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({
        ADMIN_ID: params.ADMIN_ID,
        ADMIN_PWD: params.ADMIN_PWD,
      }),
    })

    return handleResponse(response, true) // 標記為登入請求
  },
}

// 後台帳號 API
export const adminAccountAPI = {
  /**
   * 獲取帳號列表
   * @param {Object} params
   * @param {number} params.page - 頁碼（預設 1）
   * @param {number} params.pageSize - 每頁筆數（預設 10）
   * @param {string} params.keyword - 搜尋關鍵字
   * @param {string} params.sortBy - 排序方式
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      keyword: params.keyword || '',
      sortBy: params.sortBy || '',
    })

    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/users_list.php?${queryParams}`,
      {
        method: 'GET',
        headers: createHeaders(),
      },
    )

    return handleResponse(response)
  },

  /**
   * 獲取單個帳號資料
   * @param {string} adminId - 管理員帳號
   * @returns {Promise}
   */
  getDetail: async (adminId) => {
    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/users_get.php?ADMIN_ID=${adminId}`,
      {
        method: 'GET',
        headers: createHeaders(),
      },
    )

    return handleResponse(response)
  },

  /**
   * 新增帳號
   * @param {Object} data
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await fetch(`${normalizeApiBase(API_BASE)}/admin/users_create.php`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        ADMIN_ID: data.ADMIN_ID,
        ADMIN_NAME: data.ADMIN_NAME,
        ADMIN_PWD: data.ADMIN_PWD,
        ADMIN_ROLE: data.ADMIN_ROLE,
        ADMIN_ACTIVE: data.ADMIN_ACTIVE,
      }),
    })

    return handleResponse(response)
  },

  /**
   * 更新帳號
   * @param {string} adminId - 管理員帳號
   * @param {Object} data - 要更新的資料
   * @returns {Promise}
   */
  update: async (adminId, data) => {
    const body = {
      ADMIN_NAME: data.ADMIN_NAME,
      ADMIN_ROLE: data.ADMIN_ROLE,
      ADMIN_ACTIVE: data.ADMIN_ACTIVE,
    }

    // 只有密碼有值才傳送
    if (data.ADMIN_PWD && data.ADMIN_PWD.trim() !== '') {
      body.ADMIN_PWD = data.ADMIN_PWD
    }

    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/users_update.php?ADMIN_ID=${adminId}`,
      {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify(body),
      },
    )

    return handleResponse(response)
  },
}

// 會員管理 API
export const memberAPI = {
  /**
   * 獲取會員列表
   * @param {Object} params
   * @param {number} params.page - 頁碼（預設 1）
   * @param {number} params.pageSize - 每頁筆數（預設 10）
   * @param {string} params.keyword - 搜尋關鍵字
   * @param {string} params.sortBy - 排序方式
   * @returns {Promise}
   */
  getList: async (params = {}) => {
    const { page = 1, pageSize = 10, keyword = '', sortBy = '' } = params

    const queryParams = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })

    if (keyword) queryParams.append('q', keyword)
    if (sortBy) queryParams.append('sortBy', sortBy)

    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/members_list.php?${queryParams}`,
      {
        method: 'GET',
        headers: createHeaders(true),
      },
    )

    return handleResponse(response)
  },

  /**
   * 獲取會員詳情
   * @param {number} memberId - 會員ID
   * @returns {Promise}
   */
  getDetail: async (memberId) => {
    if (!memberId) {
      throw new Error('會員ID不能為空')
    }
    
    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/members_get.php?member_id=${memberId}`,
      {
        method: 'GET',
        headers: createHeaders(true),
      },
    )

    return handleResponse(response)
  },

  /**
   * 更新會員狀態
   * @param {number} memberId - 會員ID
   * @param {number} status - 狀態（1=啟用, 0=停用）
   * @returns {Promise}
   */
  updateStatus: async (memberId, status) => {
    const response = await fetch(`${normalizeApiBase(API_BASE)}/admin/members_update_active.php`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify({
        member_id: memberId,
        member_active: status,
      }),
    })

    return handleResponse(response)
  },

  /**
   * 獲取會員捐款紀錄
   * @param {number} memberId - 會員ID
   * @returns {Promise}
   */
  getDonations: async (memberId) => {
    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/member_donations_get.php?member_id=${memberId}`,
      {
        method: 'GET',
        headers: createHeaders(true),
      },
    )

    return handleResponse(response)
  },

  /**
   * 獲取會員志工紀錄與累積時數
   * @param {number} memberId - 會員ID
   * @returns {Promise}
   */
  getVolunteers: async (memberId) => {
    const response = await fetch(
      `${normalizeApiBase(API_BASE)}/admin/member_volunteer_get.php?member_id=${memberId}`,
      {
        method: 'GET',
        headers: createHeaders(true),
      },
    )

    return handleResponse(response)
  }
}