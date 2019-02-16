const app = getApp();
const _ = require('../../utils/friend/underscore');
const util = require('../../utils/friend/util');
const _Data = require('../../utils//friend/data');
const requestUtil = require('../../utils/friend/requestUtil');

Page({
    data: {},
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        //获取分类
        requestUtil.get(_Data.ekcms_services_categorys, {}, (data) => {
            //数据进行分组，四个为1组
            const group = [];
            var i = -1;
            for (var x in data) {
                if (x % 4 === 0) {
                    group[++i] = [];
                }
                group[i].push(data[x]);
            }
            this.setData({ data: group });
        }, this);
    },
    onNavigateTap: function (e) {
        //跳转页面
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        })
    },
})