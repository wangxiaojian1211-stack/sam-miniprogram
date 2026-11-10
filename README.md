# 山姆代购微信小程序

原生微信小程序，采用深蓝主色和红色价格强调。

## 当前版本说明

- 用户端包含商品浏览、购物车、地址编辑、模拟下单及订单跟踪。
- 店铺管理支持店名和首页文案设置、新增商品、相册或拍照选图、价格和上下架维护。
- 商家订单支持采购勾选，采购清单汇总总量、已采购和未采购数量。
- 当前数据保存于设备本地缓存，图片保存于本机，支付为模拟流程。跨设备同步、多团队数据隔离、商家权限和真实支付尚需接入后端。
- `project.private.config.json` 为开发者工具本机配置，不提交到仓库。

## 项目结构

```
sam-miniprogram/
├── app.js              全局 App 入口
├── app.json            全局配置（Tab、页面路由）
├── app.wxss            全局样式
├── sitemap.json
├── project.config.json 开发工具配置（需填入你的AppID）
├── utils/
│   └── mock.js         Mock数据（商品、订单）
├── images/             Tab图标（自动生成）
└── pages/
    ├── index/          首页（商品列表）
    ├── detail/         商品详情
    ├── cart/           购物车
    ├── order/          提交订单
    ├── track/          订单跟踪
    ├── my/             我的
    ├── admin-orders/   商家订单管理
    └── admin-purchase/ 商家采购清单
```

## 快速开始

1. 打开**微信开发者工具** → 导入项目 → 选择本目录
2. 修改 `project.config.json` 中的 `appid` 为你的小程序AppID
3. 在开发者工具中点击编译即可预览

## 主要功能

**用户端**
- 首页：品类筛选 + 商品网格 + 加购
- 商品详情：价格拆分（原价+代购费）、数量调节
- 购物车：数量增减、删除、费用明细
- 提交订单：地址、费用明细、微信支付（模拟）
- 订单跟踪：5步进度条 + 时间线
- 我的：历史订单、联系客服

**商家后台**
- 订单管理：按状态筛选，一键推进订单状态
- 采购清单：按货架区域汇总所有订单商品，支持勾选划线、导出文本

## 对接真实后端时需替换的部分

| 文件 | 模拟数据位置 | 替换方案 |
|------|-------------|---------|
| utils/mock.js | PRODUCTS / MOCK_ORDERS | wx.request 调用后端API |
| pages/order/order.js | submitOrder() | 调用微信支付统一下单接口 |
| pages/admin-orders/admin-orders.js | _updateStatus() | POST /api/orders/:id/status |

## 微信支付接入步骤（生产环境）

1. 前端：`wx.requestPayment()` 传入后端返回的支付参数
2. 后端：调用微信支付统一下单API获取 prepay_id
3. 配置商户号、API密钥等
