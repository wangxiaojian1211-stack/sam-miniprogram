const app = getApp()
const mock = require('../../utils/mock')

Page({
  data: {
    cart: [],
    userInfo: {},
    subtotal: 0, serviceFee: 0, deliveryFee: 8, total: 0,
    remark: ''
  },

  onShow() {
    const rawCart = wx.getStorageSync('cart') || []
    const cart = rawCart.map(i => {
      const product = mock.getProductById(i.id)
      return product ? { ...product, count: i.count } : null
    }).filter(Boolean)
    wx.setStorageSync('cart', cart)
    const userInfo = app.getUserInfo()
    const subtotal = cart.reduce((s, i) => s + i.price * i.count, 0)
    const serviceFee = cart.reduce((s, i) => s + i.fee * i.count, 0)
    const deliveryFee = 8
    this.setData({
      cart, userInfo,
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      deliveryFee,
      total: (subtotal + serviceFee + deliveryFee).toFixed(2)
    })
  },

  onRemark(e) { this.setData({ remark: e.detail.value }) },

  changeAddr() {
    wx.navigateTo({ url: '/pages/address/address' })
  },

  submitOrder() {
    if (!this.data.cart.length) {
      wx.showToast({ title: '购物车为空或商品已下架', icon: 'none' })
      return
    }
    // 模拟支付
    wx.showLoading({ title: '支付中...' })
    setTimeout(() => {
      wx.hideLoading()
      // 生成订单ID
      const orderId = 'O' + Date.now()
      const orders = wx.getStorageSync('orders') || []
      const order = {
        id: orderId,
        status: 'pending',
        statusText: '待处理',
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        address: this.data.userInfo.address,
        items: this.data.cart.map(i => ({ name: i.name, count: i.count, price: i.price })),
        total: this.data.total,
        fee: this.data.serviceFee
      }
      orders.unshift(order)
      wx.setStorageSync('orders', orders)
      const adminOrders = wx.getStorageSync('admin_orders') || []
      adminOrders.unshift(order)
      wx.setStorageSync('admin_orders', adminOrders)
      // 清购物车
      wx.setStorageSync('cart', [])
      app.refreshCartCount()
      wx.removeTabBarBadge({ index: 1 })
      wx.navigateTo({ url: `/pages/track/track?id=${orderId}` })
    }, 1500)
  }
})
