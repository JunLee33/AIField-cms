// themamap.js

var workspace_dataList;
var themamap_dataList;
var cont_dataList ;
var selected_dataList;

var now_workspaceID ; 
var seleted_contents = [];


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

    // URLSearchParams.get()
    now_workspaceID =    urlParams.get('workspace_id');
    var workspace_nm =   urlParams.get('workspace_nm');
    $("#subtitle").text(workspace_nm);
    $("#workspace_name").text(workspace_nm);


    //************************************** 정사영상 목록 조회**********************************************
    // contents list 
    cont_dataList = $('#content_list').DataTable({
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
            "url": "/content/search?workspace_id="+now_workspaceID,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            return "<button class='btn_default' value ="+data.cont_id+">선택</button>";
                    }
                },
                { data: "cont_id"},
                { data: "cont_nm"},
                { data: "cont_date"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            // MB- > GB로 변경
                            var gb_data = parseFloat(data.cont_size) / 1024;
                            return "<strong>"+gb_data.toFixed(2)+" GB</strong>";
                    }
                },
                { data: "create_date"}
        ],
        "columnDefs": [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 4 },
            {"className": "text-center", "targets": "_all"}
        ],
        "paging": false,
        "scrollY":  "40%",
        "scrollCollapse": true,
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });


    selected_dataList = $("#selected_list").DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        "responsive": true,
        "columnDefs": [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 4 },
            {"className": "text-center", "targets": "_all"}
        ],
        "paging": false,
        "scrollY":  "40%",
        "scrollCollapse": true,
        "language": {
          "zeroRecords": "선택된 목록이 없습니다."
        },
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });


    //************************************ 검출 대상 선택 버튼 클릭 *******************************************
    $("#content_list tbody").on('click', "button", function(){
        if(seleted_contents.length == 2){
            alert("최대 2개만 선택 가능합니다.")
            return;
        }

        var selected_cont_id = $(this).parents('td').siblings().eq(0).text();
        var selected_cont_nm = $(this).parents('td').siblings().eq(1).text();
        var selected_cont_date = $(this).parents('td').siblings().eq(2).text();
        var selected_cont_size = $(this).parents('td').siblings().eq(3).text();
        var selected_cont_create_dt = $(this).parents('td').siblings().eq(4).text();

        console.log(seleted_contents);
        var index = seleted_contents.indexOf(String(selected_cont_id));
        console.log(index);
        if(index != -1){
            return;
        }

        selected_dataList.row.add([
            "<button type='button' class='btn_default' value='"+selected_cont_id+"' onclick=\"remove_row("+$(this).attr('value')+")\">삭제</button>",
            selected_cont_id,
            selected_cont_nm,
            selected_cont_date,
            selected_cont_size,
            selected_cont_create_dt,
        ]).draw( false );

        seleted_contents.push(selected_cont_id);
        $("#selected_cnt").text(seleted_contents.length);
    })


    //************************************ 주제도 등록 버튼 클릭 *******************************************
    $("#btn_detection").click(function(){
        var last_list= "";
        console.log(seleted_contents);
        
        var themamap_name = $("#themamap_nm").val();
        var car_model = $("#car_model").is(":checked");
        var building_model = $("#building_model").is(":checked");
        var themamap_type = "";
        console.log(car_model, building_model)


        if(themamap_name.length < 1){
            alert("검출제목을 입력해주세요.");
            return;
        }
        
        if(car_model && building_model){
            alert("검출종류를 하나만 선택해주세요.");
            return;
        } else if(!car_model && !building_model){
            alert("검출종류를 선택해주세요.");
            return;
        } else if(car_model && !building_model){
            // car = 0701
            themamap_type = "0701"
        } else if(!car_model && building_model){
            // building = 0702
            themamap_type = "0702"
        }

        if(seleted_contents.length == 0){
            alert("선택된 영상이 없습니다.");
            return;
        }

        for(i=0; i <seleted_contents.length; i++){
            if(i == 0){
                last_list = seleted_contents[i] ;
            } else {
                last_list += "|"+seleted_contents[i] ;
            }
        }

        var form_data_thema = new FormData($("#themamap_insert")[0]);
        form_data_thema.append("themamap_type", themamap_type);
        form_data_thema.append("workspace_id", now_workspaceID);
        form_data_thema.set("cont_id", last_list);

        // form_data_update.append('cont_id',$("#content_id").text() )
        for (var pair of form_data_thema.entries()) {
            // 예외처리 진행
            console.log(pair[0]+ ', ' + pair[1]);
        }

        $.ajax({
            url : "/themamap/insert",
            data: form_data_thema,
            type: "POST",
            contentType: false,
            processData: false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {
                console.log(data)
                
                // var job_id = data.themamap_data.themamap_id;
                var job_id = "J"+data.themamap_data.themamap_id;

                // 0701 car
                var themamap_type = "od-timeserise";

                // 0702 Building
                if(data.themamap_data.themamap_type == "0702"){
                    themamap_type = "od-timeserise";
                }

                // 무조건 2개.
                var serises = [];
                serises.push(data.file_path[0].file_name);
                serises.push(data.file_path[1].file_name);

                var url = "http://ect2.iptime.org:18020/apis/v1"
                var method = "POST"
                var api_data = {
                    "cmd" : "job_create",
                    "reqobj" : 
                        {
                        "job_id": String(job_id),
                        "job_type": themamap_type,
                        "serises": serises
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
                        alert('검출 실행이 요청되었습니다.');
                        // window.location.href = '/themamap/cont?workspace_id='+now_workspaceID+'&workspace_nm='+workspace_nm
                        window.location=document.referrer;
                    }
                });

                

           }
        });        
    });


    $(document).ready(function(){
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

    $("#btn_cancel").on("click", function(){
        window.history.back();
    });

});

var closePopup = function(){
    $("#user_nm").attr("disabled",false);
    $("#user_nm").val("");
    $("#user_id").attr("readonly",false);
    $("#user_id").val("");
    $("#user_pwd").attr("disabled",false);
    $("#user_pwd").val("");
    $("#user_conf_pwd").attr("disabled",false);
    $("#user_conf_pwd").val("");
    $("#user_gr").attr("disabled",false);
    $("#iParking_seq").attr("disabled",false);
    $("#user_gr").val("all");
    $("#user_dept_nm").attr("disabled",false);
    $("#user_count").val(0);
    $("#user_disk").val(0);
    $("#user_settop").val(0);
    
    $("#modalInsert").modal('hide');
};



function delete_file_element(id){
    if($("#formUser").children().length == 1){
        console.log("LAST DOM!");
        return;
    } else {
        $("#"+id).remove();
    }
}

function remove_row(cont_id){
    var index = seleted_contents.indexOf(String(cont_id));
    selected_dataList.row(index).remove().draw( false );
    seleted_contents.splice(index, 1);

    $("#selected_cnt").text(seleted_contents.length);
}