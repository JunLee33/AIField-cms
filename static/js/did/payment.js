// payment.js

var IMP ;

$(function() {

    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() == '0101'){
        window.location.href = '/payment/admin';
    }

    // MENU 적용
    $('#mn_payment').attr({
        'class' : 'active'
    });
    // MENU 적용
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


    // 결제 모듈 오픈 버튼
    // $("#btn_payment01").click(function() {
    //     $('#modalPoint').modal('hide');
    //     $("#modalPayment").modal('show');
    // });

    console.log("payment_js",$("#current_user_grade").val())

    var param = "";
    var user_grade = $("#current_user_grade").val();
    var user_id = $("#current_user_id").val();

    if(user_grade == "0102"){
        param = "?user_id="+$("#current_user_id").val();
    }

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
            "url": "/payment/search"+param,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                { data: "create_date"},
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
            "url": "/payment/point/search"+param,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                { data: "create_date"},
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
                        
                        var result_string = "";
                        if(data.point_type == "0503"){
                            point_cash = point_cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            result_string = "<strong>"+point_cash+"GB</strong>";
                        } else if(data.point_type == "0504"){
                            point_cash = point_cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

});


