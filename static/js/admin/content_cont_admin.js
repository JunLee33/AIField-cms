// content.js
// Managing user functions for content.html
var cont_dataList ;
var now_workspaceID ; 
var now_cont_point ;
var workspace_list = [];
var nopoint= false;
var dom_cnti = 0;

$(function() {
    // MENU 적용
    $('#mn_content').attr({
        'class' : 'active'
    });
    $('#mn_content_admin').attr({
        'class' : 'active'
    });

    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;

    // URLSearchParams.get()
    now_workspaceID =    urlParams.get('workspace_id');
    var workspace_nm =   urlParams.get('workspace_nm');
    var isadd =        urlParams.get('gr');

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() != '0101'){
        window.location.href = '/content/cont?workspace_id='+now_workspaceID+'&workspace_nm='+workspace_nm;
    }

    if(isadd == "0"){
        $("#btnInsertOpen").hide();
    }
    
    $("#subtitle").text(workspace_nm);

    //************************************ DATE PICKER **************************
    $('#search_start_content , #search_end_content').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });



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
                            return "<input type='checkbox' value ="+data.cont_id+">";
                    }
                },
                { data: "cont_id"},
                // { data: "cont_thu_url"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            return "<img class='thum_img' src='"+data.cont_thu_url+"'>";
                    }
                },
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
                { data: "create_date"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            if(data.cont_status == "0201"){
                                return "<strong value='"+data.cont_status+"'>대기</strong>";
                            } else if(data.cont_status == "0202"){
                                return "<strong value='"+data.cont_status+"'>업로드 중</strong>";
                            } else if(data.cont_status == "0203"){
                                return "<strong value='"+data.cont_status+"'>중지</strong>";
                            } else if(data.cont_status == "0204"){
                                return "<strong value='"+data.cont_status+"'>완료</strong>";
                            } 
                    }
                },
                { data: "user_id"},
                { data: "user_nm"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                            if(data.cont_status == "0100"){
                                return "<button title='명령' class=' btn_point' style='color: red; border: 1px solid red;'"+
                                " value="+data.cont_id+ " cont_status="+data.cont_status + " type = 'detail'"+
                                " type = 'detail' onclick=\"content_command('"+data.cont_id+ "')\""+ "  data-toggle='modal'>업로드중지</button>";
                            } else{
                                return "<button title='명령' class=' btn_point'"+
                                " value="+data.cont_id+ " cont_status="+data.cont_status + " type = 'detail'"+
                                " type = 'detail' onclick=\"window.location.href = 'cont/detail?cont_id="+data.cont_id+"&cont_nm="+data.cont_nm+"'\""+ "  data-toggle='modal'>상세보기</button>";
                            } 
                    }
                },

        ],
        "columnDefs": [
            { orderable: false, targets: 0 },
            { orderable: false, targets: 2 },
            { orderable: false, targets: 10 },
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

    //************************************입력 유효성***************************
    $("input[name='cont_nm']").keyup(function(e) {
        var regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+/, '');
    });


    //************************************ CONTENT 조건 검색 클릭 ***************************
    $("#btnSearch_content").click(function(){

        var params = ""
        params = "?workspace_id="+now_workspaceID;

        var schType_content = $("#schType_content").val();
        var schTxt_content  = $("#schTxt_content").val();
        var search_start_content = $("#search_start_content").val();
        var search_end_content  = $("#search_end_content").val();
        var schType_status = $("#schType_date_content").val();
        // 날짜 검색

        if(search_start_content.length < 1 && search_end_content.length > 1){
            alert("시작날짜를 선택해주세요.");
            return;
        } else if(search_start_content.length > 1 && search_end_content.length < 1){
            alert("끝날짜를 선택해주세요.");
            return;
        }

        if(new  Date(search_end_content) < new Date(search_start_content)){
            alert("끝 날짜가 시작날짜보다 빠릅니다.")
            return;
        }
        
        //상세구분 체크
        if(schType_content == "cont_nm"){
            if(schTxt_content != ""){
                params += "&cont_nm="+schTxt_content;
            }
        }

        if(search_start_content.length > 1 && search_end_content.length > 1){
            params += "&start_date="+search_start_content+"&end_date="+search_end_content;
        }

        //상세구분 체크
        if(schType_status == "waiting"){
            params += "&cont_status=0201";
        } else if(schType_status == "upload"){
            params += "&cont_status=0202";
        } else if(schType_status == "stop"){
            params += "&cont_status=0203";
        } else if(schType_status == "success"){
            params += "&cont_status=0204";
        }

        console.log("contents search = ["+params+"]")

        cont_dataList.ajax.url("/content/search"+params).load();
    });


    //************************************ CONTENT 날짜 조건 초기화 클릭 ***************************
    $("#btn_refresh_content").click(function(){
        $("#schTxt_content").val('');
        $("#search_start_content").val('');
        $("#search_end_content").val('');
        $("#schType_date_content").val('all');
    });


    //************************************정사영상 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function() {
        $("#formContents").html("");
        // 파일 추가 DOM CLICK
        $("#btnDom").click();


        $(this).attr("data-target","#modalInsert")
        // $("#btnDelete").hide();
        $("#btnRegister").show();
        $("#btnUpdate").hide();
        $("#modalTitle").text("정사영상 등록");
    });





    //************************************ 콘텐츠 등록 및 수정 버튼 클릭 *******************************************
    
    $("#btnRegister").click(function(){
        var file_seletor = $("#formContents").children("div");
        var user_point = $("#user_point").val();
        var content_point = 0;
        var total_data = 0;
        
        for (var i = 0; i < file_seletor.length; i++) {

            var filedom_ID = $("#formContents").children("div").eq(i).attr('id');                  // 자동 생성 아이디라서, LENGTH의 i 값과 id의 숫자 값이 다를 수 있음

            console.log(filedom_ID);
            var typeField = filedom_ID.split('_');
            console.log(typeField[1]);

            var cont_date = $("#cont_date_"+typeField[1]).val();    
            var cont_nm = $("#cont_nm_"+typeField[1]).val();
            var file_nm_text = $("#file_nm_text-"+typeField[1]).val();
            var file_nm = $("#file_nm-"+typeField[1]).val();
            total_data += parseFloat($("#file_size_text-"+typeField[1]).val());

            if(cont_date == ""){
                alert("촬영일을 선택해주세요.");
                return;
            }
            if(cont_nm == ""){
                alert("파일이름을 입력해주세요.");
                return;
            }
            if(file_nm_text == ""){
                alert("파일을 등록해주세요.");
                return;
            }
            if(file_nm == ""){
                alert("파일을 등록해주세요.");
                return;
            }

            if(cont_date.length > 10){
                alert("촬영일이 올바른 형식이 아닙니다.");
                return;
            }
            if(cont_nm.length > 10){
                alert("파일이름은 최대 10자입니다.");
                return;
            }
        }

        console.log(total_data);
        console.log(Math.ceil(total_data));
        $("#upload_file_size").text(total_data);
        $("#upload_use_point").text(Math.ceil(total_data));
        var now_point = $("#user_point").val();
        
        if(parseInt(now_point)-Math.ceil(total_data) < 0){
            $("#now_use_point").text("포인트가 부족합니다.");
            nopoint = true;
        }else{
            $("#now_use_point").text(parseInt(now_point)-Math.ceil(total_data));
        }
        $('#modalPoint').modal('show');

    });

    
 
    //************************************ 콘텐츠 등록 포인트 사용 *******************************************
    
    $("#btn_point").click(function(){
        console.log("HELLO!!!A")
        var userPoint = parseInt($("#user_point").val());
        var now_usepoint = parseInt($("#now_use_point").text());

        if(nopoint){
            alert("포인트가 부족합니다. 충전 후 이용해주세요.");
            return;
        }

        $("#spinner_wrap").css('display','flex');
        setTimeout(() => {
            var form_data = new FormData($('#formContents')[0]);
            form_data.append("workspace_id", now_workspaceID);
            form_data.append("use_point", $("#upload_use_point").text());
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/content/insert",
                data: form_data,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 600000,
                success: function(data) {
                    console.log("IN UPLOAD API!")
                    console.log(data)
                    
                    for(var i =0; i< data.file_name.length; i++){
                        var file_data = data.file_name[i]
                        var tiff_name = data.file_name[i].file_name;
                        var flie_path = data.file_name[i].file_path;
                        var nath_path = flie_path.split('ECTNFS_CHANGE')[1];

                        var url = "http://ect2.iptime.org:18020/apis/v1"
                        var method = "POST"
                        var api_data = {
                            "cmd" : "register_image",
                            "reqobj" : 
                            {
                                "workspace_name": "w"+now_workspaceID,
                                "tiff_name": tiff_name,
                                "nas_path" : nath_path
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

                    alert('영상이 업로드 되었습니다.');
                    closePopup();
                    window.location.reload();
                    $("#spinner_wrap").css('display','none');

                },
                error: function(error) {
                    console.log(error)
                    alert("서버응답이 없습니다.");
                    $("#spinner_wrap").css('display','none');

                }
                
            });
        }, 500);

        // alert("현재 컨텐츠 저장은 지원하지 않습니다.");

    });

    //************************************ 콘텐츠 수정 *******************************************
    $("#btnupdate_tbl").click(function(){
        var form_data_update = new FormData($("#formContentsDetail")[0]);
        // form_data_update.append('cont_id',$("#content_id").text() )
        for (var pair of form_data_update.entries()) {
            // 예외처리 진행
            console.log(pair[0]+ ', ' + pair[1]);
        }

        $.ajax({
            url : "/content/update/"+$("#content_id").text(),
            data: form_data_update,
            type: "PUT",
            contentType: false,
            processData: false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {

                alert(data.resultString);

                $("#btnSearch").click();
                $("#btncontents_list").click();
           }
        });

    });

    //************************************ 콘텐츠 삭제 *******************************************
    $("#btndelete_tbl").click(function(){
        var form_data_detail = new FormData();
        form_data_detail.append('cont_id', $("#content_id").text());
        
        $.ajax({
            url : "contents/delete",
            data: form_data_detail,
            type: "delete",
            contentType: false,
            processData: false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {

                for(var i =0; i< data.file_name.length; i++){
                    var file_data = data.file_name[0]
                    var tiff_url = data.file_name[0].file_name;
                    var tiff_array = tiff_url.split('/');
                    var tiff_name_tif = tiff_array[tiff_array.length-1];
                    var tiff_name = tiff_name_tif.split('.')[0];

                    var tiff_workspaceid = file_data.workspaceid;

                    var url = "http://ect2.iptime.org:18020/apis/v1"
                    var method = "POST"
                    var api_data = {
                        "cmd" : "unregister_image",
                        "reqobj" : 
                        {
                            "workspace_name": "w"+tiff_workspaceid,
                            "tiff_name": tiff_name,
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
                        success:function(data) {
                            console.log(data);
                            alert(data.resultString);
                            window.history.back();
                        }
                    });
                }

                alert(data.resultString);
                $("#btnSearch").click();
                $("#btncontents_list").click();
           }
        });

    });


    //************************************ 콘텐츠 등록 팝업 *******************************************
    var dom_cnt = 0;


    $("#btnDom").click(function(){
        if($("#formContents").children().length == 2){
            console.log("LIMIT 2");
            return;
        }

        var file_select_element = "<div class='box-body' style='padding : 10px' id='filedom_"+dom_cnt+"'>";

        file_select_element += "    <div class='form-group has-feedback' style='margin: 0%; display: inline-block; width: 48%;'>";
        file_select_element += "            <label for='cont_date'>촬영일 *</label>";
        file_select_element += "            <input type='text' class='form-control' name='cont_date' id='cont_date_"+dom_cnt+"' placeholder='촬영일을 선택해주세요' readonly=true>";
        file_select_element += "            <span class='glyphicon glyphicon-user form-control-feedback'></span>";
        file_select_element += "        </div>";

        file_select_element += "        <div class='form-group has-feedback' style='float: right; margin-right: 0px; margin-bottom:0px; display: inline-block; width: 48%;'>";
        file_select_element += "            <label for='cont_nm' class='col-md-6'>제목 *</label>";
        file_select_element += "            <input type='text' class='form-control' name='cont_nm' id='cont_nm_"+dom_cnt+"' placeholder='제목을 입력해주세요'>";
        file_select_element += "            <span class='glyphicon glyphicon-tag form-control-feedback'></span>";
        file_select_element += "        </div>";

        file_select_element += "        <div class='form-group' id='fileDesc_"+dom_cnt+"' style='margin-left:0px; margin-bottom:0px;'> <label>파일명 *</label>";
        file_select_element += "            <div class=' filebox bs3-primary' id='preview-image_"+dom_cnt+"'>";
        file_select_element += "                <input class='upload-name' id='file_nm_text-"+dom_cnt+"' placeholder='파일선택' disabled='disabled'>";
        file_select_element += "                <input type='hidden' name='cont_size' id='file_size_text-"+dom_cnt+"'>";
        file_select_element += "                <div style='width: 20%; display: inline-block; float: right;'>";
        file_select_element += "                    <label for='file_nm-"+dom_cnt+"' style='margin-left:1%;' title='파일 찾기'>찾기</label>";
        file_select_element += "                    <input type='file' id='file_nm-"+dom_cnt+"' name='files' class='upload-hidden'>";
        file_select_element += "                    <button type='button' class='btn btn_default' style='width: 45%;' id='btnDelete_"+dom_cnt+"' onclick=\"delete_file_element('filedom_"+dom_cnt+"')\" title='삭제'>삭제</button>";
        file_select_element += "                </div>";
        file_select_element += "            </div>";
        file_select_element += "        </div>";

        file_select_element += "    </div>";

        $("#formContents").append(file_select_element);
        
        $("input[name='cont_date']").datepicker({
            autoclose: true
            ,format: 'yyyy-mm-dd'
            ,language: "kr"
            ,calendarWeeks: false
            ,todayHighlight: true
            ,showInputs: false
        });

        $("input[name='cont_nm']").keyup(function(e) {
            var regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+$/;
            if (regex.test(this.value) !== true)
              this.value = this.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+/, '');
        });

        // Modal 관련 파일 불러오기 Settings. ///////////////////////////////////////////////////////////////////////
        dom_cnti = dom_cnt;
        $(document).on('change',"#file_nm-"+dom_cnti , function(event) {
            var file = event.target.files[0];
            console.log("ININ")
            console.log(file.name)
    
            if (file.name.length >= 50) {
                alert("파일의 글자수가 너무 많습니다");
                $('#file_preview-'+dom_cnti).attr('src',"");
                $('#file_nm_text-'+dom_cnti).val('');
                return;
            }
    
            $('#file_nm_text-'+dom_cnti).val(file.name);
            
            var file_size = file.size;
            var Gigabyte = parseFloat(file_size) / 1000000000;
    
            $('#file_size_text-'+dom_cnti).val(Gigabyte.toFixed(3));
            console.log(Math.ceil(Gigabyte));
        });
        dom_cnt++;
    });
});

