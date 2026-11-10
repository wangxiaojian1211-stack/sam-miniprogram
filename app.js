App({
  globalData: {
    cartCount: 0,
    userInfo: {
      name: '晓健',
      phone: '138****8888',
      address: '青岛市城阳区正阳路XXX号'
    }
  },

  onLaunch() {
    const userInfo = wx.getStorageSync('user_info')
    if (userInfo) this.globalData.userInfo = userInfo
    const cart = wx.getStorageSync('cart') || []
    this.globalData.cartCount = cart.reduce((s, i) => s + i.count, 0)
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('user_info') || this.globalData.userInfo
    this.globalData.userInfo = userInfo
    return userInfo
  },

  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('user_info', userInfo)
  },

  // 刷新购物车数量
  refreshCartCount() {
    const cart = wx.getStorageSync('cart') || []
    this.globalData.cartCount = cart.reduce((s, i) => s + i.count, 0)
  }
})
