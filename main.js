var velement = require('./velement');
var diff = require('./diff');
var patch = require('./patch');
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
