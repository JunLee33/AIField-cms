// themamap.js

var workspace_dataList;
var themamap_dataList;
var cont_dataList ;
var selected_dataList;

var now_workspaceID ; 
var seleted_contents = [];


$(function() {
    
    // MENU 적용
    $('#mn_service').attr({
        'class' : 'active'
    });

    //************************************ 주제도 등록 버튼 클릭 *******************************************
    $("#btn_sendemail").click(function(){
        var user_name = $("#user_name").val();
        var user_email = $("#user_email").val();
        var email_title = $("#email_title").val();
        var email_text = $("#email_text").val();
        var type1 = $("#type1").is(":checked");
        var type2 = $("#type2").is(":checked");
        var type3 = $("#type3").is(":checked");
        var service_agree = $("#service_agree").is(":checked");
        
        console.log(email_text);

        if(user_name.length < 1){
            alert("이름을 입력해주세요.");
            return;
        }

        if(user_email.length < 1){
            alert("이메일을 입력해주세요.");
            return;
        }

        if(email_title.length < 1){
            alert("제목을 입력해주세요.");
            return;
        }
        if(email_text.length < 1){
            alert("내용을 입력해주세요.");
            return;
        }
        
        var sevice_type = "";
        if(!type1 && !type2 && !type3){
            alert("문의 유형을 선택해주세요.");
            return;
        } else if(type1 && !type2 && !type3){
            sevice_type = "이용불편 및 개선";
        } else if(!type1 && type2 && !type3){
            sevice_type = "환불 및 요금정책";
        } else if(!type1 && !type2 && type3){
            sevice_type = "기타";
        }

        if(!service_agree){
            alert("약관에 동의해주세요.");
            return;
        }

        var today = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');

        var selectday = today;

        var contents = "";

        contents += "<html>";
        contents += "   <body>";
        contents += "        <div id='top_div' style='min-height: 500px; height: fit-content; width:  500px; position: relative; margin: 0 auto; text-align: center; border: solid 0.5px black; padding-top: 30px;'>";
        contents += "            <div>";
        contents += "                <div id='title' style='display:block; text-align: center; margin-bottom: 60px;'>";
        contents += "                    <h2>AI Fields ["+sevice_type+"] 문의 확인 메일입니다.</h2>";
        contents += "                </div>";
        contents += "                <div id='semi_title' style='display :block; text-align: center; margin-bottom: 40px;'>";
        contents += "                    <h3>["+sevice_type+"] 문의 확인 메일입니다.</h3>";
        contents += "                        <br/><br/>아래 내역을 확인 하시고 담당자께서는 답변 및 처리 부탁드립니다.";
        contents += "                   </h3>";
        contents += "                </div>";

        contents += "                <div id='contents' style='display :block; text-align: center; margin-bottom: 40px;'>";
        contents += "                    <h5>✔  신청일 : "+selectday;
        contents += "                        <br/><br/>✔  문의유형 : "+sevice_type;
        contents += "                        <br/><br/>✔  이름 : "+ user_name;
        contents += "                        <br/><br/>✔  E-mail : "+user_email;
        contents += "                        <br/><br/>✔  제목 : "+email_title;
        contents += "                        <br/><br/>✔  내용 : "+email_text;
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

        $("#spinner_wrap").css('display','flex');

        var form_data = new FormData();
        form_data.append("email", 'support@teixon.com')
        form_data.append("title", "[AI Fields]문의 사항")
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
                alert("메일 전송 오류입니다. 다시 시도해주세요.")
                $("#spinner_wrap").css('display','none');
            },
            success:function(data) {
                console.log(data)
                $("#spinner_wrap").css('display','none');
                alert(data.resultString)
            }
        });
    });
});