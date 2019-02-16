// pages/severs/frds_nearby.js
const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const ekcms_host_api_url = _Data.ekcms_host_api_url;
const requestUtil = require('../../utils/friend/requestUtil');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        isLoaded: false,//是否已加载过
        isEmpty: false,//数据是否为空
        hasMore: true,//是否还有更多数据
        page: 1,//当前请求的页数
        data: []
    },
    frdUid: 0,
    commentParam: {},
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.frdUid = options.uid;

        //加载缓存的配置信息
        this.setData({ config: wx.getStorageSync('servers_config') });

        this.onPullDownRefresh();

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
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        //移除注册的事件
        listener.removeEventListener('severs.info.add', this.onPullDownRefresh);
        listener.removeEventListener('severs.info.update', this.onPullDownRefresh);
        listener.removeEventListener('severs.info.delete', this.onPullDownRefresh);
        listener.removeEventListener('severs.info.pullblack', this.onPullDownRefresh);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        const location = this.location;
        requestUtil.get(ekcms_host_api_url + "/index.php?s=/api/article/getUserDocs", {
            uid: this.frdUid
        }, (data, res) => {
            wx.setNavigationBarTitle({
                title: res.nickname + "的信息",
            });
            this.setData({
                info_count: res.info_count,
                total_click: res.total_click,
                total_good: res.total_good,
                nickname: res.nickname,
                sex: res.sex,
                headimgurl: res.headimgurl,
            });
            this.onSetData(data, 1);
        }, this, { completeAfter: wx.stopPullDownRefresh });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (!this.data.hasMore) {
            console.log("没有更多了...");
            wx.stopPullDownRefresh();
            return;
        }

        //加载新数据
        requestUtil.get(ekcms_host_api_url + "/index.php?s=/api/article/getUserDocs", _.extend({
            _p: this.data.page + 1, uid: this.frdUid
        }, this.data.param), (data) => {
            this.onDataHandler(data);
            this.onSetData(data, this.data.page + 1);
        }, this, { completeAfter: wx.stopPullDownRefresh, isShowLoading: false });
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
        this.onDataHandler(data);
        this.setData({
            page: page !== undefined ? page : this.data.page,
            data: page === 1 || page === undefined ? data : this.data.data.concat(data),
            hasMore: page !== undefined && data.length === 20,
            isEmpty: page === 1 || page === undefined ? data.length === 0 : false,
            isLoaded: true,
        });
    },
    /**
    * 跳转页面
    */
    onNavigateTap: function (e) {
        const url = e.currentTarget.dataset.url;
        if (url.indexOf("frd_info") != -1) return;
        wx.navigateTo({
            url: url
        })
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

        this.goodRQId = requestUtil.get(_Data.ekcms_services_documentGood, { id: id }, (res) => {
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
    /**
     * 隐藏评论框
     */
    onHideCommentTap: function () {
        this.setData({ show_comment: false });
    },
    /**
     * 提交评论
     */
    onCommentSubmit: function (e) {
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
})