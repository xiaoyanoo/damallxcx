// pages/member/orderList/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navName: ['待支付', '待收货', '待评价','退款/售后'],
    titleNum: '',
    user_id: '',
    num: 1,
    falg: true,
    datas: [],
    page: {},
    jiekou:jiekou,
    //是否显示刷新页面
    show: 0,
  },
  
  //进入评价
  linkGoodsComment: function (e) {
    var order_id = e.currentTarget.dataset.id; 
    var spec_key = e.currentTarget.dataset.spec_key;
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '../goodComment/index?ids=' + order_id + '&spec_key=' + spec_key + '&goods_id=' + goods_id,
    })
  },
  //进入物流详情
  linkLogistics: function(e){
    var that = this;
    var order_id = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '../logistics/index?ids=' + order_id,
    })
  }, 
  //进入订单详情
  tkDetails: function(e) {
    var order_id = e.currentTarget.dataset.id; 
    var index = e.currentTarget.dataset.index; 
    var spec_key = e.currentTarget.dataset.spec_key;
    var goods_id = e.currentTarget.dataset.goods_id;
    var titleNum = this.data.titleNum;
    wx.navigateTo({
      url: '../orderDetails/index?index=' + index + '&ids=' + order_id + '&spec_key=' + spec_key + '&goods_id=' + goods_id + '&titleNum=' + titleNum,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var titleNum = options.nums;
    var arr = this.data.navName;
    this.setData({
      titleNum: titleNum
    })
    wx.setNavigationBarTitle({
      title: arr[titleNum]
    })
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
    })
    that.getAllPj(titleNum);
  },
  //获取订单
  getAllPj: function (titleNum) {
    var that = this;
    var types = titleNum;
    var user_id = that.data.user_id;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Personal2/getOrderList';
    wx.showLoading({
      title: '正在加载',
    })
    that.setData({ falg: false });
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        cu_page: num,
        page_size: 6,
        type: types
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({ falg: true, num: num + 1 });
        if (num == 1) {
          that.setData({ datas: [] });
        }
        if (res.data.code == 0) {
          var datass = res.data.data;
          if (res.data.page.cu_page > res.data.page.total_page) {
            wx.showToast({
              title: '没有数据了~',
              image: '../../../images/error.png',
              duration: 1000,
              mask: true,
            })
          }
          var datas = that.data.datas;
          if (datass.length > 0) {
            for (var i = 0; i < datass.length; i++) {
              datas.push(datass[i]);
            }
          }
          that.setData({
            datas: datas,
            page: res.data.page
          })
        }
      }
    });
  },
  //删除订单
  delOrder: function(e){
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var spec_key = e.currentTarget.dataset.spec_key;
    var goods_id = e.currentTarget.dataset.goods_id;
    var user_id = that.data.user_id;
    var titleNum = that.data.titleNum;
    var data = {
      order_id: order_id,
      goods_id: goods_id,
      user_id: user_id,
      goods_spec: spec_key,
    }
    var cancelUrls = jiekou + '/WXAPI/Personal2/delOrderGoods';
    wx.showModal({
      title: '提示',
      content: '是否删除订单?',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          wx.request({
            url: cancelUrls,
            data: data,
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.setData({
                  num: 1,
                  datas: [],
                })
                that.getAllPj(titleNum);
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true,
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                });
              }
            }
          });
        }
      }
    })
  },
  //取消订单
  cancelOrder: function(e){
    var that = this;
    var order_id = e.currentTarget.dataset.id; 
    var user_id = that.data.user_id;
    var titleNum = that.data.titleNum;
    var cancelUrls = jiekou + '/WXAPI/Personal2/cancelOrder';
    wx.showModal({
      title: '提示',
      content: '取消当前订单，该订单商品则被取消',
      showCancel: true,
      success: function(res) {
        if(res.confirm) {
          wx.showLoading({
            title: '正在取消',
          })
          wx.request({
            url: cancelUrls,
            data: {
              user_id: user_id,
              order_id: order_id,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.setData({
                  num: 1,
                  datas: [],
                })
                that.getAllPj(titleNum);
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true,
                })
              }else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                });
              }
            }
          });
        }
      }
    })
  },
  //确认收货
  confirmOrder: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var user_id = that.data.user_id;
    var titleNum = that.data.titleNum;
    var cancelUrls = jiekou + '/WXAPI/Personal2/confirmOrder';
    wx.showModal({
      title: '提示',
      content: '是否确定收货？',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: cancelUrls,
            data: {
              user_id: user_id,
              order_id: order_id,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (res.data.code == 0) {
                that.setData({
                  num: 1,
                  datas: [],
                })
                that.getAllPj(titleNum);
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                });
              }
            }
          });
        }
      }
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
    if (this.data.show == 1) {
      this.setData({ num: 1, falg: true, datas: [] });
      var types = this.data.titleNum;
      this.getAllPj(types);
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
    var that = this;
    var falg = that.data.falg;
    var page = that.data.page;
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
        var types = this.data.titleNum;
        that.getAllPj(types);
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})