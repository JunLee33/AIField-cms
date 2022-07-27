// Dashboard.js
// Created by WAVIEW.co.kr 
// Date : 2021.05.11

var Dataset = "";
var startday = "";
var endday = "";

$(function(){
    // 명시적으로 등급 이동.
    if($("#current_user_grade").val() == '0101'){
        window.location.href = '/user';
    }

    // 7일전 가져오기
    getToday();
    console.log(startday);
    console.log(endday);

    // 최상단 total TABLE
    $.ajax({
        type: "GET",
        url: "/dashboard/search", 
        success : function(json) {
            console.log(json.data);
            $("#total_workspace").text(json.data.workspace_total+"건")
            $("#total_content").text(json.data.contents_total+"건")
            $("#total_disk").text((json.data.disk_total/1024).toFixed(2)+"GB")
            $("#total_themamap").text(json.data.themamap_total+"건")
        },
        error: function(json){
            alert("중복체크 오류")
        }
    });


    // dashboard_list
    var dashboard_list = $('#dashboard_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        "responsive": true,
        "columnDefs": [
            {"className": "text-center", "targets": "_all"}
        ],        
        "paging": false,
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });

    // themamap_D7_list
    var themamap_D7_list = $('#themamap_D7_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/themamap/search?start_date="+startday+"&end_date="+endday,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
            {data : "create_date"},
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
            {data : "workspace_nm"},
        ],
        "columnDefs": [
            {"className": "text-center", "targets": "_all"}
        ],        
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        "paging": true,
        initComplete: function () {
            $("#themamap_D7_list_paginate").css("display", "none");
        },
        "pageLength": 5,
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });

    // contents_D7_list
    var contents_D7_list = $('#contents_D7_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/content/search?start_date="+startday+"&end_date="+endday,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
            { data: "create_date"},
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
            { data: "workspace_nm"},
        ],
        "columnDefs": [
            {"className": "text-center", "targets": "_all"}
        ],        
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        "paging": true,
        initComplete: function () {
            $("#contents_D7_list_paginate").css("display", "none");
        },
        "pageLength": 5,
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });

    // workspace_D7_list
    var workspace_D7_list = $('#workspace_D7_list').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "colReorder": false,
        "info": false,
        "autoWidth": true,
        "processing": true,
        // "serverSide": true,
        "responsive": true,
        ajax : {
            "url": "/workspace/search?start_date="+startday+"&end_date="+endday,
            "type":"POST",
            "async" :"false"
        },
        "columns": [
            { data: "workspace_id"},
            { data: "workspace_nm"},
            { data: "workspace_cmt"},
            { data: "create_date"},
        ],
        "columnDefs": [
            {"className": "text-center", "targets": "_all"}
        ],        
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다."
        },
        "paging": true,
        initComplete: function () {
            $("#workspace_D7_list_paginate").css("display", "none");
        },
        "pageLength": 5,
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>"
    });

    // MENU 적용
    $('#mn_dashboard').attr({
        'class' : 'active',
    });


});		 


var getToday = function(){

    var date = new Date()
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var dt = date.getDate();

    // 일주일 전 구하기
    var lastweek = new Date(year, month-1, dt - 7)
    var lastweekyear = lastweek.getFullYear(); // 년
    var lastweekmonth = lastweek.getMonth()+1;   // 월
    var lastweekday = lastweek.getDate();      // 일

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }

    if (lastweekday < 10) {
        lastweekday = '0' + lastweekday;
    }
    if (lastweekmonth < 10) {
        lastweekmonth = '0' +lastweekmonth;
    }

    endday = year+'-' + month + '-'+dt
    startday = lastweekyear+'-' + lastweekmonth + '-'+lastweekday
}