//app.js
var jiekou = 'https://kl2015.com'
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getOpenId: function (cb) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: jiekou + '/index.php/WXAPI/User/sendappid?appid=wxbb676ec5f9bb7c3d&secret=8fb0b2f41d93c83518c4b191830840e8&js_code=' + res.code + '&grant_type=authorization_code',
            data: {
              code: res.code
            },
            success: function (response) {
              // 获取openId
              var openId = response.data.openid;
              var session_key = response.data.session_key;
              // TODO 缓存 openId
              var app = getApp();
              var that = app;
              that.globalData.openid = openId;
              that.globalData.session_key = session_key;
              //验证是否关联openid

              typeof cb == "function" && cb()

            },
            fail:function(){
              
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },

  register: function (cb) {
    var app = this;
    this.getUserInfo(function () {
      var openId = app.globalData.openid;
      var session_key = app.globalData.session_key;
      var userInfo = app.globalData.userInfo;
      var country = userInfo.country;
      var city = userInfo.city;
      var gender = userInfo.gender;
      var nickname = userInfo.nickName;
      var province = userInfo.province;
      var avatarUrl = userInfo.avatarUrl;
      var encryptedData = app.globalData.encryptedData;
      var iv = app.globalData.iv;
      wx.request({
        url: jiekou + '/index.php/WXAPI/User/register', //仅为示例，并非真实的接口地址
        data: { open_id: openId, country: country, gender: gender, nickname: nickname, province: province, city: city, head_pic: avatarUrl, encryptedData: encryptedData, iv: iv, session_key: session_key },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          app.globalData.userInfo = res.data.res
          app.globalData.user_id = res.data.res.user_id
          typeof cb == "function" && cb()
        }
      })
    })
  },
  registerceshi: function (cb) {
    var app = this;
    var openId = app.globalData.openid;
    var session_key = app.globalData.session_key;
    var userInfo = app.globalData.userInfo;
    var country = userInfo.country;
    var city = userInfo.city;
    var gender = userInfo.gender;
    var nickname = userInfo.nickName;
    var province = userInfo.province;
    var avatarUrl = userInfo.avatarUrl;
    var encryptedData = app.globalData.encryptedData;
    var iv = app.globalData.iv;
    wx.request({
      url: jiekou + '/index.php/WXAPI/User/register', //仅为示例，并非真实的接口地址
      data: { open_id: openId, country: country, gender: gender, nickname: nickname, province: province, city: city, head_pic: avatarUrl, encryptedData: encryptedData, iv: iv, session_key: session_key },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        app.globalData.userInfo = res.data.res
        app.globalData.user_id = res.data.res.user_id
        typeof cb == "function" && cb()
      }
    })

  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              that.globalData.encryptedData = res.encryptedData;
              that.globalData.iv = res.iv;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    openid:'',
    user_id:'',
    jiekou: jiekou,
    is_shuaxin: 0,
    msg:'没有更多内容啦~',
  }
})