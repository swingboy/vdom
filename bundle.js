/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*********************************辅助类util*************************************/
//辅助类 Util
var util = {};

util.type = function(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '');
}

util.isArray = function(list) {
    return util.type(list) === 'Array';
}

util.isString = function(list) {
    return util.type(list) == 'String';
}

util.each = function(array, fn) {
    for (var i = 0, len = array.length; i < len; i++) {
        fn(array[i], i);
    }
}

util.toArray = function(listLike) {
    if (!listLike) {
        return [];
    }
    var list = [];
    for (var i = 0, len = listLike.length; i < len; i++) {
        list.push(listLike[i]);
    }
    return list;
}

util.setAttr = function(node, key, value) {
    switch (key) {
        case 'style':
            node.style.cssText = value;
            break;
        case 'value':
            var tagName = node.tagName || '';
            tagName = tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea') {
                node.value = value;
            } else {
                node.setAttribute(key, value);
            }
            break;
        default:
            node.setAttribute(key, value);
            break;
    }
}


module.exports = util;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
 * 用于记录两个虚拟dom之间差异的数据结构
 */ 

var util = __webpack_require__(0);
//每个节点有四种变动
//替换
var REPLACE = 0;
//排序
var REORDER = 1;
//属性变化
var PROPS = 2;
//文本
var TEXT = 3;

function patch(node, patches) {
    var walker = {
        index: 0
    };
    dfsWalk(node, walker, patches);
}

patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

//深度优先遍历dom结构
function dfsWalk(node, walker, patches) {
    var currentPatches = patches[walker.index];
    var len = node.childNodes ? node.childNodes.length : 0;
    for (var i = 0; i < len; i++) {
        var child = node.childNodes[i];
        walker.index ++ ;
        dfsWalk(child, walker, patches);
    }
    //如果当前节点存在差异
    if (currentPatches) {
        applyPatches(node, currentPatches);
    }
}

function applyPatches(node, currentPatches) {
    util.each(currentPatches, function(currentPatch) {
        switch (currentPatch.type) {
            case REPLACE:
                var newNode = (typeof currentPatch.node === 'String') ? document.createTextNode(currentPatch.node) : currentPatch.node.render();
                node.parentNode.replaceChild(newNode, node);
                break;
            case REORDER:
                reoderChildren(node, currentPatch.moves);
                break;
            case PROPS:
                setProps(node, currentPatch.props);
                break;
            case TEXT:
                if (node.textContent) {
                    node.textContent = currentPatch.content;
                } else {
                    node.nodeValue = currentPatch.content;
                }
                break;
            default:
                throw new Error('Unknow patch type ' + currentPatch.type);
        }
    });
}

function reoderChildren(node, moves) {
    var staticNodeList = util.toArray(node.childNodes);
    var maps = {};
    util.each(staticNodeList, function(node) {
        if (node.nodeType === 1) {
            var key = node.getAttribute('key');
            if (key) {
                maps[key] = node;
            }
        }
    });

    util.each(moves, function(move) {
        var index = move.index;
        if (move.type === 0) { // 变动类型为删除节点
            if (staticNodeList[index] === node.childNodes[index]) {
                node.removeChild(node.childNodes[index]);
            }
            staticNodeList.splice(index, 1);
        } else {
            var insertNode = maps[move.item.key] 
                ? maps[move.item.key] : (typeof move.item === 'object') 
                ? move.item.render() : document.createTextNode(move.item);
            staticNodeList.splice(index, 0, insertNode);
            node.insertBefore(insertNode, node.childNodes[index] || null);
        }
    });
}

function setProps(node, props) {
    for (var key in props) {
        if (props[key] === void 666) {
            node.removeAttribute(key);
        } else {
            var value = props[key];
            util.setAttr(node, key, value);
        }
    }
}

module.exports = patch;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var velement = __webpack_require__(3);
var diff = __webpack_require__(4);
var patch = __webpack_require__(1);
var vdom = velement('div', { 'id': 'container' }, [
    velement('h1', { style: 'color:red',  }, ['simple virtual dom']),
    velement('p', ['hello world']),
    velement('ul', [velement('li', ['item #1']), velement('li', ['item #2'])]),
]);
var rootnode = vdom.render();

document.body.appendChild(rootnode);

setTimeout(function(){
	var newVdom = velement('div', { 'id': 'container' }, [
		velement('h5', { style: 'color:yellow' }, ['simple virtual dom little']),
	    velement('p', ['hello world new']),
	    velement('ul', [velement('li', ['item #1 new']), velement('li', ['item #2 new']), velement('li', ['item #3 new'])]),
	]);
	var patches = diff(vdom, newVdom);
	console.log(patches);
	patch(rootnode, patches);
}, 1500);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(0);
//虚拟dom
var VElement = function(tagName, props, children) {
    //保证只能通过如下方式调用：new VElement
    if (!(this instanceof VElement)) {
        return new VElement(tagName, props, children);
    }
    
    //可以通过只传递tagName和children参数
    if (util.isArray(props)) {
        children = props;
        props = {};
    }

    //设置虚拟dom的相关属性
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : void 666;
    var count = 0;

    // debugger; TODO

    util.each(this.children, function(child, i) {
        if (child instanceof VElement) {
            count += child.count;
        } else {
            children[i] = '' + child;
        }
        count++;
    });
    this.count = count;
}

