// content.js
// Managing user functions for content.html
var workspace_dataList;
var cont_dataList ;
var now_workspaceID ; 
var now_cont_point ;
var workspace_list = [];

$(function() {
    
    // MENU 적용
    $('#mn_content').attr({
        'class' : 'active'
    });
    $('#mn_content_admin').attr({
        'class' : 'active'
    });

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() == '0101'){
        window.location.href = '/content/admin';
    }

    //************************************ DATE PICKER **************************
    $('#search_start_workspace , #search_end_workspace').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });



    //**************************************현장 목록 조회**********************************************

    //메인 화면 전체 조회 구문
    
    workspace_dataList = $('#workspace_list').DataTable({
                    "lengthChange": false,
                    "searching": false,
                    "ordering": true,
                    "order": [[ 0, "desc" ]],
                    "colReorder": false,
                    "info": false,
                    "autoWidth": true,
                    "processing": true,
                    "responsive": true,
                    ajax : {
                        "url": "/workspace/search",
                        "type": "POST",
                        "async" :"false"
                    },
                    "columns": [
                            {data:  "workspace_id"},
                            {data:  "workspace_nm"},
                            {data:  "workspace_cmt"},
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<strong>"+data.workspace_disk_total+" GB</strong>";
                                }
                            },
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<strong>"+data.cn_0204+"건</strong>";
                                }
                            },
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<strong>"+(parseInt(data.cn_0201)+parseInt(data.cn_0202)+parseInt(data.cn_0203))+"건</strong>";
                                }
                            },
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<button title='영상목록' class=' btn_point "+
                                         "' onclick=\"window.location.href = 'content/cont?workspace_id="+data.workspace_id+"&workspace_nm="+data.workspace_nm+"'\""+
                                         " type = 'detail'"+
                                         "  data-toggle='modal'>영상 목록</button>";
                                }
                            },
                    ],
                    "columnDefs": [
                        { orderable: false, targets: 2 },
                        { orderable: false, targets: 3 },
                        { orderable: false, targets: 4 },
                        { orderable: false, targets: 5 },
                        { orderable: false, targets: 6 },
                        {"className": "text-center", "targets": "_all"}
                    ],
                    "paging": true,
                    "pageLength": 10,
                    "language": {
                      "zeroRecords": "데이터가 존재하지 않습니다."
                    },
                    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                         "<'row'<'col-sm-12'tr>>" +
                         "<'row'<'col-sm-12'p>>"
    });


    //************************************ workspace 조건 검색 클릭 ***************************
    $("#btnSearch_workspace").click(function(){

        var params = ""

        var schType_workspace = $("#schType_workspace").val();
        var schTxt_workspace  = $("#schTxt_workspace").val();
        var search_start_workspace = $("#search_start_workspace").val();
        var search_end_workspace  = $("#search_end_workspace").val();

        if(search_start_workspace.length < 1 && search_end_workspace.length > 1){
            alert("시작날짜를 선택해주세요.");
            return;
        } else if(search_start_workspace.length > 1 && search_end_workspace.length < 1){
            alert("끝날짜를 선택해주세요.");
            return;
        }

        if(new  Date(search_end_workspace) < new Date(search_start_workspace)){
            alert("끝 날짜가 시작날짜보다 빠릅니다.")
            return;
        }

        //상세구분 체크
        if(schType_workspace == "workspace_nm"){
            if(schTxt_workspace != ""){
                params += "?workspace_nm="+schTxt_workspace;
                if(search_start_workspace.length > 1 && search_end_workspace.length > 1){
                    params += "&start_date="+search_start_workspace+"&end_date="+search_end_workspace;
                }
            } else {
                if(search_start_workspace.length > 1 && search_end_workspace.length > 1){
                    params += "?start_date="+search_start_workspace+"&end_date="+search_end_workspace;
                }
            }
        }

        

        console.log("WORKSPACE search = ["+params+"]")

        workspace_dataList.ajax.url("/workspace/search"+params).load();
    });


    //************************************ workspace 날짜 조건 검색 클릭 ***************************
    $("#btnRefresh_workspace").click(function(){
        $("#schTxt_workspace").val('');
        $("#search_start_workspace").val('');
        $("#search_end_workspace").val('');
    });
});

var closePopup = function(){    
    $("#modalInsert").modal('hide');
};


function change_list(type, id){
    console.log(workspace_list);

    $("#schType_workspace").val('workspace_nm');
    $("#schTxt_workspace").val('');
    $("#search_start_workspace").val('');
    $("#search_end_workspace").val('');

    $("#schType_content").val('cont_nm');
    $("#schTxt_content").val('');
    $("#search_start_content").val('');
    $("#search_end_content").val('');
    $("#schType_date_content").val('all');
    
    if(type == "workspace"){
        $("#subtitle").text("현장 선택");
        $("#content_list_div").hide();
        $("#bottom_btn").hide();
        $("#search_status").hide();
        $("#content_detail").hide();
        $("#workspace_list_div").show();

        $("#search_area_workspace").show();
        $("#search_area_content").hide();
    } else {
        $("#subtitle").text("현장");
        $("#workspace_list_div").hide();
        $("#content_list_div").show();
        $("#search_status").show();
        $("#content_detail").hide();
        $("#bottom_btn").show();

        $("#search_area_workspace").hide();
        $("#search_area_content").show();
        if(id){
            console.log("ID EXIST : ["+id+"], ["+now_workspaceID+"]");
            params = "?workspace_id="+id;
            now_workspaceID=id;
        } else {
            console.log("ID UNDEFIND : ["+id+"], ["+now_workspaceID+"]");
            params = "?workspace_id="+now_workspaceID;
        }
        cont_dataList.ajax.url("/content/search"+params).load();
    }
}

function delete_file_element(id){
    if($("#formContents").children().length == 1){
        console.log("LAST DOM!");
        return;
    } else {
        $("#"+id).remove();
    }
}