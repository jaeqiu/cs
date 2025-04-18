/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NodeAutoResizePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");

// src/utils.ts
function isTouchingBottom(node1, node2) {
  const left1 = node1.x;
  const right1 = node1.x + node1.width;
  const top1 = node1.y;
  const bottom1 = node1.y + node1.height;
  const left2 = node2.x;
  const right2 = node2.x + node2.width;
  const top2 = node2.y;
  const bottom2 = node2.y + node2.height;
  return Math.abs(bottom1 - top2) <= 20 && (left1 < right2 && right1 > left2);
}
function isTouchingRight(node1, node2) {
  const left1 = node1.x;
  const right1 = node1.x + node1.width;
  const top1 = node1.y;
  const bottom1 = node1.y + node1.height;
  const left2 = node2.x;
  const right2 = node2.x + node2.width;
  const top2 = node2.y;
  const bottom2 = node2.y + node2.height;
  return Math.abs(right1 - left2) <= 20 && (top1 < bottom2 && bottom1 > top2);
}
function adjustPositionsRecursively({
  movedNode,
  nodes
}, {
  adjustedHeight,
  adjustedWidth
}) {
  const requestMoveQueue = [];
  for (const node of nodes) {
    const currentX = node.bbox.minX;
    const currentY = node.bbox.minY;
    if (node.label)
      continue;
    if (isTouchingBottom(movedNode, node) && adjustedHeight !== 0) {
      requestMoveQueue.push({
        node,
        moveTo: {
          x: currentX,
          y: currentY + adjustedHeight + 20
        }
      });
      adjustPositionsRecursively({
        movedNode: node,
        nodes: nodes.filter((n) => n.id !== movedNode.id)
      }, {
        adjustedHeight,
        adjustedWidth: 0
      });
    } else if (isTouchingRight(movedNode, node) && adjustedWidth !== 0) {
      requestMoveQueue.push({
        node,
        moveTo: {
          x: currentX + adjustedWidth,
          y: currentY
        }
      });
      adjustPositionsRecursively({
        movedNode: node,
        nodes: nodes.filter((n) => n.id !== movedNode.id)
      }, {
        adjustedHeight: 0,
        adjustedWidth
      });
    }
  }
  requestMoveQueue.forEach(({ node, moveTo }) => {
    node.moveTo(moveTo);
  });
}

