/*
 * Article Index JavaScript Library v1.0.0
 * 
 * Licensed under the GPL terms To use it on other terms please contact us
 * 
 * author wu_zhijun
 */
var queryURL,inputURL,deleteURL,treeURL, reasonURL;
var currentnode, rootnode;//当前所选择的节点，父节点
var sort = '';//排序值

$(function() {
	ewcmsBOBJ = new EwcmsBase();
	ewcmsBOBJ.setQueryURL(queryURL);

	ewcmsBOBJ.delToolItem('新增');
	ewcmsBOBJ.delToolItem('修改');
	ewcmsBOBJ.delToolItem('删除');
	ewcmsBOBJ.delToolItem('查询');
	ewcmsBOBJ.delToolItem('缺省查询');

	ewcmsBOBJ.addToolItem('新增', 'icon-add', addOperate, 'btnAdd');
	ewcmsBOBJ.addToolItem('修改', 'icon-edit', updOperate, 'btnUpd');
	ewcmsBOBJ.addToolItem('删除', 'icon-remove', delOperate, 'btnRemove');
	ewcmsBOBJ.addToolItem('查询', 'icon-search', queryCallBack, 'btnSearch');
	ewcmsBOBJ.addToolItem('缺省查询', 'icon-back', initOperateQuery, 'btnBack');
	ewcmsBOBJ.addToolItem('复制', 'icon-copy', copyOperate, 'btnCopy');
	ewcmsBOBJ.addToolItem('移动', 'icon-move', moveOperate, 'btnMove');
	ewcmsBOBJ.addToolItem('排序', 'icon-sort', initSubMenu, 'btnSort');
	ewcmsBOBJ.addToolItem('审核', 'icon-review', initSubMenu, 'btnReview');
	ewcmsBOBJ.addToolItem('发布', 'icon-publish', initSubMenu, 'btnPub');

	ewcmsBOBJ.openDataGrid('#tt',{
		singleSelect : true,
		columns : [ [
					{field : 'id',title : '编号',width : 60},
					{field : 'topFlag',title : '置顶',width : 60,hidden : true,formatter : function(val, rec) {return rec.article.topFlag;}},
					{field : 'reference',title : '引用',width : 60,hidden : true},
					{field : 'flags',title : '属性',width : 60,
						formatter : function(val, rec) {
							var pro = [];
							if (rec.article.topFlag) pro.push("<img src='../../source/image/article/top.gif' width='13px' height='13px' title='有效期限:永久置顶'/>");
							if (rec.article.commentFlag) pro.push("<img src='../../source/image/article/comment.gif' width='13px' height='13px' title='允许评论'/>");
							if (rec.article.type == "TITLE") pro.push("<img src='../../source/image/article/title.gif' width='13px' height='13px' title='标题新闻'/>");
							if (rec.reference) pro.push("<img src='../../source/image/article/reference.gif' width='13px' height='13px' title='引用新闻'/>");
							if (rec.article.inside) pro.push("<img src='../../source/image/article/inside.gif' width='13px' height='13px' title='内部标题'/>");
							return pro.join("");
						}
					},
					{field : 'title',title : '标题<span style=\"color:red;\">[分类]</span>',width : 500,
						formatter : function(val, rec) {
							var classPro = [];
							var categories = rec.article.categories;
							for ( var i = 0; i < categories.length; i++) {
								classPro.push(categories[i].categoryName);
							}
							var classValue = "";
							if (classPro.length > 0) {
								classValue = "<span style='color:red;'>[" + classPro.join(",") + "]</span>";
							}
							return rec.article.title + classValue;
						}
					},
					{field : 'owner',title : '创建者',width : 80,formatter : function(val, rec) {return rec.article.owner;}}, 
					{field : 'statusDescription',title : '状态',width : 60,formatter : function(val, rec) {return rec.article.statusDescription;}}, 
					{field : 'published',title : '发布时间',width : 125,formatter : function(val, rec) {return rec.article.published;}}, 
					{field : 'modified',title : '修改时间',width : 125,formatter : function(val, rec) {return rec.article.modified;}}, 
					{field : 'sort',title : '排序号',width : 60}
				  ] ]
	});

	ewcmsOOBJ = new EwcmsOperate();
	ewcmsOOBJ.setQueryURL(ewcmsBOBJ.getQueryURL());
	//ewcmsOOBJ.setInputURL(inputURL);
	//ewcmsOOBJ.setDeleteURL(deleteURL);

	$("#tt").datagrid({
		onSelect : function(rowIndex, rowData){
			adjustMenu(rowData.article.status);
		},
		view : detailview,
		detailFormatter : function(rowIndex, rowData) {
			return detailGridData(rowData.article.operateTracks);
		}
	});
	$('#tt2').tree( {
		checkbox : false,
		url : treeURL,
		onClick : function(node) {
			$("#tt").datagrid('clearSelections');
			rootnode = $('#tt2').tree('getRoot');
			currentnode = node;
			articleReload();
		}
	});
	initSubMenu();
	disableButtons();
	$('#btnSearch').linkbutton('disable');
	$('#btnBack').linkbutton('disable');
});
//把子菜单添加到相应的父节点上
function initSubMenu() {
	$('#btnSort .l-btn-left').attr('class', 'easyui-linkbutton').menubutton({menu : '#btnSortSub'});
	$('#btnReview .l-btn-left').attr('class', 'easyui-linkbutton').menubutton({menu : '#btnReviewSub'});
	$('#btnPub .l-btn-left').attr('class', 'easyui-linkbutton').menubutton({menu : '#btnPubSub'});
}
//根据权限显示相应的菜单
function channelPermission(rootnode, currentnode) {
	initSubMenu();
	if (rootnode.id == currentnode.id) {
		disableButtons();
		$('#btnSearch').linkbutton('disable');
		$('#btnBack').linkbutton('disable');
		if (currentnode.attributes.maxpermission >= 4) {
			$('#btnPub').linkbutton('enable');
			$('#btnPublishOk').attr('style', 'display:block;');
			$('#btnPublishRec').attr('style','display:block;');
		}
		return;
	}
	if (currentnode.attributes.maxpermission == 1) {
		disableButtons();
		return;
	}
	if (currentnode.attributes.maxpermission == 2) {
		enableButtons();
		$('#btnPublishOk').attr('style', 'display:none;');
		$('#btnPublishRec').attr('style','display:none;');
		$('#btnBreakArticle').attr('style', 'display:none;');
		return;
	}
	if (currentnode.attributes.maxpermission >= 4) {
		enableButtons();
		return;
	}
}
//重读选择的栏目中文章
function articleReload() {
	var url = queryURL + '?channelId=' + currentnode.id;
	$('#tt').datagrid( {
		pageNumber : 1,
		url : url
	});
	channelPermission(rootnode, currentnode);
}
//新增文章
function addOperate() {
	if (currentnode.id != 0 && currentnode.id != $('#tt2').tree('getRoot').id) {
		var url_param = '?channelId=' + currentnode.id + '';
		window.open(inputURL + url_param,'popup','width=1280,height=700,resizable=yes,toolbar=no,directories=no,location=no,menubar=no,status=no,left=' + (window.screen.width - 1280)/ 2 + ',top=' + (window.screen.height - 700) / 2);
	} else {
		$.messager.alert('提示', '请选择栏目', 'info');
	}
	return false;
}
//修改文章
function updOperate() {
	if (currentnode.id != $('#tt2').tree('getRoot').id) {
		var rows = $('#tt').datagrid('getSelections');
		if (rows.length == 0) {
			$.messager.alert('提示', '请选择修改记录', 'info');
			return;
		}
		if (rows.length > 1) {
			$.messager.alert('提示', '只能选择一个修改', 'info');
			return;
		}
		if (rows[0].reference == true) {
			$.messager.alert('提示', '引用文章不能修改', 'info');
			return;
		}
		if (rows[0].article.statusDescription == '初稿' || rows[0].article.statusDescription == '重新编辑') {
			var url_param = '?channelId=' + currentnode.id + '&selections='	+ rows[0].id;
			window.open(inputURL + url_param,'popup','width=1280,height=700,resizable=yes,toolbar=no,directories=no,location=no,menubar=no,status=no,left=' + (window.screen.width - 1280) / 2 + ',top=' + (window.screen.height - 700)/ 2);
		} else {
			$.messager.alert('提示', '文章只能在初稿或重新编辑状态在才能修改', 'info');
			return;
		}
	} else {
		$.messager.alert('提示', '请选择栏目', 'info');
		return;
	}
	return false;
}
//删除文章到回收站
function delOperate() {
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择删除记录', 'info');
		return;
	}

	var parameter = 'channelId=' + currentnode.id;
	for ( var i = 0; i < rows.length; ++i) {
		parameter = parameter + '&selections=' + rows[i].id;
	}
	$.messager.confirm('提示', '确定要删除所选记录到回收站吗?', function(r) {
		if (r) {
			$.post(deleteURL, parameter, function(data) {
				$.messager.alert('成功', '删除文档到回收站成功!', 'info');
				$('#tt').datagrid('clearSelections');
				$('#tt').datagrid('reload');
			});
		}
	});
}
//缺省查询
function initOperateQuery() {
	articleReload();
}
//有条件查询
function querySearch_Article(url) {
	var value = $('#queryform').serialize();
	value = 'parameters[\'' + value;
	value = value.replace(/\=/g, '\']=');
	value = value.replace(/\&/g, '&parameters[\'');

	url += '?channelId=' + currentnode.id + '&' + value;
	$('#tt').datagrid( {
		pageNumber : 1,
		url : url
	});

	$('#query-window').window('close');
	channelPermission(rootnode, currentnode);
}
//移动文章到其他栏目
function moveArticle(url) {
	var selected = $('#tt3').tree('getSelected');
	if (selected == null || typeof (selected) == 'undefined') {
		$.messager.alert('提示', '请选择移动到目标的栏目', 'info');
		return;
	}
	var rootnode_tt3 = $('#tt3').tree('getRoot');

	var parameter = 'channelId=' + currentnode.id;
	var rows = $('#tt').datagrid('getSelections');
	for ( var i = 0; i < rows.length; i++) {
		parameter = parameter + '&selections=' + rows[i].id;
	}

	if (selected.id != rootnode_tt3.id) {
		parameter = parameter + '&selectChannelIds=' + selected.id;
	} else {
		$.messager.alert('提示', '文章不能移动到根栏目', 'info');
		return;
	}

	$.post(url, parameter, function(data) {
		if (data == 'true') {
			$.messager.alert('成功', '移动文章成功', 'info');
			$('#tt3').tree('reload');
			$('#tt').datagrid('clearSelections');
			$('#tt').datagrid('reload');
		}
		$('#moveorcopy-window').window('close');
	});
}
//复制文章到其他栏目
function copyArticle(url) {
	var checkeds = $('#tt3').tree('getChecked')
	if (checkeds.length == 0) {
		$.messager.alert('提示', '请选择复制到目标的栏目', 'info');
		return;
	}
	var rootnode_tt3 = $('#tt3').tree('getRoot');

	var parameter = 'channelId=' + currentnode.id;
	var rows = $('#tt').datagrid('getSelections');
	for ( var i = 0; i < rows.length; i++) {
		parameter = parameter + '&selections=' + rows[i].id;
	}

	for ( var i = 0; i < checkeds.length; i++) {
		if (checkeds[i].id != rootnode_tt3.id) {
			parameter = parameter + '&selectChannelIds=' + checkeds[i].id;
		}
	}
	$.post(url, parameter, function(data) {
		if (data == 'true') {
			$.messager.alert('成功', '复制文章成功', 'info');
			$('#tt3').tree('reload');
			$('#tt').datagrid('clearSelections');
			$('#tt').datagrid('reload');
		}
		$('#moveorcopy-window').window('close');
	});
}
//提交文章到审核流程
function submitReviewOperate(url) {
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择提交审核记录', 'info');
		return;
	}
	var parameter = 'channelId=' + currentnode.id;
	var rows = $('#tt').datagrid('getSelections');
	for ( var i = 0; i < rows.length; i++) {
		parameter = parameter + '&selections=' + rows[i].id;
	}
	$.post(url, parameter, function(data) {
		if (data != 'true') {
			if (data == 'system-false') {
				$.messager.alert('提示', '文章提交审核失败', 'info');
			} else if (data == 'accessdenied') {
				$.messager.alert('提示', '您没有提交审核文章的权限', 'info');
			} else if (data == 'notinstate') {
				$.messager.alert('提示', '文章只有在初稿或重新编辑状态下才能提交审核', 'info');
			}
			return;
		} else {
			$('#tt').datagrid('clearSelections');
			articleReload();
			$.messager.alert('提示', '文章提交审核成功', 'info');
			return;
		}
	});
	return false;
}
//发布选项栏目的文章
function pubOperate(url) {
	$.post(url, {'channelId' : currentnode.id}, function(data) {
		if (data == 'system-false') {
			$.messager.alert('提示', '系统错误', 'error');
			return;
		} else if (data == 'accessdenied') {
			$.messager.alert('提示', '没有发布权限', 'info');
			return;
		} else {
			$.messager.alert('提示', '发布成功', 'info');
			return;
		}
	});
	return false;
}
//审核文章
function reviewArticle(url) {
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择审核记录', 'info');
		return;
	}
	if (rows.length > 1) {
		$.messager.alert('提示', '只能选择一个审核', 'info');
		return;
	}

	var parameter = {};
	parameter['review'] = $('input[name=\'reviewRadio\']:checked').val();
	parameter['channelId'] = currentnode.id;
	parameter['selections'] = rows[0].id;
	parameter['reason'] = $('#reason').val();

	$.post(url, parameter, function(data) {
		$('#review-window').window('close');
		if (data == 'system-false') {
			$.messager.alert('提示', '文章审核失败', 'info');
		} else if (data == 'true') {
			$('#tt').datagrid('clearSelections');
			articleReload();
			$.messager.alert('提示', '文章审核成功', 'info');
		}
		return;
	});
	return false;
}
//设置文章排序号
function sortOperate(isUrl, url) {
	if (currentnode.id != $('#tt2').tree('getRoot').id) {
		var rows = $('#tt').datagrid('getSelections');
		if (rows.length == 0) {
			$.messager.alert('提示', '请选择排序记录', 'info');
			return;
		}
		if (rows.length > 1) {
			$.messager.alert('提示', '只能选择一个排序', 'info');
			return;
		}
		$.messager.prompt('是否要对所选中的文章进行排序',	'请输入排序号',function(r) {
			if (r) {
				var reg = /^\d+$/;
				if (reg.test(r)) {
					$.post(isUrl, {'selections' : $('#tt').datagrid('getSelections')[0].id,'channelId' : currentnode.id,'isTop' : $('#tt').datagrid('getSelections')[0].article.topFlag,'sort' : r},function(data) {
						if (data == 'true') {//用户输入的排序号与系统中的排序号出现重复，显示是插入还是替换选项页面
							sort = r;
							ewcmsBOBJ.openWindow('#sort-window',{width : 550,height : 200,title : '排序'});
							return;
						} else if (data == 'false') {
							$.post(url,{'selections' : $('#tt').datagrid('getSelections')[0].id,'channelId' : currentnode.id,'isTop' : $('#tt').datagrid('getSelections')[0].article.topFlag,'sort' : r},function(data) {
								if (data == 'true') {
									$.messager.alert('提示','设置排序号成功','info');
									$('#tt').datagrid('clearSelections');
									articleReload();
								} else if (data == 'false') {
									$.messager.alert('提示','设置排序号失败','info');
								} else if (data == 'system-false') {
									$.messager.alert('提示','系统错误','error');
								}
								return;
							});
						} else if (data == 'system-false') {
							$.messager.alert('提示','系统错误','error');
							return;
								}
					});
				} else {
					sortOperate();
					return;
				}
			}
		});
	}
	return false;
}
//排序号出现重复，是插入还是替换
function sortArticle(url) {
	$.post(url, {
		'selections' : $('#tt').datagrid('getSelections')[0].id,
		'channelId' : currentnode.id,
		'isTop' : $('#tt').datagrid('getSelections')[0].article.topFlag,
		'isInsert' : $('input[name=\'sortRadio\']:checked').val(),
		'sort' : sort
	}, function(data) {
		$('#sort-window').window('close');
		if (data == 'true') {
			$.messager.alert('提示', '设置排序号成功', 'info');
			$('#tt').datagrid('clearSelections');
			articleReload();
		} else if (data == 'false') {
			$.messager.alert('提示', '设置排序号失败', 'info');
		} else if (data == 'system-false') {
			$.messager.alert('提示', '系统错误', 'error');
		}
		return;
	});
	return false;
}
//清除文章的排序号
function clearSortOperate(url) {
	if (currentnode.id != $('#tt2').tree('getRoot').id) {
		var rows = $('#tt').datagrid('getSelections');
		if (rows.length == 0) {
			$.messager.alert('提示', '请选择清除排序记录', 'info');
			return;
		}
		var parameter = 'channelId=' + currentnode.id;
		for ( var i = 0; i < rows.length; i++) {
			parameter = parameter + '&selections=' + rows[i].id;
		}
		$.post(url, parameter, function(data) {
			if (data == 'true') {
				$.messager.alert('提示', '设置消除排序号成功', 'info');
				$('#tt').datagrid('clearSelections');
				articleReload();
			} else if (data == 'system-false') {
				$.messager.alert('提示', '系统错误', 'error');
			}
			return;
		});
	}
	return false;
}
//文章退回到重新编辑状态(文章只有处于发布版和已发布两个状态才能退回)
function breakOperate(url) {
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择退回记录', 'info');
		return;
	}
	if (rows.length > 1) {
		$.messager.alert('提示', '只能选择一个退回', 'info');
		return;
	}

	var parameter = {};
	parameter['channelId'] = currentnode.id;
	parameter['selections'] = rows[0].id;

	$.post(url, parameter, function(data) {
		if (data != 'true') {
			if (data == 'system-false') {
				$.messager.alert('提示', '文章退回失败', 'info');
			} else if (data == 'accessdenied') {
				$.messager.alert('提示', '没有退回权限', 'info');
			} else if (data == 'notinstate') {
				$.messager.alert('提示', '文章只有在发布版或已发布版状态下才能退回', 'info');
			}
			return;
		} else {
			$('#tt').datagrid('clearSelections');
			articleReload();
			$.messager.alert('提示', '文章退回成功', 'info');
			return;
		}
	});
	return false;
}
//显示审核页面
function reviewOperate() {
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择审核的文章', 'info');
		return;
	}
	if (rows.length > 1) {
		$.messager.alert('提示', '只能选择一个审核', 'info');
		return;
	}
	if (rows[0].article.status == 'REVIEW') {
		ewcmsBOBJ.openWindow('#review-window', {
			width : 550,
			height : 230,
			title : '审核'
		});
	} else {
		$.messager.alert('提示', '文章只能在审核中状态才能审核', 'info');
	}
}
//显示移动文章页面
function moveOperate() {
	$('#tt3').tree( {
		checkbox : false,
		url : treeURL
	});
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择移动记录', 'info');
		return;
	}
	$('#span_move').attr('style', '');
	$('#span_copy').attr('style', 'display:none');
	ewcmsBOBJ.openWindow('#moveorcopy-window', {
		title : '移动文章选择',
		width : 300,
		height : 400
	});
}
//显示复制文章页面
function copyOperate() {
	$('#tt3').tree( {
		checkbox : true,
		url : treeURL
	});
	var rows = $('#tt').datagrid('getSelections');
	if (rows.length == 0) {
		$.messager.alert('提示', '请选择复制记录', 'info');
		return;
	}
	$('#span_move').attr('style', 'display:none');
	$('#span_copy').attr('style', '');
	ewcmsBOBJ.openWindow('#moveorcopy-window', {
		width : 300,
		height : 400,
		title : '复制文章选择'
	});
}
//重读站点专栏数据
function channelTreeLoad() {
	$('#tt2').tree('reload');
}
//主菜单/子菜单不可用
function disableButtons() {
	$('#btnAdd').linkbutton('disable');
	$('#btnUpd').linkbutton('disable');
	$('#btnRemove').linkbutton('disable');
	$('#btnCopy').linkbutton('disable');
	$('#btnMove').linkbutton('disable');
	$('#btnSort').linkbutton('disable');
	$('#btnReview').linkbutton('disable');
	$('#btnPub').linkbutton('disable');
	$('#btnSortSet').attr('style', 'display:none;');
	$('#btnSortClear').attr('style', 'display:none;');
	$('#btnReviewSubmit').attr('style', 'display:none;');
	$('#btnReviewProcess').attr('style', 'display:none;');
	$('#btnPublishOk').attr('style', 'display:none;');
	$('#btnPublishRec').attr('style','display:none;');
	$('#btnBreakArticle').attr('style', 'display:none;');
}
//主菜单/子菜单可用
function enableButtons() {
	$('#btnAdd').linkbutton('enable');
	$('#btnUpd').linkbutton('enable');
	$('#btnRemove').linkbutton('enable');
	$('#btnCopy').linkbutton('enable');
	$('#btnMove').linkbutton('enable');
	$('#btnSort').linkbutton('enable');
	$('#btnReview').linkbutton('enable');
	$('#btnPub').linkbutton('enable');
	$('#btnSortSet').attr('style', 'display:block;');
	$('#btnSortClear').attr('style', 'display:block;');
	$('#btnReviewSubmit').attr('style', 'display:block;');
	$('#btnReviewProcess').attr('style', 'display:block;');
	$('#btnPublishOk').attr('style', 'display:block;');
	$('#btnPublishRec').attr('style','display:block;');
	$('#btnBreakArticle').attr('style', 'display:block;');
}
//显示文章操作过程中用户输入的原因页面
function showReason(url){
	$('#editifr_reason').attr('src',url);
	ewcmsBOBJ.openWindow('#reason-window',{width:600,height:300,title:'原因'});
}
//文章操作过程数据
function detailGridData(operateTracks){
	var htmls = [];
	if (operateTracks.length == 0) {
		htmls.push('<div style="padding:5px 0">没有操作记录!</div>');
	} else {
		htmls.push('<div style="padding:5px 0;"><div class="datagrid-header" style="height:22px;">');
		htmls.push('<div class="datagrid-header-inner" style="display: block;">');
		htmls.push('<table cellspacing="0" cellpadding="0" border="0" style="height: 23px;">');
		htmls.push('<tr style="height: 21px">');
		htmls.push('<td><div class="datagrid-cell" style="width: 20px; text-align: center;"><span></span></div></td>');
		htmls.push('<td><div class="datagrid-cell" style="width: 80px; text-align: left;"><span>操作员</span></div></td>');
		htmls.push('<td><div class="datagrid-cell" style="width: 100px; text-align: left;"><span>姓名</span></div></td>');
		htmls.push('<td><div class="datagrid-cell" style="width: 60px; text-align: left;"><span>状态</span></div></td>');
		htmls.push('<td><div class="datagrid-cell" style="width: 125px; text-align: left;"><span>操作时间</span></div></td>');
		htmls.push('<td><div class="datagrid-cell" style="width: 600px;; text-align: left;"><span>描述</span></div></td>');
		htmls.push('</tr>');
		htmls.push('</table>');
		htmls.push('</div>');
		htmls.push('</div>');
		htmls.push('<div class="datagrid-body">');
		for ( var i = 0; i < operateTracks.length; i++) {
			var userRealName = '';
			if (operateTracks[i].userRealName != null) 
				userRealName = operateTracks[i].userRealName;
			var reason = '';
			if (operateTracks[i].reason != null && operateTracks[i].reason.length > 0){
				var url = reasonURL + '?trackId=' + operateTracks[i].id;
				reason = '<a href="#" onclick="showReason(\'' + url + '\');">原因</a>';
			}
			htmls.push('<table cellspacing="0" cellpadding="0" border="0"><tr style="height: 21px">'
							+ '<td><div class="datagrid-cell" style="width: 20px; text-align: center;"><span>'
							+ (operateTracks.length - i)
							+ '</span></div></td>'
							+ '<td><div class="datagrid-cell" style="width: 80px; text-align: left;"><span>'
							+ operateTracks[i].userName
							+ '</span></div></td>'
							+ '<td><div class="datagrid-cell" style="width: 100px; text-align: left;"><span>'
							+ userRealName
							+ '</span></div></td>'
							+ '<td><div class="datagrid-cell" style="width: 60px; text-align: left;"><span>'
							+ operateTracks[i].statusDesc
							+ '</span></div></td>'
							+ '<td><div class="datagrid-cell" style="width: 125px; text-align: left;"><span>'
							+ operateTracks[i].operateTime
							+ '</span></div></td>'
							+ '<td><div class="datagrid-cell" style="width: 600px; text-align: left;"><span>'
							+ operateTracks[i].description + '&nbsp;&nbsp;' + reason
							+ '</span></div></td>' 
							+ '</tr></table>');
		}
		htmls.push('</div></div>');
	}
	return htmls.join("");
}
//根据文章不同的状态,调整子菜单的显示
function adjustMenu(status){
	if (status == 'REVIEW'){
		$('#btnReviewSubmit').attr('style', 'display:none;');
		$('#btnReviewProcess').attr('style', 'display:block;');
		$('#btnBreakArticle').attr('style', 'display:none;');
	}else if (status == 'DRAFT' || status == 'REEDIT'){
		$('#btnReviewSubmit').attr('style', 'display:block;');
		$('#btnReviewProcess').attr('style', 'display:none;');
		$('#btnBreakArticle').attr('style', 'display:none;');
	}else if (status == 'PRERELEASE' || status == 'RELEASE'){
		$('#btnReviewSubmit').attr('style', 'display:none;');
		$('#btnReviewProcess').attr('style', 'display:none;');
		$('#btnBreakArticle').attr('style', 'display:block;');
	}
}