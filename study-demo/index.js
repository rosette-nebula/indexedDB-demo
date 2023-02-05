import openDB, {
  addData,
  getDataByKey,
  cursorGetData,
  getAllData,
  getDataByIndex,
  cursorGetDataByIndex,
  cursorGetDataByIndexAndPage,
} from './IndexedDB.js';

openDB('class', 1).then((db) => {
  console.log('db', db);

  const data = {
    uuid: Date.now(),
    name: '张三',
    age: Math.round(Math.random() * 30),
    score: Math.round(Math.random() * 100),
  };

  // 插入数据
  addData(db, 'users', data);

  // 通过主键查询数据
  getDataByKey(db, 'users', 1675579500989);

  getAllData(db, 'users');

  // 通过游标获取所有数据
  cursorGetData(db, 'users');

  // 通过索引查询数据
  getDataByIndex(db, 'users', 'age', 11);

  cursorGetDataByIndex(db, 'users', 'age', 11);

  cursorGetDataByIndexAndPage(db, 'users', 'name', '张三', 2, 10);
});
