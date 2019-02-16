// pages/member/ress/index.js
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
    //是否显示刷新页面
    show: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var show = '';
    if (options.show == 0) {
      show = options.show;
    }
    var that = this;
    var user_id = app.globalData.user_id;
    this.setData({
      // user_id: 840,
      user_id: user_id,      
      show: show,
    })
    that.getAllPj();
  },
  //删除地址
  delAddress: function(e){
    var that = this;
    var user_id = that.data.user_id;
    var ids = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index; 
    wx.showModal({
      title: '提示',
      content: '是否删除地址',
      success: function (res) {
        if (res.confirm) {
          var pjUrl = jiekou + '/WXAPI/Personal/delAddress';
          that.setData({ falg: false });
          wx.request({
            url: pjUrl,
            data: {
              user_id: user_id,
              address_id: ids
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              that.setData({ falg: true });
              if (res.data.code == 0) {
                that.setData({
                  datas: [],
                  num: 1,
                  falg: true,
                })
                that.getAllPj();
              } else {
                wx.showToast({
                  title: res.data.msg,
                  image: '../../../images/error.png',
                  duration: 1000,
                })
              }
            }
          });
        } else if (res.cancel) {
        }
      }
    });

  },
  //设置默认地址
  setDefault: function(e){
    var that = this;
    var user_id = that.data.user_id;
    var ids = e.currentTarget.dataset.id; 
    var index = e.currentTarget.dataset.index; 
    var pjUrl = jiekou + '/WXAPI/Personal/setDefaultAddress';
    that.setData({ falg: false });
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        address_id: ids
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({ falg: true });
        if (res.data.code == 0) {
          var datas = that.data.datas;
          for(var i = 0; i < datas.length; i++) {
            if(i == index){
              datas[index].is_default = 1;
            }else {
              datas[i].is_default = 0;
            }
          }
          that.setData({
            datas: datas,
          })
        }else {
          wx.showToast({
            title: res.data.msg,
            image: '../../../images/error.png',
            duration: 1000,
          })
        }
      }
    });
  },
  //订单确认选择地址
  getAddress: function(e){
    var that = this;
    var show = that.data.show;
    var ids = e.currentTarget.dataset.id; 
    if(show == 0) {
      wx.navigateBack();
      var pages = getCurrentPages();
      // var prevPage = pages[pages.length - 1] 
      var prevPage = pages[pages.length - 2]  //上一个页面
      prevPage.setData({
        show: 1,
        address_id: ids,
      })
    }
  },
  //获取地址
  getAllPj: function () {
    var that = this;
    var user_id = that.data.user_id;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Personal/addressList';
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
  //进入新增或者修改收货地址
  linkAddress: function(e){
    var ids = e.currentTarget.dataset.id; 
    if(this.data.show == 0) {
      var urls = '../address/index?show=3&ids=' + ids;
    }else {
      var urls = '../address/index?ids=' + ids;
    }
    wx.navigateTo({
      url: urls,
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
    if (this.data.shua == 1 ) {
      this.setData({num: 1,falg: true,datas: []});
      this.getAllPj();
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