// pages/severs/jubao.js

const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const requestUtil = require('../../utils/friend/requestUtil');

Page({
  /**
   * 文档标识
   */
  docId: 0,
  /**
   * 页面的初始数据
   */
  data: {
    doc_id:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      doc_id:options.doc_id
    })
    var ut = wx.getStorageSync("utoken");
    var ui = wx.getStorageSync("user_info");
    if (!ut || !ui) {
      app.getUserInfo();
    }
    this.docId = options.id;
  },
  /**
   * 提交数据源
   */
  onPushSubmit: function (e) {
    if (requestUtil.isLoading(this.pushRQId)) return;
    var open_id=app.globalData.openid
    const values = _.extend({
      form_id: e.detail.formId,
      doc_id: this.data.doc_id,
      open_id: open_id,
    }, e.detail.value);

    this.pushRQId = requestUtil.post(_Data.ekcms_services_jubao, values, () => {
      wx.showModal({
        title: '温馨提示',
        content: '已举报，抵制不良信息，还我一个干净的世界！',
        showCancel: false,
        success: function () {
          wx.navigateBack();
        }
      });

    });
  }
})