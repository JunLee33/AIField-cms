// payment.js

var IMP ;

$(function() {
    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() != '0101'){
        window.location.href = '/payment';
    }

    // MENU 적용
    $('#mn_payment').attr({
        'class' : 'active'
    });
    $('#mn_payment_admin').attr({
        'class' : 'active'
    });

    $("#use_point").on('click', function(){
        $("#payment_cash").removeClass("active");
        $("#use_point").addClass("active");
        $("#payment_list_div").hide();
        $("#point_list_div").show();
    });

    $("#payment_cash").on('click', function(){
        $("#payment_cash").addClass("active");
        $("#use_point").removeClass("active");
        $("#payment_list_div").show();
        $("#point_list_div").hide();
    });

    var dataList = $('#payment_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "destroy": true,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/payment/search",
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                { data: "create_date"},
                { data: "user_id"},
                { data: "user_nm"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var result_string = "";
                        if(data.payment_type == "0302"){
                            result_string = "<strong>충전결제</strong>";
                        } else if(data.payment_type == "0402"){
                            result_string = "<strong>결제취소</strong>";
                        }
                        return result_string;
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var payment_cash = data.payment_point;
                        console.log(payment_cash);
                        payment_cash = payment_cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                        if(data.payment_type == "0302"){
                            return "<strong>"+payment_cash+"원</strong>";;
                        } else if(data.payment_type == "0402"){
                            return "<strong>("+payment_cash+"원)</strong>";;
                        }
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var cash_point = parseInt(data.payment_point);
                        if(data.payment_type == "0302"){
                            return "<strong>"+cash_point/100+"P</strong>";;
                        } else if(data.payment_type == "0402"){
                            return "<strong>("+cash_point/100+"P)</strong>";;
                        }
                        
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var btn_text = ""
                        if(data.payment_type == "0302"){
                            return "<button class='btn_point' type='detail' data-toggle='modal' onclick='payment_cancle(\""+data.payment_no+"\")'>결제취소</button>";
                        } else {
                            return "<strong>"+btn_text+"</strong>"; 
                        }
                        
                    }
                }
        ],
        "columnDefs": [
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

    var pointdataList = $('#point_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "destroy": true,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/payment/point/search",
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                { data: "create_date"},
                { data: "user_id"},
                { data: "user_nm"},
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var result_string = "";
                        if(data.point_type == "0503"){
                            result_string = "<strong>정사영상 업로드</strong>";
                        } else if(data.point_type == "0504"){
                            result_string = "<strong>주제도 검출</strong>";
                        }
                        return result_string;
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var point_cash = data.point_detail;
                        point_cash = point_cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        var result_string = "";
                        if(data.point_type == "0503"){
                            result_string = "<strong>"+point_cash+"GB</strong>";
                        } else if(data.point_type == "0504"){
                            result_string = "<strong>"+point_cash+"건</strong>";
                        }
                        return result_string;
                    }
                },
                {
                    data:  null,
                    render: function(data, type, full, meta){
                        var cash_point = parseInt(data.point_use);
                        return "<strong>"+cash_point+"P</strong>";;
                    }
                }
        ],
        "columnDefs": [
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
    


    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){

        var params = ""

        var schType = $("#schType").val();
        var schTxt  = $("#schTxt").val();
        var search_start = $("#search_start").val();
        var search_end  = $("#search_end").val();

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
        if(schType == "payment_id"){
            if(schTxt != ""){
                params += "?user_id="+schTxt;
                params += "&start_date="+search_start+"&end_date="+search_end;
            } else {
                params += "?start_date="+search_start+"&end_date="+search_end;

            }
        }else if(schType == "payment_nm"){
            if(schTxt != ""){
                params += "?user_nm="+schTxt;
                params += "&start_date="+search_start+"&end_date="+search_end;
            } else{
                params += "?start_date="+search_start+"&end_date="+search_end;
            }
        }
        

        console.log("Payment search = ["+params+"]")

        dataList.ajax.url("/payment/search"+params).load();
        pointdataList.ajax.url("/payment/point/search"+params).load();
    });

   

        //************************************ 검색 조건 초기화 ***************************
        $("#btnRefresh").click(function(){
            $("#schType").val("payment_nm");
            $("#schTxt").val('');
            $("#search_start").val('');
            $("#search_end").val('');
        });

});

function payment_cancle(payment_no){

    var result = confirm("결제건을 환불 요청하시겠습니까?");
    if(result){
        console.log(payment_no)

        var form_data = new FormData();
        
        form_data.append("payment_no",payment_no);

        $.ajax({
            url: "/payment/cancle",
            type: "POST",
            data : form_data,
            contentType : false,
            processData : false,
            error:function(e){
            alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            console.log(e);
            },
            success:function(data) {
                
                console.log(data);
                alert(data.resultString);
                if(data.resultCode == '0'){
                    paymentcancle_emailsend(data.user_id);
                }
            }
        });
    }
}





function paymentcancle_emailsend(useremail){
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
    contents += "                    <h2>AI Fields에서 환불한 내역을 안내드립니다.</h2>";
    contents += "                </div>";
    contents += "                <div id='semi_title' style='display :block; text-align: center; margin-bottom: 40px;'>";
    // contents += "                    <h3>그동안 이용해 주셔서 감사합니다.</h3>";
    contents += "                </div>";

    contents += "                <div id='contents' style='display :block; text-align: center; margin-bottom: 40px;'>";
    contents += "                    <h5>✔  아이디 : "+useremail;
    contents += "                        <br/><br/>✔  환불일시 : "+selectday;
    contents += "                        <br/><br/>✔  환불상품 : 캐시 충전 100P";
    contents += "                        <br/><br/>✔  환불금액 : 10,000원";
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
    form_data.append("title", "[AI Fields]환불한 내역을 안내드립니다")
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