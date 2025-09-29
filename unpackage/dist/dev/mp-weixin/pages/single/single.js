"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  data() {
    return {
      players: [],
      player1: "",
      player2: "",
      score1: "",
      score2: "",
      selectedPlayer1Index: 0,
      selectedPlayer2Index: 0,
      todayMatches: [],
      showPlayerModal: false,
      modalPlayerList: [],
      selectingPlayer: "",
      // 'player1' or 'player2'
      selectedModalPlayer: ""
    };
  },
  computed: {
    availablePlayers1() {
      return this.players.filter((player) => player !== this.player2);
    },
    availablePlayers2() {
      return this.players.filter((player) => player !== this.player1);
    },
    // 返回中间位置的索引
    middleIndex1() {
      const length = this.availablePlayers1.length;
      return length > 0 ? Math.floor(length / 2) : 0;
    },
    middleIndex2() {
      const length = this.availablePlayers2.length;
      return length > 0 ? Math.floor(length / 2) : 0;
    },
    canSubmit() {
      return this.player1 && this.player2 && this.player1 !== this.player2 && this.score1 !== "" && this.score2 !== "" && (parseInt(this.score1) > 0 || parseInt(this.score2) > 0);
    }
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    this.loadTodayMatches();
  },
  methods: {
    async loadData() {
      try {
        common_vendor.index.__f__("log", "at pages/single/single.vue:187", "开始加载队员数据...");
        this.players = await utils_storage.getPlayers();
        common_vendor.index.__f__("log", "at pages/single/single.vue:189", "获取到的队员列表:", this.players);
        if (this.players.length === 0) {
          common_vendor.index.__f__("log", "at pages/single/single.vue:192", "队员列表为空，尝试初始化...");
          common_vendor.index.showLoading({
            title: "正在初始化数据..."
          });
          const initResult = await utils_storage.initPlayers();
          common_vendor.index.__f__("log", "at pages/single/single.vue:199", "初始化结果:", initResult);
          common_vendor.index.hideLoading();
          if (initResult) {
            this.players = await utils_storage.getPlayers();
            common_vendor.index.__f__("log", "at pages/single/single.vue:205", "重新获取队员列表:", this.players);
            common_vendor.index.showToast({
              title: "数据初始化成功",
              icon: "success"
            });
          } else {
            this.players = ["言志", "小鲁", "建华", "汪骏", "杭宁"];
            common_vendor.index.showToast({
              title: "网络异常，使用离线数据",
              icon: "none",
              duration: 3e3
            });
          }
        }
        this.loadTodayMatches();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/single/single.vue:223", "加载队员数据失败:", error);
        this.players = ["言志", "小鲁", "建华", "汪骏", "杭宁"];
        common_vendor.index.showToast({
          title: "网络异常，使用离线数据",
          icon: "none",
          duration: 3e3
        });
      }
    },
    async loadTodayMatches() {
      const allMatches = await utils_storage.getSingleMatches("today");
      this.todayMatches = allMatches;
    },
    onPlayer1Change(e) {
      this.selectedPlayer1Index = e.detail.value;
      this.player1 = this.availablePlayers1[e.detail.value];
      this.adjustPlayer2Index();
    },
    onPlayer2Change(e) {
      this.selectedPlayer2Index = e.detail.value;
      this.player2 = this.availablePlayers2[e.detail.value];
      this.adjustPlayer1Index();
    },
    adjustPlayer1Index() {
      if (this.player1) {
        this.selectedPlayer1Index = this.availablePlayers1.indexOf(this.player1);
      }
    },
    adjustPlayer2Index() {
      if (this.player2) {
        this.selectedPlayer2Index = this.availablePlayers2.indexOf(this.player2);
      }
    },
    onScore1Input(e) {
      this.score1 = e.detail.value;
    },
    onScore2Input(e) {
      this.score2 = e.detail.value;
    },
    async submitScore() {
      if (!this.canSubmit) {
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      try {
        const match = {
          player1: this.player1,
          player2: this.player2,
          score1: parseInt(this.score1),
          score2: parseInt(this.score2)
        };
        const result = await utils_storage.saveSingleMatch(match);
        if (result) {
          common_vendor.index.showToast({
            title: "提交成功",
            icon: "success"
          });
          this.resetForm();
          this.loadTodayMatches();
        } else {
          common_vendor.index.showToast({
            title: "提交失败",
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/single/single.vue:306", "提交失败:", error);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "error"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    resetForm() {
      this.player1 = "";
      this.player2 = "";
      this.score1 = "";
      this.score2 = "";
      this.selectedPlayer1Index = -1;
      this.selectedPlayer2Index = -1;
    },
    showPlayerSelector(playerType) {
      this.selectingPlayer = playerType;
      this.modalPlayerList = playerType === "player1" ? this.availablePlayers1 : this.availablePlayers2;
      this.showPlayerModal = true;
    },
    selectPlayer(player) {
      this.selectedModalPlayer = player;
    },
    confirmPlayer() {
      if (this.selectedModalPlayer) {
        if (this.selectingPlayer === "player1") {
          this.player1 = this.selectedModalPlayer;
          this.adjustPlayer1Index();
        } else {
          this.player2 = this.selectedModalPlayer;
          this.adjustPlayer2Index();
        }
      }
      this.closePlayerModal();
    },
    closePlayerModal() {
      this.showPlayerModal = false;
      this.selectedModalPlayer = "";
      this.selectingPlayer = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.player1 || "选择队员1"),
    b: $options.middleIndex1,
    c: $options.availablePlayers1,
    d: common_vendor.o((...args) => $options.onPlayer1Change && $options.onPlayer1Change(...args)),
    e: common_vendor.t($data.player2 || "选择队员2"),
    f: $options.middleIndex2,
    g: $options.availablePlayers2,
    h: common_vendor.o((...args) => $options.onPlayer2Change && $options.onPlayer2Change(...args)),
    i: common_vendor.t($data.player1 || "队员1"),
    j: common_vendor.o([($event) => $data.score1 = $event.detail.value, (...args) => $options.onScore1Input && $options.onScore1Input(...args)]),
    k: $data.score1,
    l: common_vendor.t($data.player2 || "队员2"),
    m: common_vendor.o([($event) => $data.score2 = $event.detail.value, (...args) => $options.onScore2Input && $options.onScore2Input(...args)]),
    n: $data.score2,
    o: !$options.canSubmit ? 1 : "",
    p: common_vendor.o((...args) => $options.submitScore && $options.submitScore(...args)),
    q: !$options.canSubmit,
    r: $data.todayMatches.length === 0
  }, $data.todayMatches.length === 0 ? {} : {
    s: common_vendor.f($data.todayMatches, (match, k0, i0) => {
      return {
        a: common_vendor.t(match.player1),
        b: common_vendor.t(match.player2),
        c: common_vendor.t(match.score1),
        d: common_vendor.t(match.score2),
        e: match.id
      };
    })
  }, {
    t: $data.showPlayerModal
  }, $data.showPlayerModal ? {
    v: common_vendor.f($data.modalPlayerList, (player, index, i0) => {
      return {
        a: common_vendor.t(player),
        b: index,
        c: common_vendor.o(($event) => $options.selectPlayer(player), index)
      };
    }),
    w: common_vendor.o((...args) => $options.closePlayerModal && $options.closePlayerModal(...args)),
    x: common_vendor.o((...args) => $options.confirmPlayer && $options.confirmPlayer(...args)),
    y: common_vendor.o(() => {
    }),
    z: common_vendor.o((...args) => $options.closePlayerModal && $options.closePlayerModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6410b918"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/single/single.js.map
