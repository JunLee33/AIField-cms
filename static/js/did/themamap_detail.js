// themamap.js

var workspace_dataList;
var themamap_dataList;
var themamap_list ;

var now_themamap_id ; 
var now_workspace_id ; 
var seleted_contents = [];

var map, cont_layer, result_layer, storage_name, layers_name, result_name;

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
    now_themamap_id =    urlParams.get('themamap_id');
    now_workspace_id =    urlParams.get('workspace_id');
    var themamap_name =   urlParams.get('themamap_name');
    $("#subtitle").text(themamap_name);
    storage_name = "w"+now_workspace_id;

    // 현재 주제도에 속한 컨텐츠 가져오기
    $.ajax({
        url : '/themamap/cont/search',
        data : JSON.stringify({"themamap_id" : now_themamap_id}),
        contentType : "application/json",
        type: "POST",
        async : false,
        error:function(){
            console.log("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
        },
        success:function(data) {
            console.log(data.data);
            var themamap_detail = data.data;
            result_name = "J"+ themamap_detail[1].themamap_id;
            layers_name = themamap_detail[1].cont_org_nm;
        }
    });

    // 현장에 등록된 정사영상 리스트 가져오기
    $.ajax({
        url : '/content/search',
        data : JSON.stringify({"workspace_id" : now_workspace_id}),
        contentType : "application/json",
        type: "POST",
        async : false,
        error:function(){
            console.log("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
        },
        success:function(data) {
            console.log(data);
            var cont_list = data.data;
            for(i=0; i < cont_list.length; i++){
                var option_list = ''
                if(cont_list[i].cont_org_nm == layers_name){
                    option_list = "<option selected cont_orgnm = '"+cont_list[i].cont_org_nm+"'>"+cont_list[i].cont_nm+"</option>"
                } else{
                    option_list = "<option cont_orgnm = '"+cont_list[i].cont_org_nm+"'>"+cont_list[i].cont_nm+"</option>"
                }
                $('#cont_list').append(option_list)
            }
        }
    });

    map_box_init();



    //************************************** 정사영상 목록 조회**********************************************
    // contents list 
    themamap_list = $('#themamap_list').DataTable({
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
            "url": "/themamap/mapping?themamap_id="+now_themamap_id,
            "type":"POST",
            "async" :"false"
        },
        "columns": [

            //          select a.themamap_id, a.themamap_nm, a.user_id, to_char(a.create_date, 'YYYY-MM-DD') themamap_date, 
            //         b.cont_id, c.cont_nm, to_char(c.cont_date, 'YYYY-MM-DD') cont_date, , c.cont_size, to_char(c.create_date, 'YYYY-MM-DD') content_date 
                { data: "cont_id"},
                { data: "cont_nm"},
                { data: "cont_date"},
                {
                    data:  null,
                    render: function(data, type, full, meta){

                            $("#themamap_id").text(data.themamap_id);
                            $("#themamap_creat_date").text(data.themamap_date);
                            $("#themamap_user_id").text(data.user_id);
                            $("#themamap_name").val(data.themamap_nm);

                            // MB- > GB로 변경
                            var gb_data = parseFloat(data.cont_size) / 1024;
                            return "<strong>"+gb_data.toFixed(2)+" GB</strong>";
                    }
                },
                { data: "content_date"}
        ],
        "columnDefs": [
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


    //************************************ID,PW 한글 입력 막기***************************

    $("#user_pwd,#user_conf_pwd,#user_disk,#user_settop").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#user_id,#user_disk,#user_settop").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });

    $('#btndelete_tbl').on('click', function(){
        delete_seleted();
    });


    $("#btnupdate_tbl").on('click', function(){
        var new_name = $("#themamap_name").val();

        if(new_name.length == 0){
            alert("제목을 입력해주세요.")
        }

        $.ajax({
            url : '/themamap/update',
            data : JSON.stringify({"type" : "rename", "data" : { "themamap_id" :now_themamap_id,
            "name" :new_name}}),
            contentType : "application/json",
            type: "put",
            error:function(){
                console.log("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
            },
            success:function(data2) {
                alert(data2.resultString);
                window.location.reload();
            }
        });
    })

    // 결과파일 체크박스
    $("#remove_layer").on('change', function(){
        if($(this).is(':checked')){
             // geoserver에서 가져오는 wmsLayer를 설정합니다.
            result_layer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/'+storage_name+'/wms', {
                // var wmsLayer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/<저장소이름>/wms', {
                // layers: '<저장소:레이어이름>',
                    layers: storage_name+':'+result_name,
                    transparent: true,
                    format: 'image/png'
                }).addTo(map);
        }else{
            result_layer.remove()
        }
    })

    // 셀렉트박스 체인지
    $("#cont_list").on('change', function(){
        console.log($("#cont_list option:selected").attr('cont_orgnm'));
        $('#remove_layer').prop('checked', true);
        layers_name = $("#cont_list option:selected").attr('cont_orgnm');
        map.off();
        map.remove();
        map_box_init()
    })
});

function map_box_init(id){
    map = L.map('map', {
        center: [37.568,126.993035],
        zoom: 17
    });

    // mapbox로 지도의 베이스를 설정합니다.
    var mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
    var token = 'pk.eyJ1Ijoiamp1bjAzMzAiLCJhIjoiY2t3eWh6eGhxMGVmaTJ2cTMzczF0NTYxNSJ9.LRdxdrwGT21JGUXFjAyVyA';    // MAPBOX : API TOKEN
    var basemaps = L.tileLayer(mapboxUrl, {id: 'streets-v11', attribution: '', accessToken: token}).addTo(map);


    console.log(storage_name, layers_name)
    // storage_name = "changedetect"
    // layers_name = "paichai_21stbld_202204041143_transparent_mosaic_group1_tif"

    // geoserver에서 가져오는 wmsLayer를 설정합니다.
    cont_layer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/'+storage_name+'/wms', {
    // var wmsLayer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/<저장소이름>/wms', {
    // layers: '<저장소:레이어이름>',
        layers: storage_name+':'+layers_name,
        transparent: true,
        format: 'image/png'
    }).addTo(map);

    // geoserver에서 가져오는 wmsLayer를 설정합니다.
    result_layer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/'+storage_name+'/wms', {
    // var wmsLayer = L.tileLayer.wms('http://ect2.iptime.org:5999/geoserver/<저장소이름>/wms', {
    // layers: '<저장소:레이어이름>',
        layers: storage_name+':'+result_name,
        transparent: true,
        format: 'image/png'
    }).addTo(map);
    

    // WFS에 맞춰 map 센터! https://gis.stackexchange.com/questions/89321/get-bounding-box-of-wms
    function loadGeoJson(data) {
        var getcenter = data.split('<LatLonBoundingBox');
        console.log(getcenter[1]);

        getcenter = getcenter[1].split('/>');
        console.log(getcenter[0]);

        // minx="127.8786887823427" miny="35.28929398974584" maxx="127.90643559219838" maxy="35.311923102130066"
        var lat_lng = getcenter[0].split('"')
        
        const ne = { lng: parseFloat(lat_lng[1]), lat: parseFloat(lat_lng[3]) };
        const sw = { lng: parseFloat(lat_lng[5]), lat: parseFloat(lat_lng[7]) };
        console.log(ne, sw)
        
        map.fitBounds(L.latLngBounds(L.latLng(sw), L.latLng(ne)));
    };

    var geoJsonUrl ='http://ect2.iptime.org:5999/geoserver/'+storage_name+'/ows'; 
    var defaultParameters = {
        service: 'WMS',
        version: '1.0.0',
        request: 'GetCapabilities',
        typeName: storage_name+':'+layers_name,
    };

    var customParams = {
        bbox: map.getBounds().toBBoxString(),
    };

    var parameters = L.Util.extend(defaultParameters, customParams);
    $.ajax({
        url: geoJsonUrl + L.Util.getParamString(parameters),
        datatype: 'json',
        jsonCallback: 'getJson',
        async : false,
        success: loadGeoJson
    });
}


// 선택한 주제도 삭제
function delete_seleted(){
    var seleted_list = now_themamap_id;

    if(seleted_list.length !=0 ){
        var result = confirm("선택한 주제도를 삭제하시겠습니까?");
        if(result){

            // WORKSPACE ID 골라졌으면 간다 !!! 아니면 에외처리 !!
            var form_data = new FormData();
            form_data.append("themamap_id", seleted_list);
            var method = "delete";
            var url = "/themamap/delete/"+seleted_list;
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
                    console.log(data);

                    for(var i =0; i< data.themamap_id_list.length; i++){
                        
                        var delete_job_id = data.themamap_id_list[i];

                        var url = "http://ect2.iptime.org:18020/apis/v1"
                        var method = "POST"
                        var api_data = {
                            "cmd" : "job_delete",
                            "reqobj" : 
                            {
                                "job_id": delete_job_id,
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
                    window.history.back();
                }
            });

        }
    }
}

