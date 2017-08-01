//app.js
App({
    onLaunch: function() {
    },
    getUserInfo: function(cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function() {
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    });
                }
            });
        }
    },
    getSession: function(cb) {
        var that = this;
        var s = function() {
            wx.login({
                success: function(res) {
                    var code = res.code;
                    if (!code) {
                        wx.showModal({ title: '警告', content: '获取用户登录态失败！' });
                        return;
                    }
                    // 用户登陆敏感信息一起存入
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function(res) {
                            wx.request({
                                url: that.globalData.domain + '/base/wx_session',
                                data: {
                                    code: code,
                                    customer_id: that.globalData.cid,
                                    iv: res.iv,
                                    rawData: res.rawData,
                                    signature: res.signature,
                                    encryptedData: res.encryptedData
                                },
                                success: function(res) {
                                    if (res.data.code != 1) {
                                        wx.showToast({ title: '获取登陆信息失败,' + res.data.desc });
                                        return;
                                    }
                                    var session = res.data.data.session;
                                    wx.setStorageSync('3rd_session', session);
                                    // 设置过期时间
                                    var date = new Date();
                                    wx.setStorageSync('3rd_session_expire', date.getTime() + 3600 * 1000);
                                    typeof cb == "function" && cb(session);
                                }
                            });
                        },
                        fail: function() {
                            wx.showModal({
                                title: '警告',
                                content: '您点击了拒绝授权，将无法正常使用商城等的功能体验。请10分钟后再次点击授权，或者删除小程序重新进入。',
                                success: function(res) {
                                    if (res.confirm) {
                                        wx.navigateTo("/pages/index/index");
                                    }
                                }
                            });
                        }
                    });
                },
                fail: function() {
                    wx.showModal({ title: '出错啦！', content: '用户登录失败！' });
                    return;
                }
            });
        };
        wx.checkSession({
            success: function() {
                var session = wx.getStorageSync('3rd_session');
                var expire = wx.getStorageSync('3rd_session_expire') || 0;
                var date = new Date();
                if (session == "" || date.getTime() > expire) {
                    s();
                }
                typeof cb == "function" && cb(session);
            },
            fail: s
        });
    },
    onShow: function() {
    },
    onHide: function() {
    },
    globalData: {
        session: null,
        domain: "https://api.jinhumalasong.cn",
    }
})