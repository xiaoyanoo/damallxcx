//index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({
  data: {
    jiekou : jiekou,
    user_id: '',
    advertise: [],
    getHomePageCat: [],
    guessLike: [],
    cu_page:1,
    page_size:4,
  },
  //进入搜索界面
  linkSearch: function(){
    wx.navigateTo({
      url: './search/index',
    })
  },
  onLoad: function (options) {
    var that = this;
    var scene = decodeURIComponent(options.scene).split(",");
    console.log(scene)
    //获取登录信息
    that.getOpenIds(scene);
    var user_id = app.globalData.user_id;

    if(user_id==undefined){
      wx.showModal({
        title: '提示',
        content: '您还未登陆，是否跳转登陆?',
        
        success: function(res) {
          // console.log(111)
          wx.switchTab({
            
            url: '../member/index/index',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
        },
        fail: function(res) {},
        complete: function(res) {},
      })
    }
    that.setData({
      user_id: user_id
    })
    that.getadvertise();
    that.getHomePageCat();
    that.guessLike(1,4);
  },
  //广告跳转
  ad_href:function(e){
    var that = this;
    var ids = e.currentTarget.dataset.url;
    
    var types = e.currentTarget.dataset.type;
    if (types == 0) {
      if (ids) {
        wx.navigateTo({
          url: './shopDetails/index?ids=' + ids,
        })
      }
    } else {
      if (ids) {
        wx.navigateTo({
          url: './shopDetails1/index?ids=' + ids,
        })
      }
    }
  },
  //首页广告轮播图
  getadvertise: function(){
    var that = this;
    var advertiseUrls = jiekou + '/WXAPI/Homepage/advertise';
    wx.request({
      url: advertiseUrls,
      data: {type:1},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(res.data.code == 0) {
          var advertise = res.data.data;
          that.setData({
            advertise: advertise,
          })
        }
      }
    });
  },
  //首页分类
  getHomePageCat: function () {
    var that = this;
    var getHomePageCatUrls = jiekou + '/WXAPI/Homepage/getHomePageCat';
    wx.request({
      url: getHomePageCatUrls,
      data: {
        type: 1,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var getHomePageCat = res.data.data;
          that.setData({
            getHomePageCat: getHomePageCat,
          })
        }
      }
    });
  },
  //首页热门商品
  guessLike: function (cu_page, page_size) {
    var that = this;
    that.setData({
      cu_page:cu_page+1,
      page_size:page_size,
    })
    var newguessLike = that.data.guessLike;
    var guessLikeurls = jiekou + '/WXAPI/Homepage/guessLike';
    wx.request({
      url: guessLikeurls,
      data: { type: 1 ,cu_page:cu_page,page_size:page_size},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var guessLike = res.data.data;
          if (guessLike != '' && guessLike != undefined && guessLike!=[]){
            for (var i = 0; i < guessLike.length;i++){
              newguessLike.push(guessLike[i])
            }
          }else{
            wx.showModal({
              title: '提示',
              content: app.globalData.msg,
            })
          }
          that.setData({
            guessLike: newguessLike,
          })
        }
      }
    });
  },


  //进入详情页
  linkDetails: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id; 
    var types= e.currentTarget.dataset.type; 
    if(types==0){
      if (ids) {
        wx.navigateTo({
          url: './shopDetails/index?ids=' + ids,
        })
      }
    }else{
      if (ids) {
        wx.navigateTo({
          url: './shopDetails1/index?ids=' + ids,
        })
      }
    }
    
  },
  //进入商品列表
  linkList: function(e){
    // var that = this;
    // var ids = e.currentTarget.dataset.id; 
    // wx.navigateTo({
    //   url: './list/index?ids=' + ids,
    // })
    var that = this;
    var ids = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: './shopList/index?ids=' + ids,
    })
  },

  //登录
  getOpenIds: function (scene){
    var that = this;
    app.getOpenId(function () {
      var openId = app.globalData.openid;
      wx.request({
        url: jiekou + '/index.php/WXAPI/User/validateOpenid',
        data: { openid: openId },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 200) {
            // console.log(res.data.data)
            app.getUserInfo()
            getApp().globalData.userInfo = res.data.data;
            getApp().globalData.login = true;
            app.globalData.user_id = res.data.data.user_id;
            that.setData({ user_id: res.data.data.user_id})
            if(scene[1]==6){
              var ids =scene[0];
              wx.navigateTo({
                url: 'shopDetails/index?ids=' + ids,
              })
            }
            // console.log(that.data.user_id)
          } else {
            if (res.data.code == '400') {
              // console.log("need register");

              app.register(function () {
                var userInfo = getApp().globalData.userInfo;
                getApp().globalData.login = true;
                that.setData({ user_id: userInfo.user_id })
              });
              if (scene[1] == 6) {
                var ids = scene[0];
                wx.navigateTo({
                  url: 'shopDetails/index?ids=' + ids,
                })
              }
            }
          }
        }
      });

    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({show:1})
  },
  /**
* 生命周期函数--监听页面初次渲染完成
*/
  onReady: function () {

  },
  onShow: function () {
   
  },

  onReachBottom:function(){
    var that=this;
    var cu_page=that.data.cu_page;
    var page_size = that.data.page_size;
    that.setData({
      cu_page: cu_page + 1,
      page_size: page_size ,
    })

    that.guessLike(cu_page,page_size)
  },

  onShareAppMessage:function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '凯粮-为健康而来',
      path: '/pages/index/index',
      imageUrl:'../../images/logo.png',
    }
  }
})
