// content.js
// Managing user functions for content.html
var cont_dataList ;
var now_contID ; 
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


    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;

    // URLSearchParams.get()
    now_contID =            urlParams.get('cont_id');
    var cont_nm =      urlParams.get('cont_nm');
    $("#subtitle").text(cont_nm);
    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() == '0101'){
        window.location.href = '/content/admin/cont/detail?cont_id='+now_contID+'&cont_nm='+cont_nm;
    }

    map_box_init(now_contID);


    //************************************ DATE PICKER **************************
    $('#search_start_content , #search_end_content').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });



    //************************************입력 유효성***************************
    $("input[name='cont_nm']").keyup(function(e) {
        var regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9\s+]+/, '');
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
                // window.history.back();
                window.location=document.referrer;
           }
        });

    });

    //************************************ 콘텐츠 삭제 *******************************************
    $("#btndelete_tbl").click(function(){
        var result = confirm("'"+ cont_nm +"' 정사 영상을 삭제하시겠습니까?");
        if(result){
            var form_data_detail = new FormData();
            form_data_detail.append('cont_id', $("#content_id").text());
            
            
            $.ajax({
                url : "/content/delete/"+$("#content_id").text(),
                data: form_data_detail,
                type: "delete",
                contentType: false,
                processData: false,
                error:function(){
                alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
                },
                success:function(data) {
                    console.log("IN API TEST!")
                    console.log(data)

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
                            alert(data.resultString);
                            // window.history.back();
                            window.location=document.referrer;
                        }
                    });

                    
            }
            });
        }
    });


    


});

function map_box_init(id){
    $.ajax({
        type: "GET",
        url: "/content/search?cont_id="+id,
        
        success : function(json) {
            console.log(json.username)
            console.log(json.workspace_nm)
            var detail_cont = JSON.parse(json.data);
            console.log(detail_cont)

            var user_name = json.username;
            var workspace_nm = json.workspace_nm;
            $("#content_id").text(detail_cont.cont_id);
            $("#content_id1").val(detail_cont.cont_id);
            $("#content_size").text((parseFloat(detail_cont.cont_size)/1024).toFixed(2));
            $("#content_creat_date").text(detail_cont.create_date);
            $("#content_user_id").text(user_name+" ("+detail_cont.user_id+")");
            $("#content_name").val(detail_cont.cont_nm);
            $("#content_date").val(detail_cont.cont_date);
            $("#workspace_name").text(workspace_nm);
            $("#detail_img").attr('src', detail_cont.cont_thu_url);
        },
        error: function(json){
            console.log(json);
        }
    });
    
}