/**
 * 後台 API 服務
 */

// 登入 API
export const authAPI = {
  /**
   * 後台登入
   * @param {Object} params
   * @param {string} params.admin_id - 管理員帳號
   * @param {string} params.password - 密碼
   * @returns {Promise}
   */
  login: async (params) => {
    const response = await fetch('/API/admin/auth_login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_id: params.admin_id,
        password: params.password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
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

    const response = await fetch(`/API/admin/users_list.php?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * 獲取單個帳號資料
   * @param {string} admin_id - 管理員帳號
   * @returns {Promise}
   */
  getDetail: async (admin_id) => {
    const response = await fetch(`/API/admin/users_get.php?admin_id=${admin_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * 新增帳號
   * @param {Object} data
   * @returns {Promise}
   */
  create: async (data) => {
    const response = await fetch('/API/admin/users_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_id: data.admin_id,
        admin_name: data.admin_name,
        password: data.admin_pwd, // 前端用 admin_pwd，後端用 password
        admin_role: data.admin_role,
        admin_active: data.admin_active,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Create failed')
    }

    return response.json()
  },

  /**
   * 更新帳號
   * @param {string} admin_id - 管理員帳號
   * @param {Object} data - 要更新的資料
   * @returns {Promise}
   */
  update: async (admin_id, data) => {
    const body = {
      admin_name: data.admin_name,
      admin_role: data.admin_role,
      admin_active: data.admin_active,
    }

    // 只有密碼有值才傳送
    if (data.admin_pwd && data.admin_pwd.trim() !== '') {
      body.password = data.admin_pwd
    }

    const response = await fetch(`/API/admin/users_update.php?admin_id=${admin_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Update failed')
    }

    return response.json()
  },
}
