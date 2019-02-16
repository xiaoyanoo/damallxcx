// pages/member/orderDetails/index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 1,
    jiekou: jiekou,
    user_id:'',
    ids: '',
    datas: {},
    index: 0,
  },
  //调微信接口
  getWxPay: function (e) {
    var that = this;
    var order_sn = e.currentTarget.dataset.order_sn;
    var urls = jiekou + '/WXAPI/Cart/getWXPayData';

    // wx.navigateTo({
    //   url: '../../index/luckDruw/index?ids=' + order_sn,
    // })
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
            var is_pre_sale = that.data.datas.goods_type;
            if (is_pre_sale == 1) {
              wx.showModal({
                title: '提示',
                content: '支付成功',
                success: function (res) {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }
              })
            } else {
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              wx.redirectTo({
                url: '../../index/luckDruw/index?ids=' + order_sn,
              })
            }

          },
          'fail': function (res) {
            console.log(res);
          },
          'complete': function (res) { }
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var ids = options.ids;
    var goods_id = 0; 
    var titleNum = options.titleNum;

    var spec_key = 0;
    if (options.goods_id){
      goods_id = options.goods_id;
    }
    if (options.spec_key) {
      spec_key = options.spec_key;
    }
    var index = options.index;
    var user_id = app.globalData.user_id;
    that.setData({
      user_id: user_id,
      ids: ids,
      index: index,
      spec_key: spec_key,
      goods_id: goods_id,
      status: titleNum
    })
    that.getInfo();
  },
  //获取详情信息
  getInfo: function(){
    var that = this;
    var user_id = that.data.user_id;
    var ids = that.data.ids;
    var goods_spec = that.data.spec_key;
    var goods_id = that.data.goods_id;
    var pjUrl = jiekou + '/WXAPI/Personal2/getOrderDetail';
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        order_id: ids,
        goods_spec: goods_spec,
        goods_id: goods_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            datas: res.data.data
          })
        }else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: true,
            success: function(res) {
              wx.navigateBack({
                
              })
            }
          })
        }
      }
    });
  },
  //删除订单
  delOrder: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var user_id = that.data.user_id;
    var data = {
      order_id: order_id,
      user_id: user_id,
    }
    var cancelUrls = jiekou + '/WXAPI/Personal2/delOrderGoods';
    wx.showModal({
      title: '提示',
      content: '是否删除订单?',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: cancelUrls,
            data: data,
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {

              if (res.data.code == 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true,
                })
                let pages = getCurrentPages();//当前页面
                let prevPage = pages[pages.length - 2];//上一页面
                prevPage.setData({
                  show: 1
                })
                wx.navigateBack({
                  
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
  cancelOrder: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var user_id = that.data.user_id;
    var cancelUrls = jiekou + '/WXAPI/Personal2/cancelOrder';
    wx.showModal({
      title: '提示',
      content: '取消当前订单，该订单商品则被取消',
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
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true,
                })
                let pages = getCurrentPages();//当前页面
                let prevPage = pages[pages.length - 2];//上一页面
                prevPage.setData({
                  show: 1
                })
                wx.navigateBack({
                  
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
  //确认收货
  confirmOrder: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var user_id = that.data.user_id;
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
                that.getInfo();
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                });
                let pages = getCurrentPages();//当前页面
                let prevPage = pages[pages.length - 2];//上一页面
                prevPage.setData({
                  show: 1
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
  //进入申请退款
  tkDetails: function(e){
    var order_id = e.currentTarget.dataset.id;
    var spec_key = e.currentTarget.dataset.spec_key;
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '../tkDetails/index?ids=' + order_id + '&spec_key=' + spec_key + '&goods_id=' + goods_id,
    })
  },
  //进入物流详情
  linkLogistics: function (e) {
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../logistics/index?ids=' + order_id,
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