//根据虚拟dom创建真实dom
VElement.prototype.render = function() {
    //创建标签
    var el = document.createElement(this.tagName);
    //设置标签的属性
    var props = this.props;
    for (var propName in props) {
        var propValue = props[propName]
        util.setAttr(el, propName, propValue);
    }

    //一次创建子节点的标签
    util.each(this.children, function(child) {
        //如果子节点仍然为velement，则递归的创建子节点，否则直接创建文本类型节点
        var childEl = (child instanceof VElement) ? child.render() : document.createTextNode(child);
        el.appendChild(childEl);
    });
    return el;
}

module.exports = VElement;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(0);
var patch = __webpack_require__(1);

//深度遍历两个列表数据，每层的节点进行对比，记录下每个节点的差异。并返回该对象的差异。
var listDiff = __webpack_require__(5);

function diff(oldTree, newTree) {
    debugger;
    var index = 0;
    var patches = {};
    dfsWalk(oldTree, newTree, index, patches);
    return patches;
}


function dfsWalk(oldNode, newNode, index, patches){
    var currentPatch = [];
    // 如果oldNode被remove掉了
    if (newNode === null) {
        //依赖listdiff算法进行标记为删除  // 先不做操作, 具体交给 list diff 处理
    }else if (util.isString(oldNode) && util.isString(newNode)) {
        if (oldNode !== newNode) {
            //如果是文本节点则直接替换文本
            currentPatch.push({
                type: patch.TEXT,
                content: newNode
            });
        }
    }else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
        //节点类型相同
        //比较节点的属性是否相同
        var propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({
                type: patch.PROPS,
                props: propsPatches
            });
        }
        //比较子节点是否相同
        diffChildren(oldNode.children, newNode.children, index, patches, currentPatch);
    } else {
        //节点的类型不同，直接替换
        currentPatch.push({ type: patch.REPLACE, node: newNode });
    }

    if (currentPatch.length) {
        patches[index] = currentPatch;
    }
}

function diffProps(oldNode, newNode){
    var count = 0;
    var oldProps = oldNode.props;
    var newProps = newNode.props;
    var key, value;
    var propsPatches = {};

    //找出不同的属性
    for (key in oldProps) {
        value = oldProps[key];
        if (newProps[key] != value) {
            count ++;
            propsPatches[key] = newProps[key];
        }
    };

    //找出新增的属性
    for (key in newProps) {
        value = newProps[key];
        if (!oldProps.hasOwnProperty(key)) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }
    if (count === 0) {
        return null;
    }
    return propsPatches;
}


function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
    
    var diffs = listDiff(oldChildren, newChildren, 'key');
    newChildren = diffs.children;

    if (diffs.moves.length) {
        var reorderPatch = {
            type: patch.REORDER,
            moves: diffs.moves
        };
        currentPatch.push(reorderPatch);
    }
    
    var leftNode = null;
    var currentNodeIndex = index;
    util.each(oldChildren, function(child, i) {
        var newChild = newChildren[i];
        currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
        dfsWalk(child, newChild, currentNodeIndex, patches);
        leftNode = child;
    });
}

module.exports = diff;


/***/ }),
/* 5 */
/***/ (function(module, exports) {


function diff(oldList, newList, key) {
    var oldMap = makeKeyIndexAndFree(oldList, key)
    var newMap = makeKeyIndexAndFree(newList, key)

    var newFree = newMap.free

    var oldKeyIndex = oldMap.keyIndex
    var newKeyIndex = newMap.keyIndex

    var moves = []

    // a simulate list to manipulate
    var children = []
    var i = 0
    var item
    var itemKey
    var freeIndex = 0

    // fist pass to check item in old list: if it's removed or not
    while (i < oldList.length) {
        item = oldList[i]
        itemKey = getItemKey(item, key)
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                children.push(null)
            } else {
                var newItemIndex = newKeyIndex[itemKey]
                children.push(newList[newItemIndex])
            }
        } else {
            var freeItem = newFree[freeIndex++]
            children.push(freeItem || null)
        }
        i++
    }

    var simulateList = children.slice(0)

    // remove items no longer exist
    i = 0
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            remove(i)
            removeSimulate(i)
        } else {
            i++
        }
    }

    // i is cursor pointing to a item in new list
    // j is cursor pointing to a item in simulateList
    var j = i = 0
    while (i < newList.length) {
        item = newList[i]
        itemKey = getItemKey(item, key)

        var simulateItem = simulateList[j]
        var simulateItemKey = getItemKey(simulateItem, key)

        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++
            } else {
                // new item, just inesrt it
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item)
                } else {
                    // if remove current simulateItem make item in right place
                    // then just remove it
                    var nextItemKey = getItemKey(simulateList[j + 1], key)
                    if (nextItemKey === itemKey) {
                        remove(i)
                        removeSimulate(j)
                        j++ // after removing, current j is right, just jump to next one
                    } else {
                        // else insert item
                        insert(i, item)
                    }
                }
            }
        } else {
            insert(i, item)
        }

        i++
    }

    function remove(index) {
        var move = { index: index, type: 0 }
        moves.push(move)
    }

    function insert(index, item) {
        var move = { index: index, item: item, type: 1 }
        moves.push(move)
    }

    function removeSimulate(index) {
        simulateList.splice(index, 1)
    }

    return {
        moves: moves,
        children: children
    }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
    var keyIndex = {}
    var free = []
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i]
        var itemKey = getItemKey(item, key)
        if (itemKey) {
            keyIndex[itemKey] = i
        } else {
            free.push(item)
        }
    }
    return {
        keyIndex: keyIndex,
        free: free
    }
}

function getItemKey(item, key) {
    if (!item || !key) return void 666
    
    return typeof key === 'string'
        ? item[key]
        : key(item)
}

// exports.makeKeyIndexAndFree = makeKeyIndexAndFree // exports for test
// exports.diff = diff
module.exports = diff;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map