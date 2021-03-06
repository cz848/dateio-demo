module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1594336852650, function(require, module, exports) {
/**
 * 统一处理日期或格式化输出
 * Author: Tyler.Chao
 * github: https://github.com/cz848/dateio
 */

// 位数不够前补0，为了更好的兼容，用slice替代padStart
const zeroFill = (number, targetLength) => `00${number}`.slice(-targetLength || -2);

// 首字母大写
const capitalize = str => str.replace(/^[a-z]/, a => a.toUpperCase());

// 取整数部分
const intPart = n => Number.parseInt(n, 10);

// 匹配不同方法的正则
const formatsRegExp = /MS|ms|[YMDWHISAUymdwhisau]/g;
const getUnitRegExp = /^(?:MS|ms|[YMDWHISAUymdwhisau])$/;
const setUnitRegExp = /^(?:ms|[Uymdhisu])$/;
const addUnitRegExp = /^([+-]?\d+(?:\.\d+)?)(ms|[ymdwhis])?$/;
// 每个时间单位对应的毫秒数
const unitStep = {
  ms: 1,
  s: 1e3,
  i: 6e4,
  h: 36e5,
  d: 864e5,
  w: 864e5 * 7,
  m: 864e5 * 30, // ~
  y: 864e5 * 365, // ~
};
// 语言包
let I18N = {
  weekdays: ['日', '一', '二', '三', '四', '五', '六'],
  // 默认四个时段，可根据需要增减
  interval: ['凌晨', '上午', '下午', '晚上'],
};

// 设置语言包
const locale = config => {
  if (config instanceof Object && !Array.isArray(config)) I18N = { ...I18N, ...config };
  return I18N;
};

// from moment.js in order to keep the same result
const monthDiff = (a, b) => {
  const wholeMonthDiff = (b.y() - a.y()) * 12 + (b.m() - a.m());
  const anchor = a.clone().add(wholeMonthDiff, 'm');
  const anchor2 = a.clone().add(wholeMonthDiff + (b > anchor ? 1 : -1), 'm');
  return -(wholeMonthDiff + (b - anchor) / Math.abs(anchor2 - anchor)) || 0;
};

// 转换为可识别的日期格式
const toDate = input => {
  if (!(input || input === 0)) return new Date();
  if (typeof input === 'string' && !/Z$/i.test(input)) return new Date(input.replace(/-/g, '/'));
  // TODO: 与原生行为有出入
  if (Array.isArray(input) && input.length !== 1) return new Date(...input);
  return new Date(input);
};

class DateIO {
  constructor(input) {
    this.I18N = locale();
    this.init(input);
  }

  init(input) {
    this.$date = toDate(input);
    return this;
  }

  $get(type) {
    const value = this.$date[`get${capitalize(type)}`]();
    return value + Number(type === 'month');
  }

  $set(type, ...input) {
    // 处理原生月份的偏移量
    if (type === 'fullYear' && input.length > 1) input[1] -= 1;
    else if (type === 'month') input[0] -= 1;
    this.$date[`set${capitalize(type)}`](...input);
    return this;
  }

  // 年
  // 100...2020
  y(...input) {
    return input.length ? this.$set('fullYear', ...input) : this.$get('fullYear');
  }

  // 年 (4位)
  // 0100...2020
  Y() {
    return zeroFill(this.y(), 4);
  }

  // 加偏移后的月
  // 1...12
  m(...input) {
    return input.length ? this.$set('month', ...input) : this.$get('month');
  }

  // 月 (前导0)
  // 01...12
  M() {
    return zeroFill(this.m());
  }

  // 日
  // 1...31
  d(...input) {
    return input.length ? this.$set('date', ...input) : this.$get('date');
  }

  // 日 (前导0)
  // 01...31
  D() {
    return zeroFill(this.d());
  }

  // 周几
  // 0...6
  w() {
    return this.$get('day');
  }

  // 周几
  // 本地化后的星期x
  W() {
    return this.I18N.weekdays[this.w()];
  }

  // 24小时制
  // 0...23
  h(...input) {
    return input.length ? this.$set('hours', ...input) : this.$get('hours');
  }

  // 24小时制 (前导0)
  // 00...23
  H() {
    return zeroFill(this.h());
  }

  // 分
  // 0...59
  i(...input) {
    return input.length ? this.$set('minutes', ...input) : this.$get('minutes');
  }

  // 分 (前导0)
  // 00...59
  I() {
    return zeroFill(this.i());
  }

  // 秒
  // 0...59
  s(...input) {
    return input.length ? this.$set('seconds', ...input) : this.$get('seconds');
  }

  // 秒 (前导0)
  // 00...59
  S() {
    return zeroFill(this.s());
  }

  // 毫秒数
  // 0...999
  ms(...input) {
    return input.length ? this.$set('milliseconds', ...input) : this.$get('milliseconds');
  }

  MS() {
    return zeroFill(this.ms(), 3);
  }

  // 时间段
  a() {
    return this.I18N.interval[Math.floor((this.h() / 24) * this.I18N.interval.length)];
  }

  // 时间段
  A() {
    return this.a().toUpperCase();
  }

  // unix 偏移量 (毫秒)
  // 0...1571136267050
  u(...input) {
    return input.length ? this.init(input[0]) : this.valueOf();
  }

  // Unix 时间戳 (秒)
  // 0...1542759768
  U(...input) {
    return input.length ? this.init(input[0] * 1000) : Math.round(this / 1000);
  }

  // 获取以上格式的日期，每个unit对应其中一种格式
  get(unit = '') {
    return getUnitRegExp.test(unit) ? this[unit]() : undefined;
  }

  // 设置以上格式的日期
  set(unit = '', ...input) {
    return setUnitRegExp.test(unit) ? this[unit](...input) : this;
  }

  toDate() {
    return this.$date;
  }

  toString() {
    return this.$date.toString();
  }

  toLocaleString(...input) {
    return this.$date.toLocaleString(...input);
  }

  valueOf() {
    return this.$date.valueOf();
  }

  clone() {
    return new DateIO(+this.$date);
  }

  // 利用格式化串格式化日期
  format(formats) {
    return String(formats || 'Y-M-D H:I:S').replace(formatsRegExp, unit => this[unit]());
  }

  // 开始于，默认ms
  startOf(unit, isStartOf = true) {
    let formats = 'y m d h i s';
    formats = formats.slice(0, formats.indexOf(unit === 'w' ? 'd' : unit) + 1);
    if (!formats) return this;
    const dates = this.format(formats).split(' ');
     // 分别对应年/月/日/时/分/秒/毫秒
    const starts = [0, 1, 1, 0, 0, 0, 0];
    const ends = [0, 12, 0, 23, 59, 59, 999];
    const input = isStartOf ? starts : ends;
    input.splice(0, dates.length, ...dates);
    if (isStartOf || !/^[ym]$/.test(unit)) input[1] -= 1;
    if (unit === 'w') input[2] -= this.w() - (isStartOf ? 0 : 6);
    return this.init(input);
  }

  // 结束于，默认ms
  endOf(unit) {
    return this.startOf(unit, false);
  }

  // 返回两个日期的差值，精确到毫秒
  // unit: ms: milliseconds(default)|s: seconds|i: minutes|h: hours|d: days|w: weeks|m: months|y: years
  // isFloat: 是否返回小数
  diff(input, unit, isFloat = false) {
    const that = new DateIO(input);
    const md = monthDiff(this, that);
    let diff = this - that;
    if (unit === 'y') diff = md / 12;
    else if (unit === 'm') diff = md;
    else diff /= unitStep[unit] || 1;

    return isFloat ? diff : intPart(diff);
  }

  // 对日期进行+-运算，默认精确到毫秒，可传小数
  // input: '7d', '-1m', '10y', '5.5h'等或数字。
  // unit: 'y', 'm', 'd', 'w', 'h', 'i', 's', 'ms'。
  add(input, unit = 'ms') {
    const pattern = String(input).match(addUnitRegExp);
    if (!pattern) return this;

    const addUnit = pattern[2] || unit;
    let number = Number(pattern[1]);
    // 年月整数部分单独处理，小数部分暂时按365天和30天处理，有一定误差
    if (/^[ym]$/.test(addUnit)) {
      this.set(addUnit, this[addUnit]() + intPart(number));
      number = Number(String(number).replace(/^(-?)\d+(?=\.?)/g, '$10'));
    }

    return number ? this.init(number * unitStep[addUnit] + this.valueOf()) : this;
  }

  subtract(input, unit) {
    return this.add(`-${input}`, unit);
  }

  // 是否为闰年
  isLeapYear() {
    const y = this.y();
    return y % 100 ? y % 4 === 0 : y % 400 === 0;
  }

  // 获取某月有多少天
  daysInMonth() {
    const monthDays = [31, 28 + Number(this.isLeapYear()), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthDays[this.m() - 1];
  }

  // 比较两个日期是否具有相同的年/月/日/时/分/秒，默认精确比较到毫秒
  isSame(input, unit) {
    return +this.clone().startOf(unit) === +new DateIO(input).startOf(unit);
  }
}

const dateio = input => new DateIO(input);

dateio.prototype = DateIO.prototype;

dateio.locale = locale;

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = dateio;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1594336852650);
})()
//# sourceMappingURL=index.js.map