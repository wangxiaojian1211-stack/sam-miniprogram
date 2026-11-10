const mock = require('../../utils/mock')
const app = getApp()

Page({
  data: { userInfo: {}, orders: [], pendingCount: 0, navStyle: '' },

  onLoad() {
    this.setNavLayout()
  },

  setNavLayout() {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {}
    const statusBarHeight = sys.statusBarHeight || 20
    let navBarHeight = 44
    try {
      const menu = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect()
      if (menu && menu.top) {
        navBarHeight = menu.height + (menu.top - statusBarHeight) * 2
      }
    } catch (e) {}
    this.setData({
      navStyle: `padding-top:${statusBarHeight}px;height:${navBarHeight}px;`
    })
  },

  onShow() {
    const userInfo = app.getUserInfo()
    const localOrders = wx.getStorageSync('orders') || []
    const adminOrders = wx.getStorageSync('admin_orders') || []
    const map = {}
    ;[...mock.MOCK_ORDERS, ...localOrders, ...adminOrders].forEach(order => {
      map[order.id] = order
    })
    const orders = Object.values(map)
      .sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')))
      .slice(0, 6)
    const pendingCount = orders.filter(o => o.status === 'pending').length
    this.setData({ userInfo, orders, pendingCount })
  },

  goTrack(e) {
    wx.navigateTo({ url: `/pages/track/track?id=${e.currentTarget.dataset.id}` })
  },
  goOrders(e) {
    wx.showToast({ title: `${e.currentTarget.dataset.status} 筛选开发中`, icon: 'none' })
  },
  goAllOrders() {
    wx.showToast({ title: '全部订单开发中', icon: 'none' })
  },
  goAdmin() { wx.navigateTo({ url: '/pages/admin-orders/admin-orders' }) },
  goAddr() { wx.navigateTo({ url: '/pages/address/address' }) },
  goHelp() { wx.makePhoneCall({ phoneNumber: '4008888888' }) },
  goAbout() {
    const settings = mock.getStoreSettings()
    wx.showToast({ title: `${settings.storeName} v1.0`, icon: 'none' })
  }
})
