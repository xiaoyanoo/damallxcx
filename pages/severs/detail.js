const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const API_URL = _Data.ekcms_host_api_url;
const requestUtil = require('../../utils/friend/requestUtil');

Page({
  id: null,
  data: {
    top_day: 1,
    isShowTop: false,
    isShowActionMenu: false,
    is_admin: false,
    doc_id:0,
    comment_list:[],
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.id = options.id;

    //先隐藏分享按钮，等加载完数据之后再显示分享
    wx.hideShareMenu();
    //获取分享信息
    requestUtil.get(_Data.ekcms_get_share_data_url, { mmodule: 'ekcms_info' }, (info) => {
      this.shareInfo = info;
      //显示分享按钮
      wx.showShareMenu();
    });

    //获取缓存的配置信息
    var config = wx.getStorageSync('servers_config');
    this.setData({ config: config });
    //判断管理员
    var user_info = wx.getStorageSync('user_info');
    //console.log(user_info);
    if (user_info.is_admin == 1) {
      this.setData({ is_admin: true });
    }
  },
  //生成页面二维码
  getCode: function (e) {
    var that = this;
    var id = that.data.id;
    var typeid = that.data.typeid;
    var url = _Data.ekcms_host_api_url + "/index.php?s=/api/config/fxcode&id=" + id + "&typeid=1&token=" + _Data.ekcms_user_token + "&_r=" + (new Date().getTime());
    wx.showToast({
      title: '正在努力加载中...',
      icon: 'loading',
      duration: 10000
    });
    wx.getImageInfo({
      src: url,
      success: (res) => {
        // console.log(res.path);
        wx.hideToast();
        wx.previewImage({
          current: res.path,
          urls: [res.path],
        });
        wx.showToast({
          title: '点击右上角-发送给朋友',
          icon: 'success',
          duration: 3000
        })
      },
      fail: function (res) {
        // console.log(res);
        wx.showModal({ content: '加载失败！', showCancel: false, });
        wx.hideToast();
      },
      complete: function (res) {
        //console.log(res)
      }
    });
  },
  onShow: function () {

    // 页面显示
    this.onPullDownRefresh(1);//加载数据
  },
  onPullDownRefresh: function (isShowLoading) {
    isShowLoading = isShowLoading || false;
    //获取发布信息详情
    var open_id=app.globalData.openid
    requestUtil.get(_Data.ekcms_services_documentInfo, { id: this.id, open_id: open_id }, (data, orgData) => {

      this.setData({ id: this.id, is_good: data.is_good, latitude: data.latitude, longitude: data.longitude, address: data.address ,doc_id:data.id,comment_list:data.comment_list})
      //数据处理
      data.create_time = util.formatSmartTime(data.create_time * 1000, "yyyy-MM-dd hh:mm");
      listener.fireEventListener('severs.info.update', [{ id: this.id, click: data.click }]);

      //获取位置信息
      // wx.getLocation({
      //   success: (res) => {

      //     requestUtil.get(API_URL + '/index.php?s=/api/article/getDistance', {
      //       from: res.longitude + ',' + res.latitude,
      //       to: data.longitude + ',' + data.latitude
      //     }, (distance) => {
      //       if (distance>0.5) {
      //         distance = parseFloat(distance).toFixed(2);
      //         distance = "≈" + distance + "km";
      //         this.setData({ distance: distance });
      //       }else if(distance<=0.5 && distance>0){
      //         distance = parseInt(distance*1000);
      //         distance = "≈" + distance + "米";
      //         this.setData({ distance: distance });
      //       } else {
      //         this.setData({ distance: '<100米' });
      //       }
      //     });
      //   }, fail: () => {
      //     wx.showModal({
      //       title: '温馨提示',
      //       content: '获取位置信息失败，请检查网络是否良好，以及是否禁用位置',
      //       showCancel: false,
      //     });
      //   }
      // });
      // console.log(orgData.data)
      // console.log(this.data)
      this.setData(_.extend({ currentUid: orgData.data.uid, }, data));
    }, this, {
        error: (code, msg) => {
          if (code == 404 || code == 5) {
            //信息未找到，或请求参数有误，直接返回当前页
            wx.navigateBack();
          }
        },
        completeAfter: () => {
          var user_info = wx.getStorageSync('user_info');
          console.log(222)
          //获取发布信息评论列表
          requestUtil.get(_Data.ekcms_services_comment_lists,
            { doc_id: this.id },
            (data) => {
              this.setData({ data: data });
            }, this, { completeAfter: wx.stopPullDownRefresh });
        }, isShowLoading: isShowLoading
      });
  },
  onGoodTap: function (e) {
    //赞
    if (requestUtil.isLoading(this.goodRQId)) return;
    //if(this.data.is_good) return false;
    var open_id=app.globalData.openid
    requestUtil.get(_Data.ekcms_services_documentGood, { id: this.id,open_id:open_id }, (res) => {
      if (res == 'nologin') {
        app.getUserInfo((userInfo) => that.setData({ userInfo: userInfo }));
        return;
      }
      const info = { id: this.id, good: res, is_good: !this.data.is_good };
      this.setData(info);
      listener.fireEventListener('severs.info.update', [info]);
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
  /**
   * 打开地图
   */
  onOpenMapTap: function () {
    // console.log(this.data)
    wx.openLocation({
      latitude: parseFloat(this.data.latitude),
      longitude: parseFloat(this.data.longitude),
      scale: 14,
      name: this.data.address,
      address: this.data.address
    });
  },
  /**
  * 删除
  */
  onDeleteTap: function (e) {
    if (requestUtil.isLoading(this.delRQId)) return;

    wx.showModal({
      title: '温馨提示',
      content: '删除后将不能恢复，你确定要删除这条信息吗？',
      success: (res) => {
        if (!res.confirm) return;

        requestUtil.get(_Data.ekcms_services_documentDel, { id: this.id }, (res) => {
          listener.fireEventListener('severs.info.delete', [this.id]);
          wx.navigateBack();
        });
      }
    })

  },
  /**
   * 审核
   */
  onCheckTap: function () {
    if (requestUtil.isLoading(this.checkRQId)) return;
    requestUtil.get(API_URL + "/index.php?s=/api/article/checked", { id: this.id }, () => {
      this.setData({ status: 1 });
      wx.showToast({
        title: '审核通过！',
        icon: 'success',
        duration: 1500,
        mask: true,
      });
    });
  },
  /**
   * 拨打电话
   */
  onCallTap: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.mobile,
    });
  },
  /**
   * 显示评论框
   */
  onShowCommentTap: function (e) {

    if (requestUtil.isLoading(this.commentRQId)) return;
    const dataset = e.currentTarget.dataset;
    const values = {
      index: dataset.index,
      reply_id: dataset.replyId,
      reply_uid: dataset.uid,
      doc_id: dataset.docId,
    };

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
  /**
   * 删除评论或回复
   */
  // onShowDeleteCommentTap: function (e) {
  //   const dataset = e.currentTarget.dataset, isShow = dataset.show, id = dataset.id, index = dataset.index, replyIndex = dataset.replyIndex, uid = dataset.uid;
  //   //console.log(dataset, uid);
  //   if (isShow != 1) return;

  //   const menu = ['删除'];
  //   this.data.is_admin && menu.push('拉黑');

  //   wx.showActionSheet({
  //     itemList: menu,
  //     success: (res) => {
  //       if (res.tapIndex == 0) {
  //         if (requestUtil.isLoading(this.deleteCommentRQId)) return;
  //         //删除评论
  //         this.deleteCommentRQId = requestUtil.get(_Data.ekcms_services_comment_delete, { id: id }, () => {
  //           if (replyIndex !== undefined) {
  //             this.data.data[index].reply_list.splice(replyIndex, 1);
  //             this.setData({ data: this.data.data });
  //           } else {
  //             this.data.data.splice(index, 1);
  //             this.setData({ data: this.data.data, comment: this.data.comment - 1 });
  //           }
  //         });
  //       } else {
  //         wx.showModal({
  //           title: '温馨提示',
  //           content: '拉黑之后将不能再次发帖，同时此用户所有帖子均为隐藏，你确定要拉黑此用户吗？',
  //           success: (res) => {
  //             if (res.cancel) return;

  //             requestUtil.get(_Data.ekcms_services_pullblack, { _uid: uid }, () => {
  //               listener.fireEventListener('severs.info.pullblack', [uid]);
  //               wx.showToast({
  //                 title: '已拉黑成功，可以在后台恢复发帖权限！',
  //                 duration: 3000, mask: true
  //               });
  //             });

  //           }
  //         });
  //       }
  //     }
  //   });
  // },
/**
 * 举报
 */
  jubao:function(e){
    var docid = e.currentTarget.dataset.docid
    wx.redirectTo({
      url: 'jubao?doc_id='+docid,
    })
  },

  /**
   * 提交评论
   */
  onCommentSubmit: function (e) {
    const values = _.extend({
      form_id: e.detail.formId
    }, e.detail.value, this.commentParam);
    values.open_id=app.globalData.openid
    this.commentRQId = requestUtil.post(_Data.ekcms_services_comment_add, values, (info) => {
      const data = this.data.data;
      if (values.reply_id) {
        //回复
        data[values.index].reply_list.push(info);
        data[values.index].reply_count++;
      } else {
        //评论
        info.reply_list = [];
        data.push(info);
        this.data.comment++;

        listener.fireEventListener('severs.info.update', [{ id: this.id, comment: this.data.comment }]);
      }
      this.setData({ data: data, comment: this.data.comment, show_comment: false });
    });
  },
  /**
   * 跳转页面
   */
  onNavigateTap: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    });
  },
  /**
   * 管理员拉黑
   */
  onPullBlackTap: function () {
    wx.showModal({
      title: '温馨提示',
      content: '拉黑之后将不能再次发帖，同时此用户所有帖子均为隐藏，你确定要拉黑此用户吗？',
      success: (res) => {
        if (res.cancel) return;

        requestUtil.get(_Data.ekcms_services_pullblack, { id: this.id }, () => {
          listener.fireEventListener('severs.info.pullblack', [this.data.uid]);
          wx.showToast({
            title: '已拉黑成功，可以在后台恢复发帖权限！',
            duration: 3000, mask: true
          });
        });

      }
    });
  },
  /**
   * 管理员置顶
   */
  onToggleTopTap: function () {
    var that = this;
    wx.request({
      url: _Data.ekcms_services_top,
      data: { id: this.id, day: this.data.top_day },
      success: function (info) {

        that.setData({ is_top: info.data.is_top, isShowTop: false });

      }
    });
  },

  /**
   * 取消置顶
   */
  cannelTopTap: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '你确定要取消置顶吗？',
      success: (res) => {

        wx.request({
          url: _Data.ekcms_services_top,
          data: { id: this.id, day: this.data.top_day },
          success: function (info) {
            that.setData({ is_top: info.data.is_top });

          }
        });

      }
    });
  },
  /**
   * 显示置顶选项
   */
  onShowTopTap: function () {
    this.setData({ isShowTop: true });
  },
  /**
   * 隐藏置顶选项
   */
  onHideTopTap: function () {
    this.setData({ isShowTop: false });
  },
  /**
   * 选择天数被改变
   */
  onTopDayChange: function (e) {
    const day = parseInt(e.detail.value);
    this.setData({ top_day: day });
  },
  /**
   * 切换功能菜单显示
   */
  onToggleShowActionMenuTap: function (e) {
    var that = this;

    var uid = wx.getStorageSync('uid');

    if (that.data.isShowActionMenu == false) {
      app.getUserInfo(function (cb) {
        requestUtil.get(_Data.ekcms_get_userinfo, {}, (res, res2) => {
          if (res2.is_admin == 1) {
            that.setData({ is_admin: true });
          }
          that.setData({ isShowActionMenu: !that.data.isShowActionMenu, uid: res2.uid });
          if (res2.is_admin == 1) wx.setStorageSync('is_admin', true);
        });
      });
    } else {
      that.setData({ isShowActionMenu: !that.data.isShowActionMenu, uid: uid });
    }
  },
  /**
   * 分享页面
   */
  onShareAppMessage: function () {
    const title = this.data.user.nickname + " 发布的信息" || ' ';
    const desc = this.data.content.substring(0, 50) + "..." || '';
    return {
      title: title,
      desc: desc,
      path: 'pages/severs/detail?id=' + this.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    };
  }
})