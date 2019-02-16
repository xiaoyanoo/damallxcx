// pages/member/turntable/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    user_id: '',
    num: 1,
    falg: true,
    datas: [],
    page: {},
  },
  //删除消息
  delMessage: function(e){
    var ids = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认删除此条信息？',
      showCancel: true,
      success: function(res) {
        if(res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          var delUrls = jiekou + '/WXAPI/Personal2/delMessage';
          wx.request({
            url: delUrls,
            data: {
              user_id: user_id,
              message_id: ids
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (res.data.code == 0) {
                var datass = res.data.data;
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                  success: function(res){
                    that.setData({
                      num: 1,
                      datas: [],
                      falg: true,
                      page: {},
                    })
                    that.getAllPj();
                  }
                })
              }else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: true,
                })
              }
            }
          });
        }else if(res.cancel){

        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //获取消息
  getAllPj: function () {
    var that = this;
    var user_id = that.data.user_id;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Personal2/systemMessage';
    that.setData({ falg: false });
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        cu_page: num,
        page_size: 6,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({ falg: true, num: num + 1 });
        if (num == 1) {
          that.setData({ datas: [] });
        }
        if (res.data.code == 0) {
          var datass = res.data.data;
          if (res.data.page.cu_page > res.data.page.total_page) {
            wx.showToast({
              title: '加载完成~',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
    })
    this.getAllPj();
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
    var that = this;
    var falg = that.data.falg;
    var page = that.data.page;
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
        that.getAllPj();
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})