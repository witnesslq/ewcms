<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page pageEncoding="UTF-8" %> 
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ taglib prefix="ewcms" uri="/ewcms-tags"%>
<html>
	<head>
		<title>历史记录</title>	
		<link rel="stylesheet" type="text/css" href='<s:url value="/source/theme/default/easyui.css"/>'>
		<link rel="stylesheet" type="text/css" href='<s:url value="/source/theme/icon.css"/>'>
		<script type="text/javascript" src='<s:url value="/source/js/jquery-1.4.2.min.js"/>'></script>
		<script type="text/javascript" src='<s:url value="/source/js/jquery.easyui.min.js"/>'></script>
		<script type="text/javascript" src='<s:url value="/source/js/easyui-lang-zh_CN.js"/>'></script>
		<script type="text/javascript" src='<s:url value="/source/js/ewcms.js"/>'></script>
		<link rel="stylesheet" type="text/css" href="<s:url value="/source/css/ewcms.css"/>"/>
		<script>
			$(function(){
				//基本变量初始
				setGlobaVariable({
					inputURL:'<s:url namespace="/history" action="input"/>',
					queryURL:'<s:url namespace="/history" action="query"/>',
					deleteURL:'<s:url namespace="/history" action="delete"/>',
					editwidth:1000,
					editheight:700
				});
				//数据表格定义 						
				openDataGrid({
					columns:[[
								{field:'id',title:'序号',width:40,sortable:true},
								{field:'className',title:'类名',width:400},
								{field:'methodName',title:'方法名',width:100},
								{field:'createDate',title:'保存时间',width:125},
								{field:'idName',title:'关键字名称',width:100},
								{field:'idValue',title:'关键字值',width:100},
								{field:'idType',title:'关键字类型',width:120}
							]],
			         toolbar:[
								{text:'删除',iconCls:'icon-remove', handler:delOperateBack},'-',
								{text:'查询',iconCls:'icon-search', handler:queryOperateBack},'-',
								{text:'缺省查询',iconCls:'icon-back', handler:initOperateQueryBack}
						     ]
				});
			});
		</script>
		<ewcms:datepickerhead/>	
	</head>
	<body class="easyui-layout">
		<div region="center" style="padding:2px;" border="false">
			<table id="tt" fit="true"></table>
	 	</div>
	 	
        <div id="edit-window" class="easyui-window" closed="true" icon="icon-winedit" title="&nbsp;历史记录" style="display:none;">
            <div class="easyui-layout" fit="true">
                <div region="center" border="false">
 					<iframe id="editifr"  name="editifr" class="editifr" frameborder="0" onload="iframeFitHeight(this);" scrolling="no"></iframe>
                </div>
                <div region="south" border="false" style="text-align:center;height:28px;line-height:28px;background-color:#f6f6f6">
                    <a class="easyui-linkbutton" icon="icon-save" href="javascript:void(0)" onclick="saveOperator()">保存</a>
                </div>
            </div>
        </div>	
        
        <div id="query-window" class="easyui-window" closed="true" icon='icon-search' title="查询"  style="display:none;">
            <div class="easyui-layout" fit="true"  >
                <div region="center" border="false" >
                <form id="queryform">
                	<table class="formtable">
                            <tr>
                                <td class="tdtitle">编号：</td>
                                <td class="tdinput">
                                    <input type="text" id="id" name="id" class="inputtext"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="tdtitle">开始时间：</td>
                                <td class="tdinput">
                                	<ewcms:datepicker id="startDate" name="startDate" option="inputsimple" format="yyyy-MM-dd 00:00:00"/>
                                </td>
                            </tr>
                            <tr>
                                <td class="tdtitle">结束时间：</td>
                                <td class="tdinput">
                                	<ewcms:datepicker id="endDate" name="endDate" option="inputsimple" format="yyyy-MM-dd 23:59:59"/>
                                </td>
                            </tr>
               		</table>
               	</form>
                </div>
                <div region="south" border="false" style="text-align:center;height:28px;line-height:28px;background-color:#f6f6f6">
                    <a class="easyui-linkbutton" icon="icon-ok" href="javascript:void(0)" onclick="querySearch('');">查询</a>
                </div>
            </div>
        </div>      	
	</body>
</html>