// pages/member/logistics/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    ex_num: '',
    s_code: '',
    o_id:'',
    s_name:'',
    datas: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ex_num = options.ex_num;
    var s_code = options.s_code;
    var s_name = options.s_name;
    var o_id = options.o_id;
    var that = this;
    that.setData({
      ex_num: ex_num,
      s_code: s_code,
      o_id:o_id,
      s_name: s_name
    })
    that.getLogistics();
  },
  //获取物流信息
  getLogistics: function () {
    var that = this;
    var s_code = that.data.s_code;
    var ex_num = that.data.ex_num;
    var s_name = that.data.s_name
    var o_id = that.data.o_id;
    var urls = jiekou + '/WXAPI/Personal2/logisticsDet2';
    // console.log(that.data);
    // return;
    wx.request({
      url: urls,
      data: {
        s_code: s_code,
        ex_num: ex_num,
        s_name: s_name,
        o_id:o_id
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
        } else {
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