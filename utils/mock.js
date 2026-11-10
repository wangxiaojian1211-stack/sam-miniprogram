// Mock 数据 & 工具函数
const PRODUCTS = [
  { id: '1', name: '瑞士卷蛋糕', category: '烘焙甜点', price: 68.8, fee: 8, img: 'https://picsum.photos/seed/cake1/300/300', unit: '条', spec: '约700g', hot: true, active: true, desc: '山姆现烤，每日新鲜制作，奶油夹心，松软可口。' },
  { id: '2', name: '烤鸡', category: '熟食', price: 59.8, fee: 8, img: 'https://picsum.photos/seed/chicken/300/300', unit: '只', spec: '约1.8kg', hot: true, active: true, desc: '整只烤鸡，表皮金黄酥脆，内里鲜嫩多汁。' },
  { id: '3', name: '澳洲和牛牛排', category: '肉类海鲜', price: 298, fee: 15, img: 'https://picsum.photos/seed/beef/300/300', unit: '份', spec: '300g*2片', hot: false, active: true, desc: 'M5级澳洲和牛，雪花纹路清晰，鲜嫩多汁。' },
  { id: '4', name: '大虾', category: '肉类海鲜', price: 128, fee: 10, img: 'https://picsum.photos/seed/shrimp/300/300', unit: '盒', spec: '约1kg', hot: true, active: true, desc: '新鲜冰冻大虾，颗颗饱满，去头去壳处理，方便烹饪。' },
  { id: '5', name: '麻花', category: '零食坚果', price: 39.8, fee: 6, img: 'https://picsum.photos/seed/snack1/300/300', unit: '袋', spec: '500g', hot: false, active: true, desc: '香脆麻花，多种口味，休闲零食首选。' },
  { id: '6', name: 'Kirkland 坚果混合', category: '零食坚果', price: 188, fee: 10, img: 'https://picsum.photos/seed/nuts/300/300', unit: '罐', spec: '1.13kg', hot: true, active: true, desc: '多种坚果混合，无添加盐，健康营养。' },
  { id: '7', name: '三文鱼刺身', category: '肉类海鲜', price: 168, fee: 12, img: 'https://picsum.photos/seed/salmon/300/300', unit: '份', spec: '约400g', hot: true, active: true, desc: '新鲜三文鱼，切片即食，刺身级品质。' },
  { id: '8', name: '提拉米苏', category: '烘焙甜点', price: 89.8, fee: 8, img: 'https://picsum.photos/seed/tms/300/300', unit: '盒', spec: '6寸', hot: false, active: true, desc: '经典意式提拉米苏，马斯卡彭奶酪，入口即化。' },
  { id: '9', name: 'Perrier 矿泉水', category: '饮料', price: 68.8, fee: 6, img: 'https://picsum.photos/seed/water/300/300', unit: '箱', spec: '330ml*24瓶', hot: false, active: true, desc: '法国进口气泡水，天然矿物质，清爽解渴。' },
  { id: '10', name: '洗碗机凝珠', category: '日用品', price: 128, fee: 8, img: 'https://picsum.photos/seed/dish/300/300', unit: '盒', spec: '100颗', hot: false, active: true, desc: '强力去污，适配主流洗碗机，一颗搞定一次。' },
]

const CATEGORIES = ['全部', '烘焙甜点', '熟食', '肉类海鲜', '零食坚果', '饮料', '日用品']

const DEFAULT_STORE_SETTINGS = {
  storeName: '山姆代购',
  heroTitle: '山姆好物，当日代买',
  heroDesc: '生鲜熟食 · 烘焙甜点 · 日用囤货，一站式帮买配送'
}

const MOCK_ORDERS = [
  {
    id: 'O20260624001', status: 'pending', statusText: '待处理',
    createTime: '2026-06-24 08:30',
    address: '城阳区正阳路88号',
    items: [
      { name: '瑞士卷蛋糕', count: 2, price: 68.8 },
      { name: '烤鸡', count: 1, price: 59.8 }
    ],
    total: 213.4, fee: 24
  },
  {
    id: 'O20260624002', status: 'purchasing', statusText: '采购中',
    createTime: '2026-06-24 07:50',
    address: '城阳区春阳路15号',
    items: [
      { name: '澳洲和牛牛排', count: 1, price: 298 },
    ],
    total: 313, fee: 15
  },
  {
    id: 'O20260623001', status: 'done', statusText: '已完成',
    createTime: '2026-06-23 09:10',
    address: '城阳区惜福镇街道XX小区',
    items: [
      { name: '大虾', count: 2, price: 128 },
      { name: 'Kirkland 坚果混合', count: 1, price: 188 }
    ],
    total: 464, fee: 30
  }
]

module.exports = {
  PRODUCTS,
  CATEGORIES,
  MOCK_ORDERS,
  DEFAULT_STORE_SETTINGS,
  getStoreSettings() {
    return Object.assign({}, DEFAULT_STORE_SETTINGS, wx.getStorageSync('store_settings') || {})
  },
  saveStoreSettings(settings) {
    wx.setStorageSync('store_settings', Object.assign({}, DEFAULT_STORE_SETTINGS, settings))
  },
  getProductList(options = {}) {
    const local = wx.getStorageSync('admin_products')
    const list = local && local.length ? local : PRODUCTS
    const normalized = list.map(p => ({ ...p, active: p.active !== false }))
    return options.includeInactive ? normalized : normalized.filter(p => p.active !== false)
  },
  saveProductList(products) {
    wx.setStorageSync('admin_products', products)
  },
  getProductById(id, options = {}) {
    const list = this.getProductList({ includeInactive: true })
    const product = list.find(p => p.id === id)
    if (!product) return null
    if (!options.includeInactive && product.active === false) return null
    return product
  },
  getProductByName(name) {
    return this.getProductList({ includeInactive: true }).find(p => p.name === name)
  },
  getProducts(category) {
    const list = this.getProductList()
    if (!category || category === '全部') return list
    return list.filter(p => p.category === category)
  },
  searchProducts(keyword) {
    const list = this.getProductList()
    if (!keyword) return list
    return list.filter(p => p.name.includes(keyword) || p.category.includes(keyword))
  }
}
