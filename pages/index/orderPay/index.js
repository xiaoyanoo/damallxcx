// pages/index/orderPay/index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    none: 0,
    jiekou: jiekou,
    user_id: '',
    datas: {},
    //待支付生成订单
    orderSn: '',
    address: {
      region: '',
      ress: '',
      mobile: '',
      name: '',
      address_id: '',
      is_default: '',
    },
    //接收的参数
    listInfo: {},
    //当前折扣
    acount: 1,
    //商品总价格
    allPrice: 0,
    //物流价格
    shopping_price: [],
    //所有物流价格
    allPri: 0,
    show: 0,
    //获取店铺跟物流id
    shipping_id: [],
    //地址id
    address_id: '',
    //选择物流地址的index下标
    index: [],
    //使用优惠券名字
    youhuiquan_msg: '',
    //优惠券id
    youhuiquan_id: '',
    total_fee:0,
    shop_goods:[],
  },
  textarea:function(e){
    var index = e.currentTarget.dataset.index;
    var val=e.detail.value;
    var shipping_id = this.data.shipping_id;
    shipping_id[index].remark=val;
    this.setData({
      shipping_id: shipping_id,
    });
  },
  //更改物流
  bindPickerChange: function(e){
    var array = this.data.array;
    var datas = this.data.datas;
    var shipping_id = this.data.shipping_id;
    var shopping_price = this.data.shopping_price;
    var index = e.currentTarget.dataset.index;
    var indexs = this.data.index;
    indexs[index] = e.detail.value;
    shopping_price[index] = datas.shop_goods[index].distri_type[e.detail.value].price;
    shipping_id[index].shipping_id = datas.shop_goods[index].distri_type[indexs[index]].shipping_id;
    this.setData({
      index: indexs,
      shipping_id: shipping_id,
      shopping_price: shopping_price,
    });
    this.getShoppingPrice();
  },
  getShoppingPrice: function(){
    var that = this;
    var allShoppingPrice = that.data.shopping_price;
    var allPri = 0;
    for (var i = 0; i < allShoppingPrice.length; i++) {
      allPri += allShoppingPrice[i];
    }
    that.total_fee(0,0,allPri);
    that.setData({
      allPri: allPri
    })
  },
  //使用优惠券
  giveYhuiquan: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id;
    var msg = e.currentTarget.dataset.msg;
    var acount = e.currentTarget.dataset.acount;
    console.log(acount)
    that.total_fee(0,acount,0)
    that.setData({
      youhuiquan_msg: msg + ' 折扣券',
      youhuiquan_id: ids,
      none: 0,
      acount: acount,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = options.data;
    var user_id = app.globalData.user_id;
    
    var datas = JSON.parse(data);
    this.setData({
      user_id: user_id,
      listInfo: datas
    })
    this.getInfo(datas);
  },
  addRess : function(){
    //进入地址添加
    wx.navigateTo({
      url: '../../member/address/index?show=0&address_id=0',
    })
  },
  //切换地址
  selectress: function(){
    wx.navigateTo({
      url: '../../member/ress/index?show=0',
    })
  },
  //获取地址信息
  getAddress: function (ids) {
    var that = this;
    var ids = ids;
    var getUrls = jiekou + '/WXAPI/Personal/getAddress';
    wx.request({
      url: getUrls,
      data: {
        address_id: ids
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var address = {
            region: res.data.data.address1,
            ress: res.data.data.address2,
            mobile: res.data.data.mobile,
            name: res.data.data.consignee,
            is_default: res.data.data.is_default,
            address_id: res.data.data.address_id,
          }
          that.setData({
            address: address,
            address_id: res.data.data.address_id,
          })
        }
      }
    });
  },
  total_fee: function (allPrice, acount, allPri){
    if (allPrice==0){
      allPrice = this.data.allPrice;
    }
    var that=this;
    if (acount == 0) {
      acount = this.data.acount;
    }
    var shop_goods=that.data.shop_goods;
    if (allPri == 0) {
      allPri = this.data.allPri;
    }
    var total_fee=0;
    // var total_fee = (allPrice * acount + allPri).toFixed(2)
    var urls = jiekou + '/WXAPI/Homepage/orderCoupon';
    wx.request({
      url: urls,
      data: { acount: acount, shop_goods: shop_goods},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(allPrice)
        console.log(res)
        total_fee = (allPrice - res.data.data + allPri).toFixed(2);
        if (total_fee < 0.01) {
          total_fee = 0.01
        }
        that.setData({
          total_fee: total_fee,
        })
      }
    });
   
  },
  //获取信息
  getInfo: function(data){
    var that = this;
    var user_id = that.data.user_id;
    var data = data;
    data.user_id = user_id;
    var urls = jiekou + '/WXAPI/Homepage/orderInfo';
    wx.request({
      url: urls,
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var getHomePageCat = res.data.data;
          if (getHomePageCat.address.address_id) {
            that.getAddress(getHomePageCat.address.address_id);
          }
          var shipping_id = [];
          var shopping_price = [];
          var indexArr = that.data.index;
          var shop_goods = getHomePageCat.shop_goods;
          var allPrice = 0;
          for(var i = 0; i < shop_goods.length; i++) {
            if (shop_goods[i].distri_type){
              var ship = shop_goods[i].distri_type[0].shipping_id;
            }else {
              var ship = '';
            }
            shipping_id.push({ store_id: shop_goods[i].store_id, shipping_id: ship }); 
            indexArr.push('0');
            shopping_price.push(shop_goods[i].shipping_price);
            allPrice += shop_goods[i].total_fee;
          }
          that.total_fee(allPrice,0,0)
          that.setData({
            datas: getHomePageCat,
            address_id: getHomePageCat.address.address_id,
            shipping_id: shipping_id,
            index: indexArr,
            shopping_price: shopping_price,
            allPrice: allPrice,
            shop_goods: shop_goods,
          })
          that.getShoppingPrice();
          
        }else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            success: function(res){
              wx.navigateBack({
                
              })
            }
          })
        }
      }
    });
  },
  //进入抽奖
  linkLuck: function(){
    var that = this;
    var urls = jiekou + '/WXAPI/Homepage/createOrder';
    var address_id = that.data.address_id;
    var shipping_id = JSON.stringify(that.data.shipping_id);
    var coupon_id = that.data.youhuiquan_id;
    var user_id = that.data.user_id;
    if (!address_id){
      wx.showModal({
        title: '提示',
        content: '请添加收货地址',
      })
    } else if (!user_id){
      wx.showModal({
        title: '提示',
        content: '请登录',
      })
    }else {
      var data = that.data.listInfo;
      data.address_id = address_id;
      data.shipping_id = shipping_id;
      data.coupon_id = coupon_id;
      data.user_id = user_id;
      wx.request({
        url: urls,
        data: data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              title: '下单成功',
              icon: 'success'
            })
            var orderSn = res.data.data.orderSn;
            that.setData({
              orderSn: orderSn
            })
            that.getWxPay();
            
          }else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
            })
          }
        }
      });
    }
    
  },
  //调微信接口
  getWxPay:function(){
    var that = this;
    var order_sn = this.data.orderSn;
    var urls = jiekou + '/WXAPI/Cart/getWXPayData';
    wx.request({
      url: urls,
      data: {
        master_order_sn: order_sn
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data.result.wdata;
        wx.requestPayment({
          'timeStamp': String(data.timeStamp),
          'nonceStr': data.nonceStr,
          'package': data.package,
          'signType': data.signType,
          'paySign': data.sign,
          'success': function (res) { 
            //清除订单id
            that.setData({
              order_sn: '',
            })
            //判断是否是预定商品 1是预定
            var is_pre_sale = that.data.datas.is_pre_sale;
            if (is_pre_sale == 1){
              wx.showModal({
                title: '提示',
                content: '支付成功',
                success: function (res) {
                  wx.redirectTo({
                    url: "../../member/orderList/index?nums=1"
                  })
                }
              })
            }else {
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              wx.redirectTo({
                url: '../luckDruw/index?ids=' + order_sn,
              })
            }
            
          },
          'fail': function (res) {
            wx.showModal({
              title: '提示',
              content: '支付已取消，前往订单可查看',
              success: function (res) {
                wx.redirectTo({
                  url: "../../member/orderList/index?nums=0"
                })
              }
            })
           },
          'complete': function (res) { }
        })
      }
    });
  },

  hideModel: function(){
    this.setData({
      none: 0,
    })
  }, 
  hideModel1: function() {
    this.setData({
      none: 0,
      acount: 1,
      youhuiquan_msg: '',
      youhuiquan_id: '',
    })
  },
  showModel: function () {
    this.setData({
      none: 1
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var show = this.data.show;
    var address_id = this.data.address_id;
    if(show == 1) {
      this.getAddress(address_id);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})