const app = getApp()
const mock = require('../../utils/mock')

Page({
  data: { cart: [], subtotal: 0, serviceFee: 0, total: 0 },

  onShow() {
    const rawCart = wx.getStorageSync('cart') || []
    const cart = rawCart.map(i => {
      const product = mock.getProductById(i.id)
      return product ? { ...product, count: i.count } : null
    }).filter(Boolean)
    if (cart.length !== rawCart.length) {
      wx.showToast({ title: '已移除下架商品', icon: 'none' })
    }
    wx.setStorageSync('cart', cart)
    const subtotal = cart.reduce((s, i) => s + i.price * i.count, 0)
    const serviceFee = cart.reduce((s, i) => s + i.fee * i.count, 0)
    this.setData({
      cart,
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      total: (subtotal + serviceFee).toFixed(2)
    })
  },

  inc(e) {
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(c => c.id === e.currentTarget.dataset.id)
    if (idx >= 0) cart[idx].count++
    wx.setStorageSync('cart', cart)
    this.onShow()
  },

  dec(e) {
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(c => c.id === e.currentTarget.dataset.id)
    if (idx >= 0) {
      cart[idx].count--
      if (cart[idx].count <= 0) cart.splice(idx, 1)
    }
    wx.setStorageSync('cart', cart)
    app.refreshCartCount()
    this.onShow()
  },

  remove(e) {
    wx.showModal({
      title: '确认删除', content: '从购物车移除该商品？',
      success: (res) => {
        if (!res.confirm) return
        const cart = (wx.getStorageSync('cart') || []).filter(c => c.id !== e.currentTarget.dataset.id)
        wx.setStorageSync('cart', cart)
        app.refreshCartCount()
        this.onShow()
      }
    })
  },

  goOrder() {
    wx.navigateTo({ url: '/pages/order/order' })
  },

  goShop() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
