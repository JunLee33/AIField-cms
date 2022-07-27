// themamap.js

var workspace_dataList;
var themamap_dataList;
var cont_dataList ;
var selected_dataList;
var now_user_id ;
var now_workspaceID ; 
var seleted_contents = [];


$(function() {

    now_user_id = $("#current_user_id").val();
    console.log($("#current_user_grade").val());

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() != '0101'){
        window.location.href = '/themamap';
    }

    // 진행상태 검색창 숨기기
    $("#search_status").hide();
    
    // MENU 적용
    $('#mn_themamap').attr({
        'class' : 'active'
    });
    $('#mn_themamap_admin').attr({
        'class' : 'active'
    });


    //**************************************현장 목록 조회**********************************************
    
    // 현장 목록
    workspace_dataList = $('#workspace_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "order": [[ 0, "desc" ]],
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
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
                            return "<strong>"+data.tm_0204+"건</strong>";
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            return "<strong>"+(parseInt(data.tm_0201)+parseInt(data.tm_0202)+parseInt(data.tm_0203))+"건</strong>";
                    }
                },
                {data : "user_id"},
                {data : "user_nm"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            if(data.user_id == now_user_id){
                                return "<button title='주제도 목록' class=' btn_point "+
                                "' onclick=\"window.location.href = 'admin/cont?workspace_id="+data.workspace_id+"&workspace_nm="+data.workspace_nm+"&gr=1'\""+
                                " type = 'detail'"+
                                "  data-toggle='modal'>주제도 목록</button>";
                            } else { 
                                return "<button title='주제도 목록' class=' btn_point "+
                                "' onclick=\"window.location.href = 'admin/cont?workspace_id="+data.workspace_id+"&workspace_nm="+data.workspace_nm+"&gr=0'\""+
                                " type = 'detail'"+
                                "  data-toggle='modal'>주제도 목록</button>";
                            }
                            
                    }
                },
        ],
        "columnDefs": [
            { orderable: false, targets: 5 },
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


    // DATEPICKER
    $('#search_start , #search_end').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });

    //************************************ID,PW 한글 입력 막기***************************

    $("#user_pwd,#user_conf_pwd,#user_disk,#user_settop").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#user_id,#user_disk,#user_settop").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
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

        workspace_dataList.ajax.url("/workspace/search"+params).load();
    });

    //************************************ 검색 조건 초기화 ***************************
    $("#btnRefresh").click(function(){
        $("#schTxt").val('');
        $("#search_start").val('');
        $("#search_end").val('');
    });

    //************************************사용자 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function() {
        $("#subtitle").text("검출 등록");
        $("#search_area").hide();
        $("#bottom_btn").hide();
        $("#workspace_list_div").hide();
        $("#themamap_list_div").hide();
        $("#insert_list_div").show();
    });


    //************************************ 주제도 목록으로 넘어가기 ***************************
    $('.tbl_list .row_detail').hide();	
    $(document).on('click', '.tbl_list button[id^=trShowBtn]', function() {			
        var trNum = $(this).attr('id').slice(9);	
        if($(this).hasClass('open') == true){
            $(this).removeClass('open');
            $('#trDetail'+trNum+'').hide();
        }else{
            $(this).addClass('open');
            $('#trDetail'+trNum+'').show();
        }		
    });	
        
});