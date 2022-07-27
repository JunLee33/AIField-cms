// user.js
// Managing user functions for user.html

var user_id_now = '';
var group_seq_now = '';
var user_reg_user_cnt = '';
var user_disk_temp;
var user_settop_temp;
var sum_user_disk;
var remain_user_disk;
var user_grade_temp;


$(function() {


    // 팝업 DATE PICKER
    $('#user_birth').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });

    // 현재 유저 정보 셋팅
    // $.ajax({
    //     type: "GET",
    //     url: "/user/search?user_grade=0000",
        
    //     success : function(json) {
    //         console.log(json);
    //         user_id_now = json.resultUserid;
    //         group_seq_now = json.resultUserGroup;
    //         user_reg_user_cnt = json.resultUser_reg_user_cnt;
    //         now_user = json.now_user;
    //         user_disk = json.user_disk;
    //         now_disk = json.now_disk;
    //         user_settop = json.user_settop;
    //         now_settop = json.now_settop;
    //         sum_user_disk = json.sum_user_disk;
    //         sum_user_settop = json.sum_user_settop;
    //         remain_disk = user_disk - now_disk;
    //         remain_settop = user_settop - now_settop;
    //         remain_user_disk = user_disk - sum_user_disk;
    //         remain_user_settop = user_settop - sum_user_settop;

    //         // if(group_seq_now == "0103"){
    //         //     $('#btnInsertOpen').hide();
    //         // }
    //     },
    //     error: function(json){
    //         // alert(json.responseJSON.resultString)
    //     }
    // });

    // 사용자 추가 버튼, 검색창
    console.log($("#current_user_grade").val());
    if($("#current_user_grade").val() != "0101"){
        $("#btnInsertOpen").hide();
        $("#search_area").hide();
        $("#user_grade").attr("disabled",true);
        $(".out_title").text("탈퇴");
    }
    

    // LEFT MENU 적용
    $('#mn_user').attr({
        'class' : 'active'
    });
    $('#mn_user_admin').attr({
        'class' : 'active'
    });


    //**************************************사용자 메인 조회**********************************************

    // 메인 화면 전체 Tabel 조회 구문
    var dataList = $('#data_list').DataTable({
                    "lengthChange": false,
                    "searching": false,
                    "ordering": true,
                    "colReorder": true,
                    "info": false,
                    "autoWidth": true,
                    "processing": true,
                    // "serverSide": true,
                    "responsive": true,
                    ajax : {
                        "url"   : "/user/search",
                        "type"  : "POST",
                        "async" : "false"
                    },
                    "columns": [
                            { data: "row_cnt"},
                            { data: "user_nm"},
                            { data: "user_id"},
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        if(data.user_grade == '0102') return "<strong>사용자</strong>";
                                        else if(data.user_grade == '0101') return "<strong>관리자</strong>";
                                }
                            },
                            { data: "user_office"},
                            { data: "user_dept_nm"},
                            { data: "user_point"},
                            { data: "use_yn"}, 
                            {
                                data:  null,
                                render: function(data, type, full, meta){
                                        return "<button title='유저정보 상세보기' class=' btn_point "+
                                         "' value="+data.user_id+
                                         " user_nm="+data.user_nm +" user_grade="+data.user_grade+" use_yn="+data.use_yn+ " user_office="+data.user_office+","+data.user_dept_nm+
                                         ","+ data.user_dept_charge +
                                         " user_phone="+ data.user_phone + " user_birth="+data.user_birth +
                                         " user_point="+data.user_point +" create_date="+data.create_date+ " type = 'detail'"+
                                         "  data-toggle='modal'>상세보기</button>";
                                }
                            }
                    ],
                    "columnDefs": [
                        { orderable: false, targets: 0 },
                      
                        {"className": "text-center", "targets": "_all"}
                    ],
                    "rowCallback": function( row, data, iDisplayIndex ) {


                    },
                    
                    "paging": true,
                    "pageLength": 10,
                    "language": {
                      "zeroRecords": "데이터가 존재하지 않습니다."
                    },
                    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                         "<'row'<'col-sm-12'tr>>" +
                         "<'row'<'col-sm-12'p>>"
    });

    //************************************ID,PW 한글 입력 막기***************************

    $("#user_pwd,#user_conf_pwd").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#user_disk, #user_settop").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });


    $("#user_phone").keyup(function(e) {
      var regex = /^[0-9]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^0-9]+/, '');
    });

    $("#user_id, #user_disk, #user_settop").keyup(function(e) {
        var regex = /^[A-Za-z0-9_@.]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^A-Za-z0-9_@.]+/, '');
    });

    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){

        var params = ""

        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();

        //상세구분 체크
        if(schType == "user_id"){
            if(schTxt != ""){
                params += "?user_id="+schTxt;
            }
        }else if(schType == "user_nm"){
            if(schTxt != ""){
                params += "?user_nm="+schTxt;
            }
        }else if(schType == "user_grade"){
            if(schTxt != ""){
                if(schTxt == "일반사용자"){
                    schTxt = "0103";
                }
                if(schTxt == "관리자"){
                    schTxt = "0102";
                }
                params += "?user_grade="+schTxt;
            }
        }

        console.log("User search = ["+params+"]")

        dataList.ajax.url("/user/search"+params).load();
    });

    //************************************사용자 등록 팝업 open 시작***************************
    $("#btnInsertOpen").click(function() {
        userGradeSearch("0100","user_grade",'');
        reset_pop_up(); // input 초기화
        $("#duplicate_check").show();
        $("#duplicate_check").attr('checking', 'N');
        $(this).attr("data-target","#modalInsert");
        $("#btnRegister").show();
        $("#btnUpdate").hide();
        $("#btnDelete").hide();
        $("#modalTitle").text("사용자 등록");
        $("#user_conf_pwd").parent().css("display",'inline-block');
    });

    //****************************************************사용자 상세조회******************************************

    $('#data_list tbody').on('click', 'button', function () {
        reset_pop_up();                             // input 초기화
        $("#duplicate_check").hide();
        $("#btnDelete").show();

        if($(this).attr("type") == "detail"){
            var user_nm = $(this).attr('user_nm');
            var user_id = $(this).val();
            var user_grade = $(this).attr('user_grade');
            var use_yn = $(this).attr("use_yn");
            var user_office = $(this).attr("user_office");
            var user_phone = $(this).attr("user_phone");
            var user_birth = $(this).attr("user_birth");
          

            // 팝업열기
            $(this).attr("data-target","#modalInsert")
            
            $("#modalTitle").text("사용자 정보 수정");

            // $("#user_pwd").parent().css("display",'none');
            // $("#user_conf_pwd").parent().css("display",'none');

            $("#btnRegister").hide();
            $("#btnUpdate").show();

            $("#user_id").attr("readonly",true);
            $("#user_id").val(user_id);
            $("#user_nm").val(user_nm);

            $("#user_phone").val(user_phone);
            $("#user_birth").val(user_birth);

            $("#user_office").val(user_office.split(',')[0]);
            $("#user_dept_nm").val(user_office.split(',')[1]);
            $("#user_dept_charge").val(user_office.split(',')[2]);

            userGradeSearch("0100", "user_grade", user_grade);
        }
    });

    //************************************ 사용자 등록 및 수정 버튼 클릭 *******************************************
    $("#btnRegister, #btnUpdate").click(function(){
        var url = "";
        var method = "";


        if($(this).attr('id') == "btnRegister")
        {
            url = "/user/insert";
            method = "POST";
            if($("#duplicate_check").attr('checking') == "N"){
                alert("아이디 중복체크를 해주세요")
                return;
            }
            
        }else{
            var user_id_set = $("#user_id").val();
            method="PUT";
            url = "/user/update/"+user_id_set;
        }

        var userNm = $("#user_nm").val();
        var userId = $("#user_id").val();
        var userPwd = $("#user_pwd").val();
        var userConfPwd = $("#user_conf_pwd").val();
        var userPhone = $("#user_phone").val();
        var userBirth = $("#user_birth").val();
        var userOffice = $("#user_office").val();
        var userDeptNm = $("#user_dept_nm").val();
        var userDeptCharge = $("#user_dept_charge").val();
        var usergrade = $("#user_grade").val()
        console.log(usergrade);
        
        var num_pwd = userPwd.search(/[0-9]/g);
        var eng_pwd = userPwd.search(/[a-z]/ig);
        var spe_pwd = userPwd.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
        
        // 글자 수 유효성 체크
        if(userNm.length > 10){
            alert("사용자 이름은 10자 이내로 제한됩니다.");
            $("input[name=user_nm]").focus();
            return;
        }
        if(userId.length > 20){
            alert("사용자 ID는 20자 이내로 제한됩니다.");
            $("input[name=user_id]").focus();
            return;
        }
        if(userOffice.length > 10){
            alert("회사명은 10자 이내로 제한됩니다.");
            $("input[name=user_office]").focus();
            return;
        }
        if(userDeptNm.length > 10){
            alert("부서명은 10자 이내로 제한됩니다.");
            $("input[name=user_dept_nm]").focus();
            return;
        }
        if(userDeptCharge.length > 10){
            alert("담당업무는 10자 이내로 제한됩니다.");
            $("input[name=user_dept_charge]").focus();
            return;
        }


        // 전체 유효성 검사
        if(userNm == ""){
            alert("사용자 이름을 입력하세요.");
            return;
        }else if(userId == ""){
            alert("사용자 ID를 입력하세요");
            return;
        }else if(userPwd == ""){
            alert("비밀번호를 입력 하세요");
            return;
        }else if(num_pwd < 0 || eng_pwd < 0 || spe_pwd < 0 ){
            alert("영문, 숫자, 특수문자를 혼합하여 입력해주세요.");
            $("input[name=user_pwd").focus();
            return;
        }else if(userPhone == ""){
            alert("핸드폰 번호를 입력 하세요");
            return;
        }else if(userBirth == ""){
            alert("생년월일을 입력 하세요");
            return;
        }
        if(usergrade == "all"){
            alert("사용자 등급을 선택해주세요.");
            return;
        }

        if(userPwd != userConfPwd){
            alert("두 비밀번호가 일치하지 않습니다.");
            $("#user_conf_pwd").val("")
            $("#user_conf_pwd").focus();
            return;
        }

        // 입력 사항 적용
        var pattern_num = /[0-9]/;	// 숫자
    	var pattern_eng = /[a-zA-Z]/;	// 문자
    	var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
    	var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

        // ADMIN 아닐때 고정.
        if($("#current_user_grade").val() != "0101"){
            $("#user_grade").attr("disabled",false);
        }
        var form_data = new FormData($('#formUser')[0]);

        $.ajax({
            url : url,
            data : form_data,
            type : method,
            contentType : false,
            processData : false,
            error:function(){
               alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {

                alert(data.resultString);

                if(data.resultCode == "100"){
                    // 아이디 중복 체크
                    $("#user_id").val("");
                    $("#user_id").focus();
                    return

                }else if(data.resultString == "200"){
                    // 수정시 패스워드 오류
                    $("#user_pwd").val("");
                    $("#user_pwd").focus();
                    return
                } else if(data.resultString == "0"){
                    if($(this).attr('id') == "btnRegister"){
                        welcome_emailsend(userId);
                    }
                }

                $("#btnSearch").click();
                $("#btnClose").click();
                
           }
        });

        // ADMIN 아닐때 고정.
        if($("#current_user_grade").val() != "0101"){
            $("#user_grade").attr("disabled",true);
        }
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
        
        //테이블 안의 라인 차트 넓이값 넣어 주기
        tblChartSet();
        function tblChartSet(){
            //값을 계산해서 넣어 주세요.
            var lineChartW = '50px'
            $('#chartSpace01').css('width',lineChartW)
            $('#chartSpace02').css('width',lineChartW);
            $('#chartSpace03').css('width',lineChartW);
        }

    });

    // 사용자 중복체크
    $("#duplicate_check").click(function() {
        var check_id = $("#user_id").val();
        if(email_check(check_id)){
            $.ajax({
                type: "GET",
                url: "/user/duplicate_check/"+check_id, 
                success : function(json) {
                    if(json.result){
                        alert("이미 등록된 아이디입니다.")
                        $("#user_id").val("");
                        $("#user_id").focus();
                    }else{
                        var result = confirm("사용가능한 아이디입니다. 사용하시겠습니까?")
                        if(result){
                            $("#user_id").attr("readonly",true);
                            $("#duplicate_check").attr('checking', 'Y');
                        }else{
                            $("#user_id").val("");
                            $("#user_id").attr("readonly",false);
                            $("#user_id").focus();
                            $("#duplicate_check").attr('checking', 'N');
                        }
                    }
                },
                error: function(json){
                    alert("중복체크 오류")
                }
            });
        }else if(check_id.length == 0){
            alert("아이디를 입력해주세요.");
            $("#user_id").focus();
            return;
        }else{
            alert("이메일 형식이 아닙니다.");
            $("#user_id").focus();
            return;
        }
    });


    // 회원탈퇴 **************************************
    $("#btnDelete").on('click', function(){
        $('#modalout').modal('show');
    });

    $("#btn_out").on('click', function(){
        if($("#current_user_grade").val() != "0101"){
            var delete_msg = "탈퇴";
            var type = "use";
        } else {
            var delete_msg = "삭제";
            var type = "delete"
        }
        if($("#isout").is(":checked")){
            var result = confirm("정말 "+delete_msg+"하시겠습니까?");
            if(result){
                var out_user_id = $("#user_id").val();
                $.ajax({
                    type: "DELETE",
                    url: "/user/delete/"+out_user_id+"/"+type,
                    success : function(json) {
           
                        alert("회원 "+delete_msg+" 되었습니다.")

                        $("#btnClose1").click();
                        $("#btnClose").click();
                        if($("#current_user_grade").val() != "0101"){
                            out_emailsend(out_user_id);
                            window.location.href = "/";
                        } else {
                            $('#btnSearch').click();
                        }
                    },
                    error: function(json){
                        alert(json.responseJSON.resultString)
                    }
               });
            }
        } else {
            alert(delete_msg+" 동의에 체크하여야 "+delete_msg+"하실 수 있습니다.")
        }
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
    $("#user_grade").attr("disabled",false);
    $("#iParking_seq").attr("disabled",false);
    $("#user_grade").val("all");
    $("#user_dept_nm").attr("disabled",false);
    $("#user_count").val(0);
    $("#user_disk").val(0);
    $("#user_settop").val(0);
    
    $("#modalInsert").modal('hide');
};



var user_yn_fuc = function () {

    user_nm = $("#user_nm").val()

    if(!confirm(user_nm + " 사용자를 " +btn_nm + "으로 변경 하시겠습니까?")){return;}
    user_id = $("#user_id_set").val();

    $.ajax({
         type: "DELETE",
         url: "/user/delete/"+user_id,
         success : function(json) {

             alert(json.resultString)
             $("#btnClose").click();
             $("#btnSearch").click();
         },
         error: function(json){
             alert(json.responseJSON.resultString)
         }
    });
};

// var user_id_find = function () {

//     $.ajax({
//         type: "GET",
//         url: "/user/search?user_grade=0000",
//         success : function(json) {

//             user_id_now = json.resultUserid
//             alert(user_id_now)
//         },
//         error: function(json){
//             alert(json.responseJSON.resultString)
//         }
//     });
// };

function checkNumber(event) {
  if(event.key >= 0 && event.key <= 9) {
    return true;
  }
  return false;
}

function reset_pop_up(){
    $("#user_nm").val('');
    $("#user_id").val('');
    $("#user_pwd").val('');
    $("#user_conf_pwd").val('');
    $("#user_phone").val('');
    $("#user_birth").val('');
    $("#user_office").val('');
    $("#user_dept_nm").val('');
    $("#user_dept_charge").val('');
}

//이메일 정규식 체크
function email_check(email) {

	var reg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

	return reg.test(email);

}



function welcome_emailsend(useremail){
    var today = new Date();   
    var year = today.getFullYear(); // 년도
    var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
    var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);

    var selectday = year+'-'+month+'-'+date;


    var contents = "";

    contents += "<html>";
    contents += "   <body>";
    contents += "        <div id='top_div' style='height: 500px; width:  500px; position: relative; margin: 0 auto; text-align: center; border: solid 0.5px black; padding-top: 30px;'>";
    contents += "            <div>";
    contents += "                <div id='title' style='display:block; text-align: center; margin-bottom: 60px;'>";
    contents += "                    <h2>AI Fields 회원가입이 완료되었습니다.</h2>";
    contents += "                </div>";
    contents += "                <div id='semi_title' style='display :block; text-align: center; margin-bottom: 40px;'>";
    contents += "                    <h3>로그인 후 이용해 주세요.</h3>";
    contents += "                </div>";

    contents += "                <div id='contents' style='display :block; text-align: center; margin-bottom: 40px;'>";
    contents += "                    <h5>✔  아이디 : "+useremail;
    contents += "                        <br/><br/>✔  회원가입일 : "+selectday;
    contents += "                    </h5>";
    contents += "                </div>";

    contents += "                <div id='button' style='display :block; text-align: center;'>";
    contents += "                    <a  id='link_btn' style='height: 50px; width:250px; background: #4F71BE; border: solid 1.5px black; padding: 15px;' href='http://aifields.teixon.com:5100/'>";
    contents += "                    <span style='color: #fff; margin: 0; font-weight: bold;'>AI Fields 바로가기</span></a>";
    contents += "                    </button>";
    contents += "                </div>";
    contents += "            </div>";
    contents += "            <div id='footer' style='height: 90px; width:  460px; position: relative; background-color: lightgray; top: 90px; padding: 20px;'>";
    contents += "                <h6>본 메일은 발신전용 메일이므로 회신이 되지 않습니다.";
    contents += "                <br/>";
    contents += "                <br/>㈜테이슨 | 02-468-1197 | support@teixon.com | 사업자번호 1108604781";
    contents += "                <br/>#402, 14, Seongsui-ro 10-gil, Seongdong-gu, Seoul Korea";
    contents += "                <br/>";
    contents += "                <br/>Copyright © TEIXON Co. Ltd 2021. All Rights Reserved.";
    contents += "                </h6>";
    contents += "            </div>";
    contents += "        </div>";
    contents += "    </body>";

    contents += "    </html>";






    var form_data = new FormData();
    form_data.append("email", useremail)
    form_data.append("title", "[AI Fields]회원가입이 완료되었습니다")
    form_data.append("contents", contents)
    $.ajax({
        url : "/notify",
        data : form_data,
        type : "POST",
        async : false,
        contentType : false,
        processData : false,
        error:function(e){
            console.log(e)
        },
        success:function(data) {
            console.log(data)
        }
    });
};


function out_emailsend(useremail){
    var today = new Date();   
    var year = today.getFullYear(); // 년도
    var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
    var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);

    var selectday = year+'-'+month+'-'+date;


    var contents = "";

    contents += "<html>";
    contents += "   <body>";
    contents += "        <div id='top_div' style='height: 500px; width:  500px; position: relative; margin: 0 auto; text-align: center; border: solid 0.5px black; padding-top: 30px;'>";
    contents += "            <div>";
    contents += "                <div id='title' style='display:block; text-align: center; margin-bottom: 60px;'>";
    contents += "                    <h2>AI Fields 회원탈퇴가 완료되었습니다.</h2>";
    contents += "                </div>";
    contents += "                <div id='semi_title' style='display :block; text-align: center; margin-bottom: 40px;'>";
    contents += "                    <h3>그동안 이용해 주셔서 감사합니다.</h3>";
    contents += "                </div>";

    contents += "                <div id='contents' style='display :block; text-align: center; margin-bottom: 40px;'>";
    contents += "                    <h5>✔  아이디 : "+useremail;
    contents += "                        <br/><br/>✔  회원탈퇴일 : "+selectday;
    contents += "                    </h5>";
    contents += "                </div>";

    contents += "                <div id='button' style='display :block; text-align: center;'>";
    // contents += "                    <a  id='link_btn' style='height: 50px; width:250px; background: #4F71BE; border: solid 1.5px black; padding: 15px;' href='http://aifields.teixon.com:5100/'>";
    // contents += "                    <span style='color: #fff; margin: 0; font-weight: bold;'>AI Fields 바로가기</span></a>";
    // contents += "                    </button>";
    contents += "                </div>";
    contents += "            </div>";
    contents += "            <div id='footer' style='height: 90px; width:  460px; position: relative; background-color: lightgray; top: 90px; padding: 20px;'>";
    contents += "                <h6>본 메일은 발신전용 메일이므로 회신이 되지 않습니다.";
    contents += "                <br/>";
    contents += "                <br/>㈜테이슨 | 02-468-1197 | support@teixon.com | 사업자번호 1108604781";
    contents += "                <br/>#402, 14, Seongsui-ro 10-gil, Seongdong-gu, Seoul Korea";
    contents += "                <br/>";
    contents += "                <br/>Copyright © TEIXON Co. Ltd 2021. All Rights Reserved.";
    contents += "                </h6>";
    contents += "            </div>";
    contents += "        </div>";
    contents += "    </body>";

    contents += "    </html>";






    var form_data = new FormData();
    form_data.append("email", useremail)
    form_data.append("title", "[AI Fields]회원탈퇴가 완료되었습니다")
    form_data.append("contents", contents)
    $.ajax({
        url : "/notify",
        data : form_data,
        type : "POST",
        async : false,
        contentType : false,
        processData : false,
        error:function(e){
            console.log(e)
        },
        success:function(data) {
            console.log(data)
        }
    });
};