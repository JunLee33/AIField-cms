// workspace.js
// Managing user functions for workspace.html


$(function() {

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() == '0101'){
        window.location.href = '/workspace/admin';
    }

    // MENU 적용
    $('#mn_workspace').attr({
        'class' : 'active'
    });
    $('#mn_workspace_admin').attr({
        'class' : 'active'
    });


    //**************************************사용자 메인 조회**********************************************

    //메인 화면 전체 조회 구문
    
    var dataList = $('#workspace_list').DataTable({
                    "lengthChange": false,
                    "searching": false,
                    "ordering": true,
                    "destroy": true,
                    "colReorder": false,
                    "info": false,
                    "autoWidth": true,
                    "processing": true,
                    // "serverSide": true,
                    "responsive": true,
                    ajax : {
                        "url": "/workspace/search",
                        "type":"POST",
                        "async" :"false"
                    },
                    "columns": [
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                    var getchild = false;
                                   if(data.cn_0201 > 0 || data.cn_0202 > 0 || data.cn_0203 > 0 || data.cn_0204 > 0 || data.tm_0201 > 0 || data.tm_0202 > 0 || data.tm_0203 > 0 || data.tm_0204 > 0 ){
                                        getchild = true;
                                    }

                                    return "<input type='checkbox' value="+data.workspace_id+" getchild='"+getchild+"'>";
                                }
                            },
                            { data: "workspace_id"},
                            { data: "workspace_nm"},
                            { data: "workspace_cmt"},
                            { data: "workspace_location"},
                            { data: "create_date"},
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        var workspace_cmt = data.workspace_cmt;
                                        var workspace_memo = data.workspace_memo;
                                        if(data.workspace_cmt.length < 1){
                                            workspace_cmt = " ";
                                        }
                                        if(data.workspace_memo.length < 1){
                                            workspace_memo = " ";
                                        }
                                        
                                        return "<button title='현장정보 상세보기' class=' btn_point "+
                                         "' value="+data.workspace_id+
                                         " workspace_nm="+data.workspace_nm.replaceAll(' ','_') +" workspace_cmt="+workspace_cmt.replaceAll(' ','_') + 
                                         " workspace_memo="+workspace_memo.replaceAll(' ','_') +" workspace_location="+data.workspace_location.replaceAll(' ','_')+
                                         " create_date="+data.create_date +" user_id="+data.user_id+" type = 'detail'"+
                                         "  data-toggle='modal'>수정</button>";
                                }
                            },

                    ],
                    "columnDefs": [
                        { orderable: false, targets: 0 },
                        { orderable: false, targets: 3 },
                        { orderable: false, targets: 4 },
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




    //************************************ DATE PICKER **************************
    $('#search_start , #search_end').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });

    //************************************ 특수문자 입력 막기**************************
    $("#workspace_nm, #workspace_cmt, #workspace_location, #workspace_memo").keyup(function(e) {
        var regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s]+/, '');
    });

    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){

        var params = ""

        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();
        var search_start = $("#search_start").val();
        var search_end  = $("#search_end").val();


        // 날짜 분기
        if(search_start.length < 1 && search_end.length > 1){
            alert("시작날짜를 선택해주세요.");
            return;
        } else if(search_start.length > 1 && search_end.length < 1){
            alert("끝날짜를 선택해주세요.");
            return;
        }

        if(new  Date(search_end) < new Date(search_start)){
            alert("끝 날짜가 시작날짜보다 빠릅니다.")
            return;
        }

        //상세구분 체크
        if(schType == "workspace_nm"){
            if(schTxt != ""){
                params += "?workspace_nm="+schTxt;
                if(search_start.length > 1 && search_end.length > 1){
                    params += "&start_date="+search_start+"&end_date="+search_end;
                }
            } else {
                if(search_start.length > 1 && search_end.length > 1){
                    params += "?start_date="+search_start+"&end_date="+search_end;
                }
            }
            
        }

        console.log("workspace search = ["+params+"]")

        dataList.ajax.url("/workspace/search"+params).load();
    });

    //************************************ 검색 조건 초기화 ***************************
    $("#btnRefresh").click(function(){
        $("#schTxt").val('');
        $("#search_start").val('');
        $("#search_end").val('');
    });

    //************************************ 현장 등록 팝업 open 시작 ***************************
    $("#btnInsertOpen").click(function() {
        reset_pop_up();     // POP UP input RESET!
        $("#workspace_id").attr("readonly",false);
        $("#workspace_id").attr("disabled",true);
        var today_date = new Date();
        const year = today_date.getFullYear(); 
        const month = today_date.getMonth() + 1; 
        const date = today_date.getDate(); 
        $("#create_date").val(`${year}-${month >= 10 ? month : '0' + month}-${date >= 10 ? date : '0' + date}`);
        $("#user_id").val($("#user_id").attr("value"));
        $(this).attr("data-target","#modalInsert")
        $("#btnDelete").hide();
        $("#btnUpdate").hide();
        $("#btnRegister").show();
        $("#modalTitle").text("현장 등록");
    });


    //****************************************************현장 상세조회******************************************

    $('#workspace_list tbody').on('click', 'button', function () {
        var workspace_id = $(this).val();
        var workspace_nm = $(this).attr('workspace_nm');
        var workspace_cmt = $(this).attr('workspace_cmt');
        var workspace_location = $(this).attr('workspace_location');
        var workspace_memo = $(this).attr('workspace_memo');
        var create_date = $(this).attr('create_date');
        var user_id = $(this).attr('user_id');

        // 팝업열기
        $(this).attr("data-target","#modalInsert")

        $("#btnDelete").show();
        $("#btnRegister").hide();
        $("#btnUpdate").show();

        $("#modalTitle").text("현장 정보 수정");

        $("#workspace_id").attr("readonly",true);
        $("#workspace_id").attr("disabled",false);
        $("#workspace_id").val(workspace_id);
        $("#workspace_nm").val(workspace_nm.replaceAll("_"," "));
        $("#workspace_cmt").val(workspace_cmt.replaceAll("_"," "));
        $("#workspace_location").val(workspace_location.replaceAll("_"," "));
        $("#workspace_memo").val(workspace_memo.replaceAll("_"," "));
        $("#create_date").val(create_date);
        $("#user_id").val(user_id);
    });

    //************************************ 현장 등록 및 수정 버튼 클릭 *******************************************
    $("#btnRegister, #btnUpdate").click(function(){
        var url = "";
        var method = "";

        if($(this).attr('id') == "btnRegister")
        {
            url = "/workspace/insert";
            method = "POST";
        }else{
            var workspace_id_set = $("#workspace_id").val();
            method= "PUT";
            url = "/workspace/update/"+workspace_id_set;
        }

        var workspaceId = $("#workspace_id").val();
        var createDate = $("#create_date").val();
        var userId = $("#user_id").val();
        var workspaceNm = $("#workspace_nm").val().replaceAll(" ","_");
        var workspaceCmt = $("#workspace_cmt").val().replaceAll(" ","_");
        var workspaceLocation = $("#workspace_location").val().replaceAll(" ","_");
        var workspaceMemo = $("#workspace_memo").val().replaceAll(" ","_");

        
        if(workspaceNm.length > 25){
            alert("현장명은 25자 이내로 제한됩니다.");
            $("input[name=workspace_nm]").focus();
            return;
        }
        if(workspaceCmt.length > 50){
            alert("현장 설명은 50자 이내로 제한됩니다.");
            $("input[name=workspace_cmt]").focus();
            return;
        }
        if(workspaceLocation.length > 20){
            alert("현장 주소는 20자 이내로 제한됩니다.");
            $("input[name=workspace_location]").focus();
            return;
        }
        if(workspaceMemo.length > 100){
            alert("현장 메모는 100자 이내로 제한됩니다.");
            $("input[name=workspace_memo]").focus();
            return;
        }


        if(workspaceNm == ""){
            alert("현장명을 입력하세요.");
            $("input[name=workspace_nm]").focus();
            return;
        }else if(workspaceLocation == ""){
            alert("현장 주소를 입력하세요");
            $("input[name=workspace_location]").focus();
            return;
        }

        // 입력 사항 적용
        var pattern_num = /[0-9]/;	// 숫자
    	var pattern_eng = /[a-zA-Z]/;	// 문자
    	var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
    	var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

        var form_data = new FormData($('#formWorkspace')[0]);

        $.ajax({
            url : url,
            data: form_data,
            type: method,
            contentType: false,
            processData: false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {

                alert(data.resultString);

                $("#btnSearch").click();
                $("#btnClose").click();

           }
        });

    });

    //************************************ 현장 삭제 버튼 클릭 *******************************************
    $("#btnDelete").click(function(){
        var result = confirm("해당 현장이 삭제됩니다. 삭제하시겠습니까?");
        if(result){
            var form_data = new FormData($('#formWorkspace')[0]);
            var workspace_id_set = $("#workspace_id").val();
            var method = "delete";
            var url = "/workspace/delete/"+workspace_id_set;
            $.ajax({
                url : url,
                data: form_data,
                type: method,
                contentType: false,
                processData: false,
                error:function(){
                alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
                },
                success:function(data) {

                    alert(data.resultString);

                    $("#btnSearch").click();
                    $("#btnClose").click();

            }
            });
        }
    });
});

