
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    //alert(out);

    // or, if you wanted to avoid alerts...

    var pre = document.createElement('pre');
    pre.innerHTML = out;
    document.body.appendChild(pre)
}
var user = function(data)
{
	$("#username").html(data._value);
}

var authenticationSuccess = function() { 
	$("#status").html("You are connected to trello ");
	Trello.get("/member/me/fullname/",user,error);
	console.log("Successful authentication"); 
	$("#trellologo #action").html(" Logout");
};
var authenticationFailure = function() { 
	$("#status").html("The connection failed");
	console.log("Failed authentication"); 
};

var success = function(successMsg) {
	console.log("Request Successful : "+JSON.stringify(successMsg));
};

var error = function(errorMsg) {
  console.log("Request Failed : "+JSON.stringify(errorMsg));
};

var getMyBoards = function(boards)
{
	for(var i=0;i<boards.length;i++)
	{
		var board = boards[i];
		$("#main-menu").append("<li class='test' id='"+board.id+"'><a><i class='fa fa-dashboard fa-3x'></i>"+board.name+"</a></li>");
	}
}
var getBoard = function(data)
{
	startProcessing();
	authorize();
	$("#boardname").html(data.name+"<input type='hidden' name='board' value='"+data.id+"' id='idBoard'/><input type='hidden' name='boardname' value='"+data.name+"'/>");
	$("#urltrelloboard").prop("href",data.shortUrl);
	Trello.get("/board/"+data.id+"/lists/",getLists);
	Trello.get("/board/"+data.id+"/cards/",getCards);
	Trello.get("/board/"+data.id+"/cards/closed?limit=1000",getArchivedCard);
	Trello.get("/board/"+data.id+"/actions?display=true&limit=1000",getAction);
}
var getArchivedCard = function(data)
{
	$("#ArchivedNum").html(data.length+" Archived Card(s)");
}
var getLists = function(data)
{
	$("#ListsNum").html(data.length+" List(s)");
	$(".Lists").html("");
	for(var i=0;i<data.length;i++)
	{
		
		$(".Lists").append("<div class='panel panel-default' id='"+data[i].id+"'><input type='hidden' name='lists["+data[i].id+"]' value='"+data[i].name+"' />"+
                        "<div class='panel-heading'>"+
                           data[i].name + 
                        "</div><div class='panel-body cards'></div></div>");
		
	}
}
var getCards = function(data)
{
	$("#CardsNum").html(data.length+" Cards(s)");
	
	for(var i=0;i<data.length;i++)
	{
		var d = new Date(Date.parse(data[i].dateLastActivity));
		$(".Lists #"+data[i].idList+" .cards").append("<textarea name='card["+data[i].idList+"]["+data[i].id+"]' id='"+data[i].id+"' class='card'>[title]"+data[i].name+"[/title][update]"+d.getDate()+"/"+(parseInt(d.getMonth()+1))+"/"+d.getFullYear()+" at "+d.getHours()+":"+d.getMinutes()+"[/update]\n</textarea><br/>");
	
		if(data[i].labels.length>0)
			for(var a=0;a<data[i].labels.length;a++)
				$(".Lists #"+data[i].idList+" .cards #"+data[i].id+"").append("[label color='"+data[i].labels[a].color+"']"+data[i].labels[a].name+"[label]");

}
}
var getAction = function(data)
{
	$("#ActionsNum").html(data.length+" Action(s)");
	
	var dstart = new Date(Date.parse($("#from").val()));
	var dend = new Date(Date.parse($("#to").val()));
	
	var dretroStart = new Date(dend.getTime());
	var dretroEnd = new Date(dend.getTime());
	
	dend.setHours(23);
	dend.setMinutes(59);
	dend.setSeconds(59);
	
	var timeRetroStart = $("#fromRetro").val().split(':');
	dretroStart.setHours(timeRetroStart[0]);
	dretroStart.setMinutes(timeRetroStart[1]);
	if(typeof timeRetroStart[2] !== 'undefined')
		dretroStart.setSeconds(timeRetroStart[2]);
	else
		dretroStart.setSeconds(0);
	
	var timeRetroEnd = $("#toRetro").val().split(':');
	
	dretroEnd.setHours(timeRetroEnd[0]);
	dretroEnd.setMinutes(timeRetroEnd[1]);
	if(typeof timeRetroEnd[2] !== 'undefined')
		dretroEnd.setSeconds(timeRetroEnd[2]);
	else
		dretroEnd.setSeconds(59);	
	
	for(var i=0;i<data.length;i++)
	{
		var action = data[i];
		var actionString = "";
		var d = new Date(Date.parse(action.date));
		if((d.getTime()>dstart.getTime() && d.getTime()<dend.getTime()) ||($("#from").val()=="" && $("#to").val()=="") )
		{
			var Stringd = d.getDate()+"/"+(parseInt(d.getMonth()+1))+"/"+d.getFullYear()+" at "+d.getHours()+":"+d.getMinutes();
			var retro = (d.getTime()>dretroStart.getTime() && d.getTime()<dretroEnd.getTime())?"='retro'":"='sprint'";
			if(action.display.translationKey=="action_comment_on_card")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]"+action.data.text+"[/text][/action]";
			else if(action.display.translationKey=="action_add_attachment_to_card")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]Attachment added : [url='"+action.data.attachment.url+"']"+action.data.attachment.name+"[/url][/text][/action]";
			else if(action.display.translationKey=="action_add_checklist_to_card")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]CheckList added : "+action.data.checklist.name+"[/text][/action]";
			else if(action.display.translationKey=="action_removed_a_due_date")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]the deadline has been removed[/text][/action]";
			else if(action.display.translationKey=="action_move_card_from_list_to_list")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]Card moved from "+action.data.listBefore.name+" to "+action.data.listAfter.name+"[/text][/action]";
			else if(action.display.translationKey=="action_completed_checkitem")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]"+action.data.checkItem.name+" has been completed on the checklist : "+action.data.checklist.name+"[/text][/action]";
			else if(action.display.translationKey=="action_create_card")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]Card has been created[/text][/action]";
			else if(action.display.translationKey=="action_added_member_to_card")
				actionString="\n[action"+retro+"]\n\t[time]"+Stringd+"[/time]\n\t[creator]"+action.memberCreator.fullName+"[/creator]\n\t[text]"+action.member.fullName+" has been assigned to the card[/text][/action]";
			
			if(typeof(action.data.card)!=='undefined')
				$(".Lists .cards #"+action.data.card.id).append(actionString);
		}
	}
	endProcessing();
}
function startProcessing()
{
	$("#processing").css('display','block');
}
function endProcessing()
{
	$("#processing").css('display','none');
}
function updateDate()
{
	authorize();
	var idBoard = $("#idBoard").val();
	Trello.get('/board/'+idBoard+'/',getBoard,error);
}

