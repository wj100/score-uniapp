"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  data() {
    return {
      players: [],
      playerA1: "",
      playerA2: "",
      playerB1: "",
      playerB2: "",
      scoreA: "",
      scoreB: "",
      selectedPlayerA1Index: -1,
      selectedPlayerA2Index: -1,
      selectedPlayerB1Index: -1,
      selectedPlayerB2Index: -1,
      todayMatches: []
    };
  },
  computed: {
    selectedPlayers() {
      return [this.playerA1, this.playerA2, this.playerB1, this.playerB2].filter((p) => p);
    },
    availablePlayersA1() {
      return this.players.filter((player) => !this.selectedPlayers.includes(player) || player === this.playerA1);
    },
    availablePlayersA2() {
      return this.players.filter((player) => !this.selectedPlayers.includes(player) || player === this.playerA2);
    },
    availablePlayersB1() {
      return this.players.filter((player) => !this.selectedPlayers.includes(player) || player === this.playerB1);
    },
    availablePlayersB2() {
      return this.players.filter((player) => !this.selectedPlayers.includes(player) || player === this.playerB2);
    },
    canSubmit() {
      return this.playerA1 && this.playerA2 && this.playerB1 && this.playerB2 && this.playerA1 !== this.playerA2 && this.playerB1 !== this.playerB2 && this.selectedPlayers.length === 4 && new Set(this.selectedPlayers).size === 4 && this.scoreA !== "" && this.scoreB !== "" && (parseInt(this.scoreA) > 0 || parseInt(this.scoreB) > 0);
    }
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    this.loadTodayMatches();
  },
  methods: {
    loadData() {
      this.players = utils_storage.getPlayers();
      this.loadTodayMatches();
    },
    loadTodayMatches() {
      const allMatches = utils_storage.getDoubleMatches();
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      this.todayMatches = allMatches.filter((match) => match.date === today);
    },
    onPlayerA1Change(e) {
      this.selectedPlayerA1Index = e.detail.value;
      this.playerA1 = this.availablePlayersA1[e.detail.value];
      this.updateAvailableIndexes();
    },
    onPlayerA2Change(e) {
      this.selectedPlayerA2Index = e.detail.value;
      this.playerA2 = this.availablePlayersA2[e.detail.value];
      this.updateAvailableIndexes();
    },
    onPlayerB1Change(e) {
      this.selectedPlayerB1Index = e.detail.value;
      this.playerB1 = this.availablePlayersB1[e.detail.value];
      this.updateAvailableIndexes();
    },
    onPlayerB2Change(e) {
      this.selectedPlayerB2Index = e.detail.value;
      this.playerB2 = this.availablePlayersB2[e.detail.value];
      this.updateAvailableIndexes();
    },
    updateAvailableIndexes() {
      if (this.playerA1) {
        this.selectedPlayerA1Index = this.availablePlayersA1.indexOf(this.playerA1);
      }
      if (this.playerA2) {
        this.selectedPlayerA2Index = this.availablePlayersA2.indexOf(this.playerA2);
      }
      if (this.playerB1) {
        this.selectedPlayerB1Index = this.availablePlayersB1.indexOf(this.playerB1);
      }
      if (this.playerB2) {
        this.selectedPlayerB2Index = this.availablePlayersB2.indexOf(this.playerB2);
      }
    },
    onScoreAInput(e) {
      this.scoreA = e.detail.value;
    },
    onScoreBInput(e) {
      this.scoreB = e.detail.value;
    },
    submitScore() {
      if (!this.canSubmit) {
        return;
      }
      const match = {
        teamA: [this.playerA1, this.playerA2],
        teamB: [this.playerB1, this.playerB2],
        scoreA: parseInt(this.scoreA),
        scoreB: parseInt(this.scoreB)
      };
      const result = utils_storage.saveDoubleMatch(match);
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
    },
    resetForm() {
      this.playerA1 = "";
      this.playerA2 = "";
      this.playerB1 = "";
      this.playerB2 = "";
      this.scoreA = "";
      this.scoreB = "";
      this.selectedPlayerA1Index = -1;
      this.selectedPlayerA2Index = -1;
      this.selectedPlayerB1Index = -1;
      this.selectedPlayerB2Index = -1;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.playerA1 || "选择队员1"),
    b: $data.selectedPlayerA1Index,
    c: $options.availablePlayersA1,
    d: common_vendor.o((...args) => $options.onPlayerA1Change && $options.onPlayerA1Change(...args)),
    e: common_vendor.t($data.playerA2 || "选择队员2"),
    f: $data.selectedPlayerA2Index,
    g: $options.availablePlayersA2,
    h: common_vendor.o((...args) => $options.onPlayerA2Change && $options.onPlayerA2Change(...args)),
    i: common_vendor.t($data.playerB1 || "选择队员3"),
    j: $data.selectedPlayerB1Index,
    k: $options.availablePlayersB1,
    l: common_vendor.o((...args) => $options.onPlayerB1Change && $options.onPlayerB1Change(...args)),
    m: common_vendor.t($data.playerB2 || "选择队员4"),
    n: $data.selectedPlayerB2Index,
    o: $options.availablePlayersB2,
    p: common_vendor.o((...args) => $options.onPlayerB2Change && $options.onPlayerB2Change(...args)),
    q: common_vendor.o([($event) => $data.scoreA = $event.detail.value, (...args) => $options.onScoreAInput && $options.onScoreAInput(...args)]),
    r: $data.scoreA,
    s: common_vendor.o([($event) => $data.scoreB = $event.detail.value, (...args) => $options.onScoreBInput && $options.onScoreBInput(...args)]),
    t: $data.scoreB,
    v: !$options.canSubmit ? 1 : "",
    w: common_vendor.o((...args) => $options.submitScore && $options.submitScore(...args)),
    x: !$options.canSubmit,
    y: $data.todayMatches.length === 0
  }, $data.todayMatches.length === 0 ? {} : {
    z: common_vendor.f($data.todayMatches, (match, k0, i0) => {
      return {
        a: common_vendor.t(match.teamA.join("&")),
        b: common_vendor.t(match.teamB.join("&")),
        c: common_vendor.t(match.scoreA),
        d: common_vendor.t(match.scoreB),
        e: match.id
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-14f279f1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/double/double.js.map