// src/main.ts
var DEFAULT_SETTINGS = {
  maxWidth: 400,
  widthAutoResize: true,
  trueWidth: true,
  emfactor: "2.0,1.8,1.6,1.4,1.2,1.0",
  padding: 80,
  cjkWidthFactor: 1.8
};
var trueCharacterWidth;
var updateNodeSize = (plugin) => {
  return import_view.EditorView.updateListener.of((v) => {
    if (v.docChanged) {
      const editor = v.state.field(import_obsidian.editorInfoField);
      if (editor == null ? void 0 : editor.node) {
        console.log(editor.node);
        const height = v.view.contentHeight;
        if (editor.node.height === height)
          return;
        let width = editor.node.width;
        if (plugin.settings.widthAutoResize) {
          const editorView = v.view;
          const currentDoc = editorView.state.doc;
          if (plugin.settings.trueWidth) {
            let longestLineLength = 0;
            for (const line of currentDoc.iterLines()) {
              const headerNumber = countLeadingHashtags(line);
              const emfactor = getEmFactor(plugin.settings.emfactor, headerNumber);
              const lineCharacterWidths = Array.from(line).map((ch) => {
                var _a;
                return (_a = trueCharacterWidth.get(ch)) != null ? _a : isCJKCharacter(ch) ? editorView.defaultCharacterWidth * plugin.settings.cjkWidthFactor : editorView.defaultCharacterWidth;
              });
              const trueLineLength = lineCharacterWidths.reduce((acc, curr) => acc + curr, 0);
              longestLineLength = Math.max(longestLineLength, trueLineLength * emfactor + plugin.settings.padding);
            }
            width = longestLineLength;
          } else {
            const firstLineLength = currentDoc.line(1).length;
            const headerNumber = countLeadingHashtags(currentDoc.line(1).text);
            const emfactor = getEmFactor(plugin.settings.emfactor, headerNumber);
            width = editorView.defaultCharacterWidth * firstLineLength * emfactor + plugin.settings.padding;
          }
        }
        const originalHeight = editor.node.height;
        const originalWidth = editor.node.width;
        const nodes = Array.from(editor.node.canvas.nodes.values());
        adjustPositionsRecursively({
          movedNode: editor.node,
          nodes
        }, {
          adjustedHeight: height - originalHeight,
          adjustedWidth: plugin.settings.widthAutoResize ? Math.max(width, plugin.settings.maxWidth) - originalWidth : 0
        });
        editor.node.resize({
          width: width > plugin.settings.maxWidth ? editor.node.width : width,
          height: height + 20
        });
        plugin.debounceSaveCanvas(editor.node.canvas);
      }
    }
  });
};
var NodeAutoResizePlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.debounceSaveCanvas = (0, import_obsidian.debounce)((canvas) => {
      canvas.requestSave();
    }, 200);
  }
  async onload() {
    this.loadSettings();
    this.addSettingTab(new NodeAutoResizeSettingTab(this.app, this));
    this.registerEditorExtension([updateNodeSize(this)]);
    this.registerEvent(this.app.workspace.on("css-change", populateTrueWidths));
    populateTrueWidths();
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
function measureCharacterWidths(font, size) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get canvas 2D context");
  }
  ctx.font = `${size} ${font}`;
  const widthMap = /* @__PURE__ */ new Map();
  for (let charCode = 65; charCode <= 90; charCode++) {
    const char = String.fromCharCode(charCode);
    widthMap.set(char, ctx.measureText(char).width);
  }
  for (let charCode = 97; charCode <= 122; charCode++) {
    const char = String.fromCharCode(charCode);
    widthMap.set(char, ctx.measureText(char).width);
  }
  for (let charCode = 48; charCode <= 57; charCode++) {
    const char = String.fromCharCode(charCode);
    widthMap.set(char, ctx.measureText(char).width);
  }
  const symbols = `!@#$%^&*()-_=+[{]}\\|;:'",<.>/? `;
  for (const char of symbols) {
    widthMap.set(char, ctx.measureText(char).width);
  }
  const commonCJKChars = "\u7684\u4E00\u662F\u5728\u4E0D\u4E86\u6709\u548C\u4EBA\u8FD9\u4E2D\u5927\u4E3A\u4E0A\u4E2A\u56FD\u6211\u4EE5\u8981\u4ED6\u65F6\u6765\u7528\u4EEC\u751F\u5230\u4F5C\u5730\u4E8E\u51FA\u5C31\u5206\u5BF9\u6210\u4F1A\u53EF\u4E3B\u53D1\u5E74\u52A8\u540C\u5DE5\u4E5F\u80FD\u4E0B\u8FC7\u5B50\u8BF4\u4EA7\u79CD\u9762\u800C\u65B9\u540E\u591A\u5B9A\u884C\u5B66\u6CD5\u6240\u6C11\u5F97\u7ECF\u5341\u4E09\u4E4B\u8FDB\u7740\u7B49\u90E8\u5EA6\u5BB6\u7535\u529B\u91CC\u5982\u6C34\u5316\u9AD8\u81EA\u4E8C\u7406\u8D77\u5C0F\u7269\u73B0\u5B9E\u52A0\u91CF\u90FD\u4E24\u4F53\u5236\u673A\u5F53\u4F7F\u70B9\u4ECE\u4E1A\u672C\u53BB\u628A\u6027\u597D\u5E94\u5F00\u5B83\u5408\u8FD8\u56E0\u7531\u5176\u4E9B\u7136\u524D\u5916\u5929\u653F\u56DB\u65E5\u90A3\u793E\u4E49\u4E8B\u5E73\u5F62\u76F8\u5168\u8868\u95F4\u6837\u4E0E\u5173\u5404\u91CD\u65B0\u7EBF\u5185\u6570\u6B63\u5FC3\u53CD\u4F60\u660E\u770B\u539F\u53C8\u4E48\u5229\u6BD4\u6216\u4F46\u8D28\u6C14\u7B2C\u5411\u9053\u547D\u6B64\u53D8\u6761\u53EA\u6CA1\u7ED3\u89E3\u95EE\u610F\u5EFA\u6708\u516C\u65E0\u7CFB\u519B\u5F88\u60C5\u8005\u6700\u7ACB\u4EE3\u60F3\u5DF2\u901A\u5E76\u63D0\u76F4\u9898\u515A\u7A0B\u5C55\u4E94\u679C\u6599\u8C61\u5458\u9769\u4F4D\u5165\u5E38\u6587\u603B\u6B21\u54C1\u5F0F\u6D3B\u8BBE\u53CA\u7BA1\u7279\u4EF6\u957F\u6C42\u8001\u5934\u57FA\u8D44\u8FB9\u6D41\u8DEF\u7EA7\u5C11\u56FE\u5C71\u7EDF\u63A5\u77E5\u8F83\u5C06\u7EC4\u89C1\u8BA1\u522B\u5979\u624B\u89D2\u671F\u6839\u8BBA\u8FD0\u519C\u6307\u51E0\u4E5D\u533A\u5F3A\u653E\u51B3\u897F\u88AB\u5E72\u505A\u5FC5\u6218\u5148\u56DE\u5219\u4EFB\u53D6\u6301\u5DE5\u53CD\u6536\u7ED3\u98CE\u79F0\u4F4D\u5165\u5E38\u6587\u603B\u6B21\u54C1\u5F0F\u6D3B\u8BBE\u53CA\u7BA1\u7279\u4EF6\u957F\u6C42\u8001\u5934\u57FA\u8D44\u8FB9\u6D41\u8DEF\u7EA7\u5C11\u56FE\u5C71\u7EDF\u63A5\u77E5\u8F83\u5C06\u7EC4\u89C1\u8BA1\u522B\u5979\u624B\u89D2\u671F\u6839\u8BBA\u8FD0\u519C\u6307\u51E0\u4E5D\u533A\u5F3A\u653E\u51B3\u897F\u88AB\u5E72\u505A\u5FC5\u6218\u5148\u56DE\u5219\u4EFB\u53D6\u6301\u5DE5\u4F53\u7CFB\u4F4E\u6301\u97F3\u4F17\u4E66\u5E03\u590D\u5BB9\u513F\u987B\u9645\u5546\u975E\u9A8C\u8FDE\u65AD\u6DF1\u96BE\u8FD1\u77FF\u5343\u5468\u59D4\u7D20\u6280\u5907\u534A\u529E\u9752\u7701\u5217\u4E60\u54CD\u7EA6\u652F\u822C\u53F2\u611F\u52B3\u4FBF\u56E2\u5F80\u9178\u5386\u5E02\u514B\u4F55\u9664\u6D88\u6784\u5E9C\u79F0\u592A\u51C6\u7CBE\u503C\u53F7\u7387\u65CF\u7EF4\u5212\u9009\u6807\u5199\u5B58\u5019\u6BDB\u4EB2\u5FEB\u6548\u65AF\u9662\u67E5\u6C5F\u578B\u773C\u738B\u6309\u683C\u517B\u6613\u7F6E\u6D3E\u5C42\u7247\u59CB\u5374\u4E13\u72B6\u80B2\u5382\u4EAC\u8BC6\u9002\u5C5E\u5706\u5305\u706B\u4F4F\u8C03\u6EE1\u53BF\u5C40\u7167\u53C2\u7EA2\u7EC6\u5F15\u542C\u8BE5\u94C1\u4EF7\u4E25\u9F99\u98DE";
  for (const char of commonCJKChars) {
    widthMap.set(char, ctx.measureText(char).width);
  }
  return widthMap;
}
function populateTrueWidths() {
  var _a, _b, _c, _d;
  const font = (_b = (_a = document.querySelector("body")) == null ? void 0 : _a.getCssPropertyValue("font-family")) != null ? _b : "Segeo UI";
  const size = (_d = (_c = document.querySelector("body")) == null ? void 0 : _c.getCssPropertyValue("font-size")) != null ? _d : "15px";
  trueCharacterWidth = measureCharacterWidths(font, size);
}
function getEmFactor(emfactor, headerNumber) {
  if (headerNumber == 0 || headerNumber > 6)
    return 1;
  const emfactorArray = emfactor.split(",");
  const parsedValue = parseFloat(emfactorArray[headerNumber - 1]);
  return isNaN(parsedValue) ? 1 : parsedValue;
}
function countLeadingHashtags(input) {
  const match = input.trimStart().match(/#+ /);
  return match ? match[0].length - 1 : 0;
}
function isCJKCharacter(char) {
  const code = char.charCodeAt(0);
  return code >= 19968 && code <= 40959 || code >= 13312 && code <= 19903 || code >= 63744 && code <= 64255 || code >= 65280 && code <= 65519 || code >= 12352 && code <= 12447 || code >= 12448 && code <= 12543 || code >= 12544 && code <= 12591 || code >= 44032 && code <= 55215 || code >= 11904 && code <= 12031 || code >= 12288 && code <= 12351;
}
var NodeAutoResizeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Auto resize for width").setDesc("Automatically resize the width of the node.").addToggle((toggle) => toggle.setValue(this.plugin.settings.widthAutoResize).onChange(async (value) => {
      this.plugin.settings.widthAutoResize = value;
      await this.plugin.saveSettings();
      setTimeout(() => {
        this.display();
      }, 100);
    }));
    if (this.plugin.settings.widthAutoResize) {
      new import_obsidian.Setting(containerEl).setName("Max width for auto resize").setDesc("The maximum width of the node.").addText((text) => text.setValue(this.plugin.settings.maxWidth.toString()).onChange(async (value) => {
        this.plugin.settings.maxWidth = parseInt(value);
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("True width as width").setDesc("Calculate width according to widest line instead of the first.").addToggle((toggle) => toggle.setValue(this.plugin.settings.trueWidth).onChange(async (value) => {
        this.plugin.settings.trueWidth = value;
        await this.plugin.saveSettings();
        setTimeout(() => {
          this.display();
        }, 100);
      }));
      new import_obsidian.Setting(containerEl).setName("Content padding").setDesc("Extra space to add around the content (in pixels).").addText((text) => text.setValue(this.plugin.settings.padding.toString()).onChange(async (value) => {
        this.plugin.settings.padding = parseInt(value);
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("CJK width factor").setDesc("Width multiplier for Chinese, Japanese, and Korean characters.").addText((text) => text.setValue(this.plugin.settings.cjkWidthFactor.toString()).onChange(async (value) => {
        this.plugin.settings.cjkWidthFactor = parseFloat(value);
        await this.plugin.saveSettings();
      }));
    }
  }
};

/* nosourcemap */