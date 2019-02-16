// pages/member/logistics/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    user_id : '',
    order_id: '',
    datas: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ids = options.ids;
    var user_id = app.globalData.user_id;
    var that = this;
    that.setData({
      order_id: ids,
      user_id: user_id
    })
    that.getLogistics();
  },
  //获取物流信息
  getLogistics: function(){
    var that = this;
    var user_id = that.data.user_id;
    var order_id = that.data.order_id;
    var urls = jiekou + '/WXAPI/Personal2/logisticsDet';
    wx.request({
      url: urls,
      data: {
        user_id: user_id,
        order_id: order_id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        res.data.data.goods_img = jiekou + res.data.data.goods_img
        if (res.data.code == 0) {
          
          that.setData({
            datas: res.data.data
          })
        }else{
          that.setData({
            datas: res.data.data
          })
        }
      }
    });
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