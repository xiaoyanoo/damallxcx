const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const requestUtil = require('../../utils/friend/requestUtil');

Page({
  cid: 0,
  commentParam: {},
  /**
   * 页面的初始数据
   */
  data: {
    isEmpty: false,//数据是否为空
    hasMore: true,//是否还有更多数据
    page: 1,//当前请求的页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cid = options.cid;
    this.title = options.title;
    wx.setNavigationBarTitle({ title: this.title + " - 信息列表" });

    this.onPullDownRefresh();//加载数据

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
    listener.addEventListener('severs.comment.add', this.onPullDownRefresh);
    listener.addEventListener('severs.comment.delete', this.onPullDownRefresh);

    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      cid: this.cid,
      title: this.title,
      sysInfo: sysInfo,
      imgHeight: sysInfo.screenWidth / 4
    });

    //获取缓存的配置信息
    var config = wx.getStorageSync('servers_config');
    this.setData({ config: config });

    //先隐藏分享按钮，等加载完数据之后再显示分享
    wx.hideShareMenu();
    //获取分享信息
    requestUtil.get(_Data.ekcms_get_share_data_url, { mmodule: 'ekcms_info' }, (info) => {
      this.shareInfo = info;
      //显示分享按钮
      wx.showShareMenu();
    });

  },
  onUnload: function () {
    //移除注册的事件
    listener.removeEventListener('severs.info.add', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.update', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.delete', this.onPullDownRefresh);
    listener.removeEventListener('severs.info.pullblack', this.onPullDownRefresh);
    listener.removeEventListener('severs.comment.add', this.onPullDownRefresh);
    listener.removeEventListener('severs.comment.delete', this.onPullDownRefresh);
  },
  onPullDownRefresh: function () {
    //获取发布信息列表
    requestUtil.get(_Data.ekcms_services_documents, { cid: this.cid }, (data) => {
      // console.log(111)
      // if()
      this.onDataHandler(data);
      this.onSetData(data, 1);
    }, this, { completeAfter: wx.stopPullDownRefresh });
  },
  onReachBottom: function () {
    if (!this.data.hasMore) {
      console.log("没有更多了...");
      wx.stopPullDownRefresh();
      return;
    }

    //加载新数据
    requestUtil.get(_Data.ekcms_services_documents, { cid: this.cid, _p: this.data.page + 1 }, (data) => {
      this.onDataHandler(data);
      this.onSetData(data, this.data.page + 1);
    }, this, { completeAfter: wx.stopPullDownRefresh, isShowLoading: false });
  },
  onNavigateTap: function (e) {
    //跳转页面
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
  onDataHandler: function (data) {
    //数据处理
    _(data).map((item) => {
      item.create_time = util.formatSmartTime(item.create_time * 1000, "yyyy-MM-dd hh:mm");
      return item;
    });
  },
  onSetData: function (data, page) {
    //设置数据
    data = data || [];
    this.setData({
      page: page !== undefined ? page : this.data.page,
      data: page === 1 || page === undefined ? data : this.data.data.concat(data),
      hasMore: page !== undefined && data.length === 20,
      isEmpty: page === 1 || page === undefined ? data.length === 0 : false
    });
  },
  onPreviewTap: function (e) {
    //预览视图
    var dataset = e.target.dataset, index = dataset.index, url = dataset.url;
    if (index === undefined && url === undefined) return;
    var urls = e.currentTarget.dataset.urls;
    urls = urls === undefined ? [] : urls;
    if (index !== undefined && !url) url = urls[index];
    wx.previewImage({ current: url, urls: urls });
  },
  onGoodTap: function (e) {
    //赞
    if (requestUtil.isLoading(this.goodRQId)) return;
    const dataset = e.currentTarget.dataset, id = dataset.id, index = dataset.index;

    this.goodRQId = requestUtil.get(_Data.ekcms_services_documentGood, { id: id }, (res) => {
      const data = this.data.data;
      data[index].type = !data[index].type ? 'good' : null;
      data[index].good = res;
      this.setData({ data: data });
    });
  },
  onShowCommentTap: function (e) {
    var ut = wx.getStorageSync("utoken");
    var ui = wx.getStorageSync("user_info");
    if (!ut || !ui) {
      app.getUserInfo();
    }
    //显示评论框
    if (requestUtil.isLoading(this.commentRQId)) return;
    const dataset = e.target.dataset;
    const values = {
      index: e.currentTarget.dataset.index,
      comment_index: dataset.commentIndex,
      reply_id: dataset.replyId,
      reply_uid: dataset.uid,
      doc_id: dataset.docId,
    };
    console.log(values);
    if (!values.reply_id && !values.doc_id) return;
    this.commentParam = values;

    const comment_placeholder = (values.reply_id ? "回复 " : "评论 ") + dataset.nickname;

    this.setData({ show_comment: true, comment_placeholder: comment_placeholder });
  },
  onHideCommentTap: function () {
    //隐藏评论框
    this.setData({ show_comment: false });
  },
  onCommentSubmit: function (e) {
    //提交评论
    const values = _.extend({
      form_id: e.detail.formId
    }, e.detail.value, this.commentParam);
    console.log(values);
    this.commentRQId = requestUtil.post(_Data.ekcms_services_comment_add, values, (info) => {
      const data = this.data.data;
      if (values.reply_id) {
        //回复
        data[values.index].comment_list[values.comment_index].reply_list.push(info);
        data[values.index].comment_list[values.comment_index].reply_count++;
      } else {
        //评论
        info.reply_list = [];
        data[values.index].comment_list.push(info);
        data[values.index].comment++;
      }
      this.setData({ data: data, show_comment: false });
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
  onShareAppMessage: function () {
    //分享页面
    this.shareInfo = this.shareInfo || {};
    const title = this.shareInfo.title || '微发布';
    const desc = this.shareInfo.desc || '';
    return {
      title: title,
      desc: desc,
      path: 'pages/severs/lists?cid=' + this.cid + "&title=" + this.title
    };
  }
})