var closePopup = function(){
    
    $("#modalInsert").modal('hide');
};

function reset_pop_up(){
    $("#workspace_id").val('');
    $("#create_date").val('');
    $("#workspace_nm").val('');
    $("#user_id").val('');
    $("#workspace_cmt").val('');
    $("#workspace_location").val('');
    $("#workspace_memo").val('');
}

// 선택한 현장 삭제
function delete_seleted(){
    var seleted_list = "";
    var getchild_node = "";
    var godelete = false;

    $('#workspace_list tr').each(function(i) {

        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {
            console.log($chkbox.attr('getchild'))

            

            var status = $chkbox.prop('checked');

            if($chkbox.attr('getchild') == "true" && status){
                godelete = true;
                console.log($chkbox.attr('value')+"의 하위 컨텐츠가 존재합니다. 하위 컨텐츠를 먼저 삭제해주세요.");
                
                if(getchild_node == "")getchild_node = $chkbox.attr('value');
                else getchild_node += "," + $chkbox.attr('value');                
            }

            console.log("STATUS", status);
            if(status) {
                if(i != 0){
                    var seleted_id = $("#workspace_list tr:eq("+i+") td:eq(1)").text();

                    if(seleted_list == "") seleted_list = seleted_id;
                    else seleted_list += "|"+seleted_id;
                }             
            }
        }
        console.log("WORKSPACE LIST ["+seleted_list+"]");
    });

    if(godelete){
        alert(getchild_node+"번의 하위 컨텐츠가 존재합니다. 하위 컨텐츠를 먼저 삭제해주세요.");
        return
    }  else {
        if(seleted_list.length !=0 ){
            // WORKSPACE ID 골라졌으면 간다 !!! 아니면 에외처리 !!
            var result = confirm("선택한 현장을 삭제하시겠습니까?");
            if(result){
    
                var form_data = new FormData();
                form_data.append("workspace_id", seleted_list);
                var method = "delete";
                var url = "/workspace/delete/"+seleted_list;
                $.ajax({
                    url : url,
                    data: form_data,
                    type: method,
                    contentType: false,
                    processData: false,
                    error:function(){
                    alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
                    },
                    success:function(data) {
    
                        alert(data.resultString);
    
                        $("#btnSearch").click();
                        $("#btnClose").click();
    
                }
                });
            }
            
    
        }else{
            alert("대상을 1개 이상 선택 해 주세요");
        }
    }


    
}