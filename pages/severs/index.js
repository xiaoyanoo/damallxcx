const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const requestUtil = require('../../utils/friend/requestUtil');

const QQMapWX = require('../../utils/friend/qqmap-wx-jssdk.min.js');// 引入SDK核心类
const qqmapsdk = new QQMapWX({ key: '7DWBZ-XEW6R-HGGWQ-WZYXJ-FZUAV-MBBDY' });// 实例化API核心类

Page({
  uid:'',
  adTimerId: 0,
  commentParam: {},
  data: {
    banner: [],
    isEmpty: false,//数据是否为空 
    hasMore: true,//是否还有更多数据
    page: 1,//当前请求的页数
    searchShow: false,//搜索栏显示隐藏
    param: {
      keyword: '',
      type: 0
    },
    styles: {},//样式表

  },
  /**
   * 页面初始化
   */
  onLoad: function (options) {
    this.loadBanner();
    var userInfo=app.globalData.userInfo;
    this.setData({uid:userInfo.user_id})
    console.log(userInfo);
    var a=app.getUserInfo();
    


    //加载数据
    this.onPullDownRefresh(1);

    //注册需要刷新的事件
    listener.addEventListener('severs.info.add', this.onPullDownRefresh);
    listener.addEventListener('severs.info.update', (item) => {
      const foreachBreak = new Error("break...");
      try {
        _.each(this.data.data, (itemTemp) => {
          if (itemTemp.id == item.id) {
            _.extend(itemTemp, item);
            throw foreachBreak;
          }
        });
      } catch (e) {
        if (e != foreachBreak) throw e;
        this.setData({ data: this.data.data });
      }
    });
    listener.addEventListener('severs.info.delete', (id) => {
      const data = this.data.data;
      const index = _.findIndex(data, { id: id });
      if (index >= 0) {
        data.splice(index, 1);
        this.setData({ data: data });
      }
    });
    listener.addEventListener('severs.info.pullblack', (uid) => {
      const data = this.data.data;
      for (var i = 0; i < data.length; i++) {
        if (data[i].uid == uid) {
          data.splice(i, 1);
          i--;
        }
      }
      this.setData({ data: data });
    });

    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      sysInfo: sysInfo,
      imgHeight: sysInfo.screenWidth / 4
    });

    //先隐藏分享按钮，等加载完数据之后再显示分享
    wx.hideShareMenu();
    //获取分享信息
    requestUtil.get(_Data.ekcms_get_share_data_url, { mmodule: 'ekcms_info' }, (info) => {
      this.shareInfo = info;
      //显示分享按钮
      wx.showShareMenu();
    });
  },
  /**
   * 页面卸载
   */
  onUnload: function () {
    clearInterval(this.adTimerId);

    //移除注册的事件
    listener.removeEventListener('severs.info.add', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.update', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.delete', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.pullblack', this.onPullDownRefresh);
  },
  /**
   * 获取配置信息
   */
  onPullDownRefresh: function () {
    var that = this;
    console.log(that.data.param);
    var app=getApp();
    var open_id = app.globalData.openid;
      //获取发布信息列表 未获取距离时
      requestUtil.post(_Data.ekcms_services_documents, _.extend({open_id:open_id}, that.data.param), (data) => {
      
        that.onDataHandler(data);
        that.onSetData(data, 1);
        wx.setStorage({ key: 'servers_data', data: data, });
      }, that, { completeAfter: wx.stopPullDownRefresh });
  },
  /**
   * 加载更多数据
   */
  onReachBottom: function () {
    if (!this.data.hasMore) {
      console.log("没有更多了...");
      wx.stopPullDownRefresh();
      return;
    }
    var app=getApp()
    var open_id = app.globalData.openid;
    //加载新数据
    requestUtil.get(_Data.ekcms_services_documents, _.extend({ _p: this.data.page + 1 ,open_id:open_id}, this.data.param), (data) => {
      this.onDataHandler(data);
      this.onSetData(data, this.data.page + 1);
    }, this, { completeAfter: wx.stopPullDownRefresh, isShowLoading: false });
  },
  /**
   * 数据处理
   */
  onDataHandler: function (data) {
    _(data).map((item) => {
      item.create_time = util.formatSmartTime(item.create_time * 1000, "yyyy-MM-dd hh:mm");
      return item;
    });
  },
  /**
   * 设置数据
   */
  onSetData: function (data, page) {
    data = data || [];
    this.setData({
      page: page !== undefined ? page : this.data.page,
      data: page === 1 || page === undefined ? data : this.data.data.concat(data),
      hasMore: page !== undefined && data.length === 3,
      isEmpty: page === 1 || page === undefined ? data.length === 0 : false
    });
  },
  /**
   * 显示搜索框
   */
  onShowSearchTap: function () {
    this.setData({ searchShow: true, });
  },
  /**
   * 隐藏搜索框
   */
  onHideSearchBlur: function (e) {
    if (!e.detail.value)
      this.setData({ searchShow: false, });
  },
  /**
   * 搜索操作
   */
  onSearchSubmit: function (e) {
    this.data.param.keyword = e.detail.value.keyword;
    //console.log(this.data.param);
    this.onPullDownRefresh();
  },
  /**
   * 清除关键字
   */
  onClearKeywordTap: function () {
    this.data.param.keyword = '';
    this.setData({ param: this.data.param });
  },
  /**
   * 选择选项卡
   */
  onSwtchTabTap: function (e) {
    const dataset = e.currentTarget.dataset, index = dataset.index;
    const param = this.data.param;
    if (index == param.type) return;

    if (index == 1) {
      //按距离排序,获取位置信息
      wx.showToast({
        title: '正在获取你的位置,请稍后..', icon: 'loading', duration: 10000, mask: false
      })
      var lat = wx.getStorageSync('LATITUD');
      var lng = wx.getStorageSync('LONGITUDE');
      if (lat && lng) {
        param.type = index;
        param.lat = lat;
        param.lng = lng;
        this.setData({ param: param });
        this.onPullDownRefresh();
      } else {
        wx.getLocation({
          success: (res) => {
            param.type = index;
            param.lat = res.latitude;
            param.lng = res.longitude;
            this.setData({ param: param });
            this.onPullDownRefresh();
          }, fail: () => {
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: '获取位置信息失败，请检查网络是否良好，以及是否禁用位置',
              showCancel: false,
            });
          }
        });
      }


    } else {
      //按最新排序
      param.type = index;
      this.setData({ param: param });
      this.onPullDownRefresh();
    }
  },
  /**
   * 跳转页面
   */
  onNavigateTap: function (e) {
    const dataset = e.currentTarget.dataset, url = dataset.url, type = dataset.type;
    const nav = { url: url };
    if ("switch" == type) {
      nav.fail = function () {
        wx.navigateTo({ url: url });
      };
      wx.switchTab(nav);
    } else {
      wx.navigateTo(nav);
    }
    

  },
  /**
   * 预览视图
   */
  onPreviewTap: function (e) {
    var dataset = e.target.dataset, index = dataset.index, url = dataset.url;
    if (index === undefined && url === undefined) return;
    var urls = e.currentTarget.dataset.urls;
    urls = urls === undefined ? [] : urls;
    if (index !== undefined && !url) url = urls[index];
    wx.previewImage({ current: url, urls: urls });
  },
  /**
   * 赞
   */
  onGoodTap: function (e) {
    if (requestUtil.isLoading(this.goodRQId)) return;
    const dataset = e.currentTarget.dataset, id = dataset.id, index = dataset.index;
    //if (this.data.data[index].is_good) return false;
    var app=getApp();
    var open_id = app.globalData.openid;
    this.goodRQId = requestUtil.get(_Data.ekcms_services_documentGood, { id: id ,open_id:open_id}, (res) => {
      if(res =='nologin'){
        app.getUserInfo(function(){
          wx.reLaunch({
            url: 'index',
          })
        });
        return;
      }
      const data = this.data.data;
      data[index].is_good = !data[index].is_good;
      data[index].good = res;
      this.setData({ data: data });
    });
  },
  /**
   * 显示评论框
   */
  onShowCommentTap: function (e) {
    var app=getApp();
    var ut=app.globalData.openid;
    // var ut = wx.getStorageSync("utoken");
    var ui = app.globalData.userInfo;
    var uid=ui.user_id;
    if (!ut || !ui) {
      app.getUserInfo();
    }
    if (requestUtil.isLoading(this.commentRQId)) return;
    const dataset = e.target.dataset;
    console.log(uid)
    const values = {
      index: e.currentTarget.dataset.index,
      comment_index: dataset.commentIndex,
      reply_id: dataset.replyid,
      reply_uid: uid,
      doc_id: dataset.docId,
    };
    console.log(values);
    if (!values.reply_id && !values.doc_id) return;
    this.commentParam = values;

    const comment_placeholder = (values.reply_id ? "回复 " : "评论 ") + dataset.nickname;

    this.setData({ show_comment: true, comment_placeholder: comment_placeholder });
  },
  /**
   * 隐藏评论框
   */
  onHideCommentTap: function () {
    this.setData({ show_comment: false });
  },
  onEmptyTap:function(){

  },
  /**
   * 提交评论
   */
  onCommentSubmit: function (e) {
    var that=this;
    const data = that.data.data;
    
    const values = _.extend({
      form_id: e.detail.formId
    }, e.detail.value, that.commentParam);
    console.log(values);
    values.open_id=app.globalData.openid;
    that.commentRQId = requestUtil.post(_Data.ekcms_services_comment_add, values, (info) => {
      console.log(info)
      if (info == 'nologin'){
        app.getUserInfo((userInfo) => that.setData({ userInfo: userInfo }));
        return;
      }
      console.log(values.reply_id);
      
      if (values.reply_id) {
        //回复
        //data[values.index].comment_list[values.comment_index].reply_list.push(info);
        data[values.index].comment++;  
        // data[values.index].comment_list[values.comment_index].reply_count++;
      } else {
        //评论
        info.reply_list = [];
        //data[values.index].comment_list.push(info);
        data[values.index].comment++;
      }
      that.setData({ data: data, show_comment: false });
    });
  },
  /**
   * 广告被点击
   */
  onAdTap: function () {
    const id = this.data.config.ad_ids[this.data.ad_index];
    if (id <= 0) return;
    wx.navigateTo({
      url: 'detail?id=' + id
    });
  },
  /**
   * 拨打电话
   */
  onCallTap: function (e) {
    const dataset = e.currentTarget.dataset, mobile = dataset.mobile;
    wx.makePhoneCall({
      phoneNumber: mobile,
    });
  },
  /**
   * 分享页面
   */
  onShareAppMessage: function () {
    this.shareInfo = this.shareInfo || {};
    const title = this.shareInfo.title || '同城';
    const desc = this.shareInfo.desc || '';
    return {
      title: title,
      desc: desc,
      path: 'pages/severs/index'
    };
  },
  /**
 * 打开地图
 */
  onOpenMapTap: function (e) {

    var that = this;
    // wx.chooseLocation({
    //   success: (res) => {
    //     console.log(res);

    //     that.setData({
    //       address: res.name
    //     });
    //     wx.setStorageSync('LATITUD', res.latitude);
    //     wx.setStorageSync('LONGITUDE', res.longitude);
    //     wx.setStorageSync('ADDRESS', res.name);
    //     that.data.page_index = 1;

    //   }
    // });

    wx.chooseLocation({
      success: (e) => {
        that.data._p = 1;
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: e.latitude,
            longitude: e.longitude
          },
          success: (res) => {
            var addressD = res.result.address_component;
            var addressS = '';
            if (addressD.street_number) {
              addressS = addressD.street_number;
            }
            else if (addressD.street) {
              addressS = addressD.street;
            }
            else if (addressD.city) {
              addressS = addressD.city;
            }
            res = res.result;
            wx.setStorageSync('LATITUD', res.location.lat);
            wx.setStorageSync('LONGITUDE', res.location.lng);
            wx.setStorageSync('ADDRESS', addressS);
            that.setData({
              address: addressS,
            });
            //获取发布信息列表 获取距离后
            var param = that.data.param;
            var app=getApp();
            var open_id = app.globalData.openid;
            param.latitude = res.location.lat;
            param.longitude = res.location.lng;
            param._p=1;
            that.setData({ param: param });
            requestUtil.post(_Data.ekcms_services_documents, _.extend({open_id:open_id}, that.data.param), (data) => {
              that.onDataHandler(data);
              that.onSetData(data, 1);
              wx.setStorage({ key: 'servers_data', data: data, });
            }, that, { completeAfter: wx.stopPullDownRefresh });
          }
        });
      }
    });
  },
  loadBanner: function () {

    var that = this;
    var user_id = 0;
      user_id = app.globalData.userInfo.user_id;
    // var user_id = app.globalData.userInfo['user_id'];
      requestUtil.post(_Data.ekcms_services_banner, _.extend({ user_id: user_id,type:1}), (data) => {
        console.log(data)
        var banner = data;
      that.setData({
        banner: banner,
      });
    });



  },
})

