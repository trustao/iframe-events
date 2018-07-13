# iframe-events  

## 描述  

解决iframe间数据传递繁琐的困扰。

## 使用 
```javascript  
<script src="path/to/iframe-events"></script>"
// 放到头部中或置于所有script标签前。
```

```
// 必须在同窗口下的，同源的iframe中使用

$on('fn-name', function() {
// ... 需要绑定的函数
console.log(1234)
})
// 其他iframe
$emit('fn-name')  //1234
```

## 方法  
```javascript
$emit(name, arg)
name 字符串或数组
arg 需要传递的任意参数

$on(name, fn)
name 字符串或数组
fn 绑定的函数

$off(name, fn)
name 字符串或数组
fn 可选 取消绑定的函数，不填则取消该方法名的所有函数

$once(name, fn)
name 字符串
fn 绑定的函数 只能$emit触发一次

```
