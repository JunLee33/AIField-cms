$(function() {
    $("#spinner_wrap").css('display','flex');

    // 팝업 DATE PICKER
    $('#adduser_birth').datepicker({
        autoclose: true
        ,format: 'yyyy-mm-dd'
        ,language: "kr"
        ,calendarWeeks: false
        ,todayHighlight: true
        ,showInputs: false
    });

    //************************************ID,PW 한글 입력 막기***************************

    $("#adduser_pwd,#adduser_conf_pwd").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#adduser_disk, #adduser_settop").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });


    $("#adduser_phone, #user_phone_verify").keyup(function(e) {
      var regex = /^[0-9]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^0-9]+/, '');
    });

    $("#adduser_id, #adduser_disk, #adduser_settop, #user_id_verify").keyup(function(e) {
        var regex = /^[A-Za-z0-9_@.]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^A-Za-z0-9_@.]+/, '');
    });



    $("#addbtnRegister").click(function(){
        var url = "";
        var method = "";

        if($(this).attr('id') == "addbtnRegister")
        {
            url = "/user/insert";
            method = "POST";
            if($("#addduplicate_check").attr('checking') == "N"){
                alert("아이디 중복체크를 해주세요")
                return;
            }
        }

        var userNm = $("#adduser_nm").val();
        var userId = $("#adduser_id").val();
        var userPwd = $("#adduser_pwd").val();
        var userConfPwd = $("#adduser_conf_pwd").val();
        var userPhone = $("#adduser_phone").val();
        var userBirth = $("#adduser_birth").val();
        var userOffice = $("#adduser_office").val();
        var userDeptNm = $("#adduser_dept_nm").val();
        var userDeptCharge = $("#adduser_dept_charge").val();
        var usergrade = "0102"
        $("#adduser_grade").val(usergrade);
        
        var num_pwd = userPwd.search(/[0-9]/g);
        var eng_pwd = userPwd.search(/[a-z]/ig);
        var spe_pwd = userPwd.search(/[`~!@@#add$%^&*|₩₩₩'₩";:₩/?]/gi);
        
        // 글자 수 유효성 체크
        if(userNm.length > 10){
            alert("사용자 이름은 10자 이내로 제한됩니다.");
            return;
        }
        if(userId.length > 20){
            alert("사용자 ID는 20자 이내로 제한됩니다.");
            return;
        }
        if(userOffice.length > 10){
            alert("회사명은 10자 이내로 제한됩니다.");
            return;
        }
        if(userDeptNm.length > 10){
            alert("부서명은 10자 이내로 제한됩니다.");
            return;
        }
        if(userDeptCharge.length > 10){
            alert("담당업무는 10자 이내로 제한됩니다.");
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
            $("#adduser_conf_pwd").val("")
            return;
        }

        // 입력 사항 적용
        var pattern_num = /[0-9]/;	// 숫자
        var pattern_eng = /[a-zA-Z]/;	// 문자
        var pattern_spc = /[~!@#add$%^&*()_+|<>?:{}]/; // 특수문자
        var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

        var form_data = new FormData($('#addformUser')[0]);

        $.ajax({
            url : url,
            data : form_data,
            type : method,
            contentType : false,
            processData : false,
            error:function(e){
                console.log(e)
                alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data) {
                console.log(data)
                alert(data.resultString);

                if(data.resultCode == "100"){
                    // 아이디 중복 체크
                    $("#adduser_id").val("");
                    return

                }else if(data.resultCode == "200"){
                    // 수정시 패스워드 오류
                    $("#adduser_pwd").val("");
                    return
                } else if(data.resultCode == "0"){
                    welcome_emailsend(userId);
                }

                $("#addbtnClose").click();
        }
        });

    });


    // 사용자 중복체크
    $("#addduplicate_check").click(function() {
        console.log("HELLO!")
        var check_id = $("#adduser_id").val();
        if(email_check(check_id)){
            $.ajax({
                type: "GET",
                url: "/user/duplicate_check/"+check_id, 
                success : function(json) {
                    if(json.result){
                        alert("이미 등록된 아이디입니다.")
                        $("#adduser_id").val("");
                    }else{
                        var result = confirm("사용가능한 아이디입니다. 사용하시겠습니까?")
                        if(result){
                            $("#adduser_id").attr("readonly",true);
                            $("#addduplicate_check").attr('checking', 'Y');
                        }else{
                            $("#adduser_id").val("");
                            $("#adduser_id").attr("readonly",false);
                            $("#addduplicate_check").attr('checking', 'N');
                        }
                    }
                },
                error: function(json){
                    alert("중복체크 오류")
                }
            });
        }else if(check_id.length == 0){
            alert("아이디를 입력해주세요.");
            return;
        }else{
            alert("이메일 형식이 아닙니다.");
            return;
        }
    });

});


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