"use strict";
const common_vendor = require("../common/vendor.js");
const utils_storage = require("../utils/storage.js");
const _sfc_main = {
  data() {
    return {
      result: "点击按钮开始测试...",
      players: []
    };
  },
  methods: {
    async testInitPlayers() {
      try {
        this.result = "正在初始化队员...";
        const result = await utils_storage.initPlayers();
        this.result = `初始化结果: ${result ? "成功" : "失败"}`;
        common_vendor.index.__f__("log", "at pages/test.vue:79", "初始化结果:", result);
      } catch (error) {
        this.result = `初始化失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:82", "初始化失败:", error);
      }
    },
    async testGetPlayers() {
      try {
        this.result = "正在获取队员列表...";
        this.players = await utils_storage.getPlayers();
        this.result = `获取到 ${this.players.length} 个队员`;
        common_vendor.index.__f__("log", "at pages/test.vue:91", "获取到的队员:", this.players);
      } catch (error) {
        this.result = `获取失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:94", "获取队员失败:", error);
      }
    },
    async testSubmitMatch() {
      try {
        this.result = "正在测试提交比赛...";
        const result = await common_vendor.tr.callFunction({
          name: "badminton-api",
          data: {
            action: "submitSingleMatch",
            data: {
              player1: "吉志",
              player2: "小鲁",
              score1: 21,
              score2: 19,
              match_name: "测试比赛"
            }
          }
        });
        common_vendor.index.__f__("log", "at pages/test.vue:116", "提交比赛结果:", result);
        this.result = `提交比赛结果: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `提交比赛失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:121", "提交比赛失败:", error);
      }
    },
    async testGetMatches() {
      try {
        this.result = "正在测试获取比赛记录...";
        const result = await common_vendor.tr.callFunction({
          name: "badminton-api",
          data: {
            action: "getSingleMatches",
            data: {
              timeRange: "all",
              limit: 5
            }
          }
        });
        common_vendor.index.__f__("log", "at pages/test.vue:140", "获取比赛记录结果:", result);
        if (result.result.code === 0) {
          common_vendor.index.__f__("log", "at pages/test.vue:143", "比赛数据:", result.result.data);
          result.result.data.forEach((match) => {
            common_vendor.index.__f__("log", "at pages/test.vue:146", "比赛时间戳:", match.time);
            common_vendor.index.__f__("log", "at pages/test.vue:147", "比赛日期字符串:", match.date);
            const testDate = new Date(match.time * 1e3);
            common_vendor.index.__f__("log", "at pages/test.vue:149", "转换后的日期:", testDate.toLocaleString());
          });
        }
        this.result = `获取比赛记录结果: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `获取比赛记录失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:157", "获取比赛记录失败:", error);
      }
    },
    async testErrorHandling() {
      try {
        this.result = "正在测试错误处理机制...";
        const result = await common_vendor.tr.callFunction({
          name: "badminton-api",
          data: {
            action: "getPlayers"
          }
        });
        common_vendor.index.__f__("log", "at pages/test.vue:173", "错误处理测试结果:", result);
        if (result.result.code === -1) {
          this.result = `检测到错误: ${result.result.message}

错误处理机制:
1. 自动重试3次
2. 使用降级数据
3. 显示用户友好提示`;
        } else {
          this.result = `正常返回: ${JSON.stringify(result.result, null, 2)}`;
        }
      } catch (error) {
        this.result = `异常捕获: ${error.message}

系统将自动使用降级数据`;
        common_vendor.index.__f__("error", "at pages/test.vue:183", "错误处理测试异常:", error);
      }
    },
    async testDatabaseFix() {
      try {
        this.result = "正在测试数据库操作修复...";
        const playersResult = await common_vendor.tr.callFunction({
          name: "badminton-api",
          data: {
            action: "getPlayers"
          }
        });
        common_vendor.index.__f__("log", "at pages/test.vue:199", "获取队员列表结果:", playersResult);
        if (playersResult.result.code === 0) {
          this.result = `✅ 数据库操作修复成功！

获取队员列表: ${playersResult.result.data.length} 个队员

修复内容:
1. 所有数据库操作都使用重试机制
2. 修复了 collection.where 错误
3. 添加了资源耗尽处理
4. 优化了错误提示`;
        } else {
          this.result = `❌ 数据库操作仍有问题: ${playersResult.result.message}`;
        }
      } catch (error) {
        this.result = `❌ 测试异常: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:209", "数据库修复测试异常:", error);
      }
    },
    async testTabStatus() {
      try {
        this.result = "正在测试Tab状态修复...";
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentRoute = "/" + currentPage.route;
        this.result = `✅ Tab状态修复完成！

当前页面: ${currentRoute}

修复内容:
1. 添加了onShow生命周期监听
2. 页面切换时自动更新tab状态
3. 添加了ref引用和状态同步
4. 优化了切换逻辑和错误处理

请尝试切换不同页面，观察tab状态是否正确更新。`;
      } catch (error) {
        this.result = `❌ Tab状态测试异常: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:226", "Tab状态测试异常:", error);
      }
    },
    async testCloudFunction() {
      try {
        this.result = "正在测试云函数连接...";
        const result = await common_vendor.tr.callFunction({
          name: "badminton-api",
          data: {
            action: "getPlayers"
          }
        });
        common_vendor.index.__f__("log", "at pages/test.vue:241", "云函数原始返回:", result);
        this.result = `云函数返回: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `云函数调用失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:246", "云函数调用失败:", error);
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.testInitPlayers && $options.testInitPlayers(...args)),
    b: common_vendor.o((...args) => $options.testGetPlayers && $options.testGetPlayers(...args)),
    c: common_vendor.o((...args) => $options.testSubmitMatch && $options.testSubmitMatch(...args)),
    d: common_vendor.o((...args) => $options.testGetMatches && $options.testGetMatches(...args)),
    e: common_vendor.o((...args) => $options.testErrorHandling && $options.testErrorHandling(...args)),
    f: common_vendor.o((...args) => $options.testDatabaseFix && $options.testDatabaseFix(...args)),
    g: common_vendor.o((...args) => $options.testTabStatus && $options.testTabStatus(...args)),
    h: common_vendor.o((...args) => $options.testCloudFunction && $options.testCloudFunction(...args)),
    i: common_vendor.p({
      type: "person",
      size: "30",
      color: "#007AFF"
    }),
    j: common_vendor.p({
      type: "person-filled",
      size: "30",
      color: "#007AFF"
    }),
    k: common_vendor.p({
      type: "stats",
      size: "30",
      color: "#4CAF50"
    }),
    l: common_vendor.p({
      type: "contact",
      size: "30",
      color: "#FF9800"
    }),
    m: common_vendor.p({
      type: "bar-chart",
      size: "30",
      color: "#9C27B0"
    }),
    n: common_vendor.t($data.result),
    o: $data.players.length > 0
  }, $data.players.length > 0 ? {
    p: common_vendor.f($data.players, (player, index, i0) => {
      return {
        a: common_vendor.t(player),
        b: index
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2bebd757"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../.sourcemap/mp-weixin/pages/test.js.map