var closePopup = function(){    
    $("#modalInsert").modal('hide');
};


function delete_file_element(id){
    if($("#formContents").children().length == 1){
        console.log("LAST DOM!");
        return;
    } else {
        // console.log(id.split("_")[1]);
        // console.log($("#now_cont_point").text());
        // console.log($("#file_size_text-"+id.split("_")[1]).val());
        $("#"+id).remove();

    }
}

// 선택한 현장 삭제
function delete_seleted(){
    var seleted_list = "";
    $('#content_list tr').each(function(i) {

        var $chkbox = $(this).find('input[type="checkbox"]');

        // Only check rows that contain a checkbox
        if($chkbox.length) {

            var status = $chkbox.prop('checked');
            console.log("STATUS", status);
            if(status) {
                if(i != 0){
                    var seleted_id = $("#content_list tr:eq("+i+") td:eq(1)").text();

                    if(seleted_list == "") seleted_list = seleted_id;
                    else seleted_list += "|"+seleted_id;
                }             
            }
        }
        console.log("CONTENT LIST ["+seleted_list+"]");
    });

    if(seleted_list.length !=0 ){
        var result = confirm("선택한 정사 영상을 삭제하시겠습니까?");
        if(result){
            // ID 골라졌으면 간다 !!! 아니면 에외처리 !!
            var form_data = new FormData();
            form_data.append("cont_id", seleted_list);
            var method = "delete";
            var url = "/content/delete/"+seleted_list;
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

                    for(var i =0; i< data.file_name.length; i++){
                        var file_data = data.file_name[0]
                        var tiff_url = data.file_name[0].file_name;
                        var tiff_array = tiff_url.split('/');
                        var tiff_name_tif = tiff_array[tiff_array.length-1];
                        var tiff_name = tiff_name_tif.split('.')[0];

                        var tiff_workspaceid = file_data.workspaceid;

                        var url = "http://ect2.iptime.org:18020/apis/v1"
                        var method = "POST"
                        var api_data = {
                            "cmd" : "unregister_image",
                            "reqobj" : 
                            {
                                "workspace_name": "w"+tiff_workspaceid,
                                "tiff_name": tiff_name,
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
                    $("#btnSearch_content").click();

            }
            });
        }
        

    }else{
        alert("대상을 1개 이상 선택 해 주세요");
    }
}