export function isBoolean(val: any): val is boolean {
  return Object.prototype.toString.call(val) === "[object Boolean]";
}

export function isUndefined(val: any): val is undefined {
  return typeof val === "undefined";
}

export function isString(val: any): val is string {
  return Object.prototype.toString.call(val) === "[object String]";
}

export function isNull(val: any): val is null {
  return val === null;
}

export function isNumber(val: any): val is number {
  return Object.prototype.toString.call(val) === "[object Number]";
}

export function isObject(val: any): val is Record<any, unknown> {
  return Object.prototype.toString.call(val) === "[object Object]";
}

export function isArray(val: any): val is Array<unknown> {
  return Array.isArray(val);
}

/** 判断值是否是 BigInt */
export function isBigInt(val: unknown): val is bigint {
  return Object.prototype.toString.call(val) === "[object BigInt]";
}

/** 判断值是否是 Symbol */
export function isSymbol(val: unknown): val is symbol {
  return Object.prototype.toString.call(val) === "[object Symbol]";
}

/** 判断值是否是 Set */
export function isSet(val: unknown): val is Set<unknown> {
  return Object.prototype.toString.call(val) === "[object Set]";
}

/** 判断值是否是 Map */
export function isMap(val: unknown): val is Map<unknown, unknown> {
  return Object.prototype.toString.call(val) === "[object Map]";
}

/** 判断值是否是 WeakSet */
export function isWeakSet(val: unknown): val is WeakSet<object> {
  return Object.prototype.toString.call(val) === "[object WeakSet]";
}

/** 判断值是否是 WeakMap */
export function isWeakMap(val: unknown): val is WeakMap<object, unknown> {
  return Object.prototype.toString.call(val) === "[object WeakMap]";
}

// 参见：https://stackoverflow.com/questions/53966509/typescript-type-safe-omit-function
interface OmitFunc {
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
}

// 通过键名来筛选对象属性，返回一个新对象，原对象不会改变
export const omit: OmitFunc = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: typeof obj[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

/** 限制字符长度，使用省略号进行补充 */
export function stringLimit(str: string, count: number, fill = "…") {
  if (!isString(str)) return "";

  if (str.length > count) {
    return str.substring(0, count) + fill;
  } else {
    return str;
  }
}

/** 文件转 base64 */
export async function fileToBase64(img: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setTimeout(() => {
        resolve(reader.result as string);
      }, 1000)
    );
    reader.readAsDataURL(img);
  });
}

export function beautifyJson(target: any) {
  try {
    if (isString(target)) return JSON.stringify(JSON.parse(target), null, 4);
    else return JSON.stringify(target, null, 4);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function SafeJSONParse(value: any, def: any = undefined): any {
  try {
    return JSON.parse(value!) ?? def;
  } catch (error) {
    console.error(error);
    return def;
  }
}

/** 移动数组项 */
export function arrayMove<T = any>(arr: T[], oldIndex: number, newIndex: number) {
  if (arr.length <= oldIndex || arr.length <= newIndex) {
    throw new Error(
      // 索引超出了数组的索引范围，需要移动的索引参数为 20 和 30，但是数组长度为 23。
      `arrayMove param Error: The index is outside the index range of the array, the index parameters to be moved are ${oldIndex} and ${newIndex}, but the array length is ${arr.length}.`
    );
  }

  const newArr = Array.from(arr);
  const changeItem = newArr.splice(oldIndex, 1)[0];
  newArr.splice(newIndex, 0, changeItem);

  return newArr;
}

export function arraySplice<T>(sourceArray: T[], ...args: Parameters<Array<T>["splice"]>) {
  const newArray = Array.from(sourceArray);
  newArray.splice(...args);
  return newArray;
}

export function arraySet<T>(sourceArray: T[], index: number, value: T) {
  const newArray = Array.from(sourceArray);
  newArray[index] = value;
  return newArray;
}

/**
 * 中文拼音分类
 *
 * https://www.cnblogs.com/cangqinglang/p/8992575.html
 *
 * @param zhArray
 * @returns
 */
export function zhType(source: string) {
  if (!String.prototype.localeCompare) {
    console.warn("浏览器不兼容");
    return source;
  }

  const letters = "abcdefghjklmnopqrstwxyz";
  const zhs = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split("");

  const index = zhs
    .concat(source)
    .sort((p, n) => p.localeCompare(n, "zh"))
    .findIndex((t) => t === source);

  return letters.charAt(index - 1);
}

type ZHGroupItem<T> = {
  letter: string;
  members: T[];
};

/**
 * 中文按照拼音排序并分组
 *
 * @param arr 需要排序的数组
 * @param getZh 解析数组项获取排序使用的文本
 * @returns 一组排序后的数据
 */
export function zhGroup<T>(arr: T[], getZh: (item: T) => string) {
  // 中文排序
  const sorted = Array.from(arr).sort((a, b) => getZh(a).localeCompare(getZh(b)));

  // 按照拼音首字母分组
  return "abcdefghjklmnopqrstwxyz".split("").map((letter) => {
    // 每组数据
    const item: ZHGroupItem<T> = {
      letter,
      members: [],
    };

    // 按顺序出队压入当前组中，使用 localeCompare 判断当前组是否结束
    while (sorted.length > 0 && zhType(getZh(sorted[0])).localeCompare(letter) === 0) {
      item.members.push(sorted.shift()!);
    }

    return item;
  });
}

/**
 * 记忆函数
 *
 * @param targetFunction 需要进行计算缓存的函数
 * @param createMemoryID 获取记忆键的函数
 * @returns 一个 targetFunction 的高阶记忆函数，附加 historyExec 对记忆进行控制
 */
export function memoryFunction<P extends Array<unknown>, R>(
  targetFunction: (...p: P) => R,
  createMemoryID: (args: P) => any = JSON.stringify
) {
  const memoryMap = new Map();

  function HOFTargetFunction(...p: P): R {
    const MemoryID = createMemoryID(p);

    if (memoryMap.has(MemoryID)) {
      return memoryMap.get(MemoryID);
    }

    const result = targetFunction(...p);
    memoryMap.set(MemoryID, result);

    return result;
  }

  return Object.assign(HOFTargetFunction, { memoryMap });
}

interface PixelConversionParam {
  /** 设计稿尺寸 */
  baseSize?: number;
  /** 最大伸缩尺寸 */
  maxSize?: number;
  /** 转化的单位 */
  unit?: "vw" | "vmin";
}

/** 像素转换 */
export function pixelConversion({ baseSize = 375, maxSize = 750, unit = "vmin" }: PixelConversionParam = {}) {
  return (pixel: number) => ((pixel / Math.min(baseSize, maxSize)) * 100).toString() + unit;
}
