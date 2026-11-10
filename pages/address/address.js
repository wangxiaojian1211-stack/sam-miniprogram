const app = getApp()

Page({
  data: {
    form: { name: '', phone: '', address: '' }
  },

  onLoad() {
    this.setData({ form: app.getUserInfo() })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      form: Object.assign({}, this.data.form, { [field]: e.detail.value })
    })
  },

  saveAddress() {
    const form = {
      name: (this.data.form.name || '').trim(),
      phone: (this.data.form.phone || '').trim(),
      address: (this.data.form.address || '').trim()
    }
    if (!form.name) {
      wx.showToast({ title: '请填写收货人', icon: 'none' })
      return
    }
    if (!form.phone) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    if (!form.address) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }
    app.saveUserInfo(form)
    wx.showToast({ title: '地址已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  }
})
