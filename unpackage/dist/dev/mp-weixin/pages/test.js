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
        common_vendor.index.__f__("log", "at pages/test.vue:48", "初始化结果:", result);
      } catch (error) {
        this.result = `初始化失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:51", "初始化失败:", error);
      }
    },
    async testGetPlayers() {
      try {
        this.result = "正在获取队员列表...";
        this.players = await utils_storage.getPlayers();
        this.result = `获取到 ${this.players.length} 个队员`;
        common_vendor.index.__f__("log", "at pages/test.vue:60", "获取到的队员:", this.players);
      } catch (error) {
        this.result = `获取失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:63", "获取队员失败:", error);
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
        common_vendor.index.__f__("log", "at pages/test.vue:78", "云函数原始返回:", result);
        this.result = `云函数返回: ${JSON.stringify(result.result, null, 2)}`;
      } catch (error) {
        this.result = `云函数调用失败: ${error.message}`;
        common_vendor.index.__f__("error", "at pages/test.vue:83", "云函数调用失败:", error);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.testInitPlayers && $options.testInitPlayers(...args)),
    b: common_vendor.o((...args) => $options.testGetPlayers && $options.testGetPlayers(...args)),
    c: common_vendor.o((...args) => $options.testCloudFunction && $options.testCloudFunction(...args)),
    d: common_vendor.t($data.result),
    e: $data.players.length > 0
  }, $data.players.length > 0 ? {
    f: common_vendor.f($data.players, (player, index, i0) => {
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