function dbx_connect()
{
	if(getCookie("dbxUploadDirectory")!=="")
	{
		$("#dbxUploadDirectory").html(" "+decodeURIComponent(getCookie("dbxUploadDirectory")));
	}
	else
	{
		var win = window.open('dropbox.php','Connection to Dropbox','menubar=no, scrollbars=no, top=100, left=100, width=600, height=400');
		win.onclose = function(){$("#dbxUploadDirectory").html(" "+decodeURIComponent(getCookie("dbxUploadDirectory")));};
		$("#dbxUploadDirectory").html(" Login");
	}
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") {
        return;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}
function authorize()
{
	var test = Trello.authorize({
			  type: 'popup',
			  name: 'Trello Repporting',
			  scope: {
				read: 'true',
				write: 'true' },
			  expiration: 'never',
			  success: authenticationSuccess,
			  error: authenticationFailure
			});
}
$(function(){
	$("#main-menu").on("click", "li.test", function(){
		Trello.get('/board/'+$(this).prop("id")+'/',getBoard,error);
	});
	$("#send").button();
	$( "#from" ).datepicker({dateFormat:"yy-mm-dd"});
	$( "#to" ).datepicker({dateFormat:"yy-mm-dd"});
	$("#from").on("change",updateDate);
	$("#to").on("change",updateDate);
	$("#fromRetro").on("change",updateDate);
	$("#toRetro").on("change",updateDate);
	$("#dbxlogo").on("click",dbx_connect);
	$("#trellologo").on("click",function(){
		var action = $("#trellologo #action").html();
		if(action==" Login")
		{
			authorize();
			Trello.get('member/me/boards', getMyBoards, error);
		}
		else if(action==" Logout")
		{
			Trello.deauthorize();
			$("#username").html("Username");
			$("#ActionsNum").html("0 Action(s)");
			$("#CardsNum").html("0 Cards(s)");
			$("#ListsNum").html("0 List(s)");
			$(".Lists").html("");
			$("#ArchivedNum").html("0 Archived Card(s)");
			$("#boardname").html("Click on a Board to Create the Repport");
			$("#urltrelloboard").prop("href","#");
			$("#main-menu").html("");
			$("#status").html("You have been diconnected of trello ");
		}
	});
	if(parseURLParams(document.URL).status=="done")
	{
		$("#uploaddialog").html("<div id='dialog-confirm' title='The Repport has been created'><p><span class='ui-icon ui-icon-check' style='float:left; margin:12px 12px 20px 0;'></span>The repport has been successfuly created.<br/><span style='text-align:center'><a href='"+decodeURIComponent(parseURLParams(document.URL).doc)+"'>Trello Report</a></span> <br/> Do you want to create a card in your dashboard ?</p></div>");
	}
	
	    $( "#dialog-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 500,
      modal: true,
      buttons: {
        "Yes": function() {
			$( this ).dialog( "close" );
			Trello.addCard({
				  name:"Report"
				});
        },
        "No": function() {
          $( this ).dialog( "close" );
        }
      }
    });
});
			

