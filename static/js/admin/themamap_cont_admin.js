// themamap.js

var workspace_dataList;
var themamap_dataList;
var cont_dataList ;
var selected_dataList;

var now_workspaceID ; 
var seleted_contents = [];
var themamap_id_List = [];
var workspace_nm = "";

$(function() {
    
    // MENU 적용
    $('#mn_themamap').attr({
        'class' : 'active'
    });
    $('#mn_themamap_admin').attr({
        'class' : 'active'
    });


    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    var isadd = urlParams.get('gr');

    if(isadd == "0"){
        $("#btnInsertOpen").hide();
    }
    
    // URLSearchParams.get()
    now_workspaceID =    urlParams.get('workspace_id');
    workspace_nm =   urlParams.get('workspace_nm');
    $("#subtitle").text(workspace_nm);

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() != '0101'){
        window.location.href = '/themamap/cont?workspace_id='+now_workspaceID+'&workspace_nm='+workspace_nm;
    }
    
    //**************************************주제도 목록 조회**********************************************
    // themamap list 
    themamap_dataList = $('#themamap_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/themamap/search?workspace_id="+now_workspaceID,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            themamap_id_List.push(data.themamap_id);
                            return "<input type='checkbox' value =" + data.themamap_id+">";
                    }
                },
                {data : "themamap_id"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            if(data.themamap_type == "0701"){
                                return "<strong value='"+data.themamap_type+"'>차량</strong>";
                            } else if(data.themamap_type == "0702"){
                                return "<strong value='"+data.themamap_type+"'>건물</strong>";
                            }
                    }
                },
                {data : "themamap_nm"},
                {data : "create_date"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            if(data.themamap_status == "0201"){
                                return "<strong value='"+data.themamap_status+"'>대기</strong>";
                            } else if(data.themamap_status == "0202"){
                                return "<strong value='"+data.themamap_status+"'>작업중</strong>";
                            } else if(data.themamap_status == "0203"){
                                return "<strong value='"+data.themamap_status+"'>중지</strong>";
                            } else if(data.themamap_status == "0204"){
                                return "<strong value='"+data.themamap_status+"'>완료</strong>";
                            } 
                    }
                },
                {data : "user_id"},
                {data : "user_nm"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var command_text = '';
                        var command_function = '';
                        if(data.themamap_status == "0201"){
                            command_text = "대기중";
                            command_function = "job_resume";
                        } else if(data.themamap_status == "0202"){
                            command_text = "작업중지";
                            command_function = "job_suspend";
                        } else if(data.themamap_status == "0203"){
                            command_text = "재개";
                            command_function = "job_resume";
                        } else if(data.themamap_status == "0204"){
                            command_text = "상세보기";
                            command_function = "detail";
                        }

                        // return "<button title='명령' class=' btn_point'"+
                        // " value="+data.cont_id+ " cont_status="+data.cont_status + " type = 'detail'"+
                        // " type = 'detail' onclick=\"window.location.href = 'cont/detail?cont_id="+data.cont_id+"&cont_nm="+data.cont_nm+"'\""+ "  data-toggle='modal'>"+command_text+"</button>";
                        return "<button title='명령' class=' btn_point' "+
                        " value="+data.themamap_id+ " themamap_status="+data.themamap_status + " type = 'detail'"+
                        " onclick=\"job_command('"+command_function+"','"+data.themamap_id+"','"+data.themamap_nm+"')\" type = 'detail'"+ "  data-toggle='modal'>"+command_text+"</button>";
                        
                    }
                },

        ],
        "columnDefs": [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 6 },
            {"className": "text-center", "targets": "_all"}
        ],
        "rowCallback": function( row, data, iDisplayIndex ) {


        },
        
        "paging": true,
        "pageLength": 10,
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        buttons: [
            {
                text: 'My button',
                action: function ( e, dt, node, config ) {
                    alert( 'Button activated' );
                }
            }
        ],
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });

    // 상태확인
    status_info();
    var check_status = setInterval(() => {
        status_info();
    }, 10000);


    // DATEPICKER
    $('#search_start , #search_end').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });


    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){

        var params = "?workspace_id="+now_workspaceID;

        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();
        var search_start = $("#search_start").val();
        var search_end  = $("#search_end").val();
        var schType_status = $("#schType_status").val();



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
        if(schType == "themamap_nm"){
            if(schTxt != ""){
                params += "&themamap_nm="+schTxt;
            }
        }

        if(search_start.length > 1 && search_end.length > 1){
            params += "&start_date="+search_start+"&end_date="+search_end;
        } 

        if(schType_status == "waiting"){
            params += "&themamap_status=0201";
        } else if(schType_status == "upload"){
            params += "&cthemamap_status=0202";
        } else if(schType_status == "stop"){
            params += "&themamap_status=0203";
        } else if(schType_status == "success"){
            params += "&themamap_status=0204";
        }

        console.log("THEMAMAP search = ["+params+"]")

        themamap_dataList.ajax.url("/themamap/search"+params).load();
    });

    //************************************ 검색 조건 초기화 ***************************
    $("#btnRefresh").click(function(){
        $("#schTxt").val('');
        $("#search_start").val('');
        $("#search_end").val('');
        $("#schType_status").val('all');
    });


    //************************************사용자 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function() {
        window.location.href = '/themamap/cont/add?workspace_id='+now_workspaceID+'&workspace_nm='+workspace_nm+'&gr=1'
    });
});

