function openDB(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    //  兼容浏览器
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let db;
    // 打开数据库，若没有则会创建
    const request = indexedDB.open(dbName, version);
    // 数据库打开成功回调
    request.onsuccess = function (event) {
      db = event.target.result; // 数据库对象
      console.log('数据库打开成功');
      resolve(db);
    };
    // 数据库打开失败的回调
    request.onerror = function (event) {
      console.log('数据库打开报错');
    };

    // 数据库有更新时候的回调
    request.onupgradeneeded = function (event) {
      // 数据库创建或升级的时候会触发
      console.log('onupgradeneeded');
      db = event.target.result; // 数据库对象
      // 创建存储库
      const objectStore = db.createObjectStore('users', {
        keyPath: 'uuid', // 这是主键
        // autoIncrement: true // 实现自增
      });
      // 创建索引，在后面查询数据的时候可以根据索引查
      // unique : true ：数据唯一
      objectStore.createIndex('uuid', 'uuid', {unique: true});
      objectStore.createIndex('name', 'name', {unique: false});
      objectStore.createIndex('age', 'age', {
        unique: false,
      });
    };
  });
}

/**
 * 插入数据
 * @param {*} db
 * @param {*} storeName
 * @param {*} data
 */
export function addData(db, storeName, data) {
  const request = db.transaction([storeName], 'readwrite').objectStore(storeName).add(data);

  request.onsuccess = function () {
    console.log('数据写入成功');
  };

  request.onerror = function () {
    console.error('数据写入失败');
  };
}

/**
 * 通过主键查询数据
 * @param {*} db
 * @param {*} storeName
 * @param {*} key
 */
export function getDataByKey(db, storeName, key) {
  const request = db.transaction([storeName]).objectStore(storeName).get(key);

  request.onsuccess = function () {
    console.log('主键查询结果：', request.result);
  };

  request.onerror = function () {
    console.error('查询失败');
  };
}

/**
 * 读取所有数据
 * @param {*} db
 * @param {*} storeName
 */
export function getAllData(db, storeName) {
  const request = db.transaction([storeName]).objectStore(storeName).getAll();

  request.onsuccess = function () {
    console.log('查询所有数据：', request.result);
  };

  request.onerror = function () {
    console.error('查询失败');
  };
}

/**
 * 游标读取数据
 * @param {*} db
 * @param {*} storeName
 */
export function cursorGetData(db, storeName) {
  let list = [];
  const store = db
    .transaction([storeName], 'readwrite') // 事务
    .objectStore(storeName); // 仓库对象
  const request = store.openCursor(); // 指针对象
  // 游标开启成功，逐行读数据
  request.onsuccess = function (e) {
    const cursor = e.target.result;
    if (cursor) {
      // 必须要检查
      list.push(cursor.value);
      cursor.continue(); // 游标往后移动
    } else {
      console.log('游标读取的数据', list);
    }
  };
}

/**
 * 通过索引查询数据，只会返回第一条索引匹配正确的数据
 * @param {*} db
 * @param {*} storeName
 * @param {*} indexName
 * @param {*} indexValue
 */
export function getDataByIndex(db, storeName, indexName, indexValue) {
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  const request = store.index(indexName).get(indexValue);

  request.onerror = function () {
    console.error('索引查询失败');
  };

  request.onsuccess = function () {
    console.log('索引查询结果：', request.result);
  };
}

/**
 * 通过索引和游标查询数据
 * @param {*} db
 * @param {*} storeName
 * @param {*} indexName
 * @param {*} indexValue
 */
export function cursorGetDataByIndex(db, storeName, indexName, indexValue) {
  let list = [];

  let store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  let request = store
    .index(indexName) // 索引对象
    .openCursor(IDBKeyRange.only(indexValue));

  request.onsuccess = function (e) {
    let cursor = request.result;
    if (cursor) {
      // 必须检查
      list.push(cursor.value);
      cursor.continue();
    } else {
      console.log('游标索引值查询结果', list);
    }
  };

  request.onerror = function () {
    console.error('索引与游标查询失败');
  };
}

export function cursorGetDataByIndexAndPage(db, storeName, indexName, indexValue, page, pageSize) {
  let list = [];
  let counter = 0; // 计数器
  let advanced = true; // 是否跳过多少条查询
  var store = db.transaction(storeName, 'readwrite').objectStore(storeName); // 仓库对象
  var request = store
    .index(indexName) // 索引对象
    .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
  request.onsuccess = function (e) {
    var cursor = e.target.result;
    if (page > 1 && advanced) {
      advanced = false;
      cursor.advance((page - 1) * pageSize); // 跳过多少条
      return;
    }
    if (cursor) {
      // 必须要检查
      list.push(cursor.value);
      counter++;
      if (counter < pageSize) {
        cursor.continue(); // 遍历了存储对象中的所有内容
      } else {
        cursor = null;
        console.log('分页查询结果', list);
      }
    } else {
      console.log('分页查询结果', list);
    }
  };
  request.onerror = function (e) {};
}

export default openDB;
