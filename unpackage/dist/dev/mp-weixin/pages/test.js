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
        common_vendor.index.__f__("log", "at pages/test.vue:50", "初始化结果:", result);
      } catch (error) {
        this.result = `初始化失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:53", "初始化失败:", error);
      }
    },
    async testGetPlayers() {
      try {
        this.result = "正在获取队员列表...";
        this.players = await utils_storage.getPlayers();
        this.result = `获取到 ${this.players.length} 个队员`;
        common_vendor.index.__f__("log", "at pages/test.vue:62", "获取到的队员:", this.players);
      } catch (error) {
        this.result = `获取失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:65", "获取队员失败:", error);
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
        common_vendor.index.__f__("log", "at pages/test.vue:87", "提交比赛结果:", result);
        this.result = `提交比赛结果: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `提交比赛失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:92", "提交比赛失败:", error);
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
        common_vendor.index.__f__("log", "at pages/test.vue:111", "获取比赛记录结果:", result);
        if (result.result.code === 0) {
          common_vendor.index.__f__("log", "at pages/test.vue:114", "比赛数据:", result.result.data);
          result.result.data.forEach((match) => {
            common_vendor.index.__f__("log", "at pages/test.vue:117", "比赛时间戳:", match.time);
            common_vendor.index.__f__("log", "at pages/test.vue:118", "比赛日期字符串:", match.date);
            const testDate = new Date(match.time * 1e3);
            common_vendor.index.__f__("log", "at pages/test.vue:120", "转换后的日期:", testDate.toLocaleString());
          });
        }
        this.result = `获取比赛记录结果: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `获取比赛记录失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:128", "获取比赛记录失败:", error);
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
        common_vendor.index.__f__("log", "at pages/test.vue:143", "云函数原始返回:", result);
        this.result = `云函数返回: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `云函数调用失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:148", "云函数调用失败:", error);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.testInitPlayers && $options.testInitPlayers(...args)),
    b: common_vendor.o((...args) => $options.testGetPlayers && $options.testGetPlayers(...args)),
    c: common_vendor.o((...args) => $options.testSubmitMatch && $options.testSubmitMatch(...args)),
    d: common_vendor.o((...args) => $options.testGetMatches && $options.testGetMatches(...args)),
    e: common_vendor.o((...args) => $options.testCloudFunction && $options.testCloudFunction(...args)),
    f: common_vendor.t($data.result),
    g: $data.players.length > 0
  }, $data.players.length > 0 ? {
    h: common_vendor.f($data.players, (player, index, i0) => {
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