// 선택한 주제도 삭제
function delete_seleted(){
    var seleted_list = "";
    $('#themamap_list tr').each(function(i) {

        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {

            var status = $chkbox.prop('checked');
            console.log("STATUS", status);
            if(status) {
                if(i != 0){
                    var seleted_id = $("#themamap_list tr:eq("+i+") td:eq(1)").text();

                    if(seleted_list == "") seleted_list = seleted_id;
                    else seleted_list += "|"+seleted_id;
                }             
            }
        }
        console.log("THEMAMAP LIST ["+seleted_list+"]");
    });

    if(seleted_list.length !=0 ){
        var result = confirm("선택한 주제도를 삭제하시겠습니까?");
        if(result){

            // themamap ID 골라졌으면 간다 !!! 아니면 에외처리 !!
            var form_data = new FormData();
            form_data.append("themamap_id", seleted_list);
            var method = "delete";
            var url = "/themamap/delete/"+seleted_list;
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
                    console.log(data);

                    for(var i =0; i< data.themamap_id_list.length; i++){
                        
                        var delete_job_id = data.themamap_id_list[i];

                        var url = "http://ect2.iptime.org:18020/apis/v1"
                        var method = "POST"
                        var api_data = {
                            "cmd" : "job_delete",
                            "reqobj" : 
                            {
                                "job_id": delete_job_id,
                            }
                        }

                        console.log(api_data);
                        $.ajax({
                            url : url,
                            data : JSON.stringify(api_data),
                            type : method,
                            contentType : "application/json",
                            // processData : false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                            },
                            error:function(e){
                                console.log(e)
                                alert("API 서버 응답이 없습니다. API 서버 확인후 다시 시도해 주세요.");
                            },
                            success:function(data1) {
                                console.log(data1);
                            }
                        });
                    }
                    alert(data.resultString);
                    $("#btnSearch").click();

                }
            });

        }else{
            alert("대상을 1개 이상 선택 해 주세요");
        }
    }
}



function status_info(){

    var duplicate_check = []
    themamap_id_List.filter((element, index) => {
        if(themamap_id_List.indexOf(element) === index){
            duplicate_check.push(String(element));
        };
    });
    console.log(duplicate_check);
    
    var url = "http://ect2.iptime.org:18020/apis/v1"
    var method = "POST"
    var api_data = {
        "cmd" : "job_status",
        "reqobj" : 
            {
            "jobs": duplicate_check
            }
    }
    console.log(api_data);
    $.ajax({
        url : url,
        data : JSON.stringify(api_data),
        type : method,
        contentType : "application/json",
        // processData : false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        },
        error:function(e){
            console.log(e)
            alert("API 서버 응답이 없습니다. API 서버 확인후 다시 시도해 주세요.");
        },
        success:function(data1) {
            console.log(data1);

            $.ajax({
                url : '/themamap/update',
                data : JSON.stringify({"type" : "list", "data" : data1.resobj}),
                contentType : "application/json",
                type: "put",
                error:function(){
                    console.log("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
                },
                success:function(data2) {
                    console.log(data2);
                }
            });
        }
    });
}


function job_command(command, job_id, themamapNM){

    var url = "http://ect2.iptime.org:18020/apis/v1"
    var method = "POST"
    var themamap_status = "";
    if(command == "job_resume"){
        themamap_status = "0202"
    } else if(command == "job_suspend"){
        themamap_status = "0203"
    }
    if(command == "detail"){
        console.log("GO TO DETAIL");
        window.location.href = '/themamap/cont/detail?themamap_id='+job_id+'&themamap_name='+themamapNM;
        return;
    } else {
        var api_data = {
            "cmd" : command,
            "reqobj" : 
                {
                "job_id": job_id
                }
        }
        console.log(api_data);
        $.ajax({
            url : url,
            data : JSON.stringify(api_data),
            type : method,
            contentType : "application/json",
            // processData : false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            },
            error:function(e){
                console.log(e)
                alert("API 서버 응답이 없습니다. API 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data1) {
                console.log(data1);

                $.ajax({
                    url : '/themamap/update',
                    data : JSON.stringify({"type" : "command", "data" : { "job_id" :job_id,
                    "status" :themamap_status}
                    }),
                    contentType : "application/json",
                    type: "put",
                    error:function(){
                    alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
                    },
                    success:function(data2) {
                        console.log(data2);
                    }
                });
            }
        });
    }
}

