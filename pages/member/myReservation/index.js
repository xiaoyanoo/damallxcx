// pages/goods/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    navList: ['当前预定', '历史预定'],
    datas: [[], []],
    jiekou: jiekou,
    user_id: '',
    num: [1, 1],
    s_name:'',
    s_code:'',
    order_id:'',
    address_id:'',
    perios_info:[],
    falg: true,
  },
  
  //提现发货
  btnFsong: function(e){
    var that = this;
    var order_id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var user_id = that.data.user_id;
    var cancelUrls = jiekou + '/WXAPI/Personal2/preSend';
    wx.showModal({
      title: '提示',
      content: '商家将在下个月一次性发完剩下货件',
      cancelColor:"#b3b3b3",
      confirmColor: "#ffa000",
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
                var datas = that.data.datas;
                datas[index] = [];
                that.setData({
                  num: [1,1],
                  datas: datas,
                  falg: true,
                })
                that.getList(index);
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
  //进入商品详情｛预定｝
  linkDetails1: function (e) {
    var ids = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../index/shopDetails1/index?ids=' + ids,
    })
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    var num = e.detail.current;
    that.setData({
      navScrollLeft: num * 90,
      currentTab: num
    })

  },
  swichNav: function (e) {

    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //选项卡到底部
  bindDownLoad: function(){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var falg = that.data.falg;
    var page = that.data.page;
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
        that.getList(index);
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
      // user_id: 840      
    })
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });
    //调用收藏列表
    that.getList(0);
    that.getList(1);
  },
  getList: function (types) {
    var that = this;
    var data = {};
    var types = types;
    var user_id = that.data.user_id;
    var num = that.data.num;
    data.user_id = user_id;
    data.type = types;
    data.cu_page = num[types];
    data.page_size = 6;
    that.getShoucang(data, function () {
      num[types] = parseInt(num[types]) + 1;
      that.setData({
        num: num,
        falg: true,
      })
    });

  },
  //预定商品列表
  getShoucang: function (data, call) {
    var data = data;
    var types = data.type;
    var that = this;
    var dataList = that.data.datas;
    var advertiseUrls = jiekou + '/WXAPI/Personal2/myPreSale';
    that.setData({ falg: false });
    wx.request({
      url: advertiseUrls,
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (call) {
          call();
        }
        if(res.data.page != undefined) {
          that.setData({
            page: res.data.page
          })
          var page = res.data.page;

          if (page.cu_page > page.total_page) {
            wx.showModal({
              title: '提示',
              content: '小凯是有底线的哦',
              image: '../../../images/error.png',
              duration: 1000,
            })
          }
        }
        if (res.data.code == 0) {
          var datas = res.data.data;
          if (Array.isArray(datas)){
            if (datas.length > 0) {
              for (var i = 0; i < datas.length; i++) {
                dataList[types].push(datas[i]);
              }
              that.setData({
                datas: dataList
              })
            }
          }
        }
      }
    });
  },
  /**
   * 获取期数
   */
  getPresellGoods:function(e){
    var that_ = this;
    var o_id = e.currentTarget.dataset.id;
    console.log(o_id)

    if (this.data.order_id==o_id){
      that_.setData({
        order_id: 0
      })
      return;
    }
    
    wx.request({
      url: jiekou +'/WXAPI/Homepage/getPresellGoods',
      data:{order_id:o_id},
      header: { 'content-type': 'application/json'},
      success:function(res){
        // console.log(res);
        if(res.data.code==0){
          that_.setData({
            perios_info:res.data.period_info,
            order_id:o_id
          })
        }
      }
    })
  },
  /**
   * 跳到查看物流
   */
  toLogistics:function(e){
    // console.log(e);
    var order_id = e.currentTarget.dataset.o_id;
    var s_code = e.currentTarget.dataset.s_code;
    var ex_num = e.currentTarget.dataset.ex_num;
    var s_name = e.currentTarget.dataset.s_name;
    wx.navigateTo({
      url: '../logistics2/index?ex_num=' + ex_num+'&s_code='+s_code+'&o_id='+order_id+'&s_name='+s_name,
    }) 
  },

  /**
   * 修改地址
   */
  linkRess:function(e){
    // console.log(e);
    var period_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../EditOrderAddress/index?period_id='+period_id,
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