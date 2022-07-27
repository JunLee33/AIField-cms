
/*
지역 레벨별 조회
====================
params
====================
* area_level    지역레벨 1: 레벨1 2: 레벨2
* area_cd       area_level 별 코드
* target        selectbox ID 명
* set_data      target에 데이터 바인딩 처리
* area_ord      공통제외 지역레벨1 >> 1설정
// 해당 selectbox 초기화 처리
areaSearch('','',target,'')
*/


var user_id_now = '';
var group_seq_now = '';
var user_id_verify = '';

// 등급별 메뉴 잠금
$.ajax({
    type: "GET",
    url: "/user/search?user_grade=0000",
    async : "false",
    success : function(json) {
        group_seq_now = json.resultUserGroup;
        console.log(group_seq_now)
        if(group_seq_now == "0101"){
            $("#menu02_1").show();
            $("#menu03_1").show();
            $("#menu04_1").show();
            $("#menu05_1").show();
            $('#menu06_1').show();
            $('#menu07').show();
            $("#menu09").show();
        } else {
            $("#menu01").show();
            $("#menu02").show();
            $("#menu03").show();
            $("#menu04").show();
            $("#menu05").show();
            $('#menu06').show();
            $('#menu07').show();
            $("#menu09").show();
        }
    },
    error: function(json){
        // alert("해당 유저를 불러오지 못했습니다")
    }
});

$(function() {

    console.log("CHECK", $("#current_user_grade").val())
    if($("#current_user_grade").val() == "0101"){
        $("#menu02_1").show();
        $("#menu03_1").show();
        $("#menu04_1").show();
        $("#menu05_1").show();
        $('#menu06_1').show();
        $('#menu07').show();
        $("#menu09").show();
    } else {
        $("#menu01").show();
        $("#menu02").show();
        $("#menu03").show();
        $("#menu04").show();
        $("#menu05").show();
        $('#menu06').show();
        $('#menu07').show();
        $("#menu09").show();
    }



    $("#user_id_verify").on("blur keyup", function() {
        $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    });

    $("#user_id_verify").keyup(function(e) {
      var regex = /^[a-zA-Z0-9@.]+$/;
      if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@.]+/, '');
    });
    //************************************ 비밀번호 찾기 버튼 클릭 *******************************************
    $("#btnVerify").click(function(){
        var url = "/user/find";
        var method = "POST";

        var userNm = $("#user_nm_verify").val();
        user_id_verify = $("#user_id_verify").val();
        var user_phone_verify = $("#user_phone_verify").val();

        if(user_id_verify == ""){
            alert("사용자 ID를 입력하세요");
            return;
        }else if(userNm == ""){
            alert("사용자 이름을 입력하세요.");
            return;
        }else if(user_phone_verify == ""){
            alert("핸드폰 번호를 입력해주세요");
            return;
        }
        var form_data = new FormData($('#formUser')[0]);

        $.ajax({
            url : url,
            data:form_data,
            type: method,
            contentType: false,
            processData: false,
            error:function(){
            
               alert("해당 정보와 일치하는 계정이 없습니다.");
            },
            success:function(data) {
                console.log(data);
                alert("ID: " + user_id_verify + "로 인증되었습니다. 비밀번호를 재설정하세요.")
                $("#btnClose1").click();
                $('#modalPwReset').modal('show');
           }
        });

    });

    //************************************ 비밀번호 재설정 버튼 클릭 *******************************************
    $("#btnReset").click(function(){
                    var url = "/user/resetPw/" + user_id_verify;
                    var method = "PUT";
                    var userPwd = $("#user_new_pwd").val();
                    var userConfPwd = $("#user_conf_pwd").val();
                    if(userPwd == ""){
                        alert("비밀번호를 입력 하세요");
                        return;
                    }else if(userPwd != userConfPwd){
                        alert("비밀번호를 다시 확인해주세요.");
                        return;
                    }

                    // 입력 사항 적용
                    var pattern_num = /[0-9]/;	// 숫자
                    var pattern_eng = /[a-zA-Z]/;	// 문자
                    var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
                    var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

                    if( (pattern_num.test(userPwd)) && (pattern_eng.test(userPwd)) && (pattern_spc.test(userPwd)) && !(pattern_kor.test(userPwd)) && userPwd.length> 8 ){

                    }else{
                        alert("(숫자,영문,특문)포함 8자 이상 비밀번호를 입력해 주세요")
                        return;
                    }

                    var form_data = new FormData($('#formPwReset')[0]);

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

                            alert(data.resultString);
                            user_id_verify = '';

                            $("#btnClose2").click();
                        }
                    });

                });




});

var closePopup = function(){
    $("#user_nm").attr("disabled",false);
    $("#user_nm").val("");
    $("#user_id_verify").attr("disabled",false);
    $("#user_id_verify").val("");
    $("#user_nm_verify").val("");
    $("#user_phone_verify").val("");
    $("#user_new_pwd").val("");
    $("#user_conf_pwd").val("");
    $("#user_dept_nm").attr("disabled",false);
    $("#user_dept_nm").val("");
    
    $("#modalPwFind").modal('hide');
};



var areaSearch = function(area_level, area_cd, target, set_data, area_ord){

    var $target = $('#'+target);

    // 레벨별 selectbox 초기화 시킨다.
    if(area_level == "" && area_cd == ""){

        var options = "<option value='' selected>선택하세요</option>";
        $target.html(options);

        return;
    }

    var params = "?area_level="+area_level;

    if(area_level == "2")
        params += "&area_cd="+area_cd

    //레벨지역1 공통 제외
    if(area_ord == "1")
        params += "&area_ord="+area_ord

    //검색구분 지역 대분류 조회
   $.ajax({
             type: "GET",
             url: "/area/level/search"+params,
             success : function(json) {


                var options = "<option value='' >선택하세요</option>";

                var areaList = JSON.parse(json.resultValue);

                for(var i = 0;i<areaList.length;i++){

                   if(set_data == areaList[i].area_cd){
                        options += "<option value='"+areaList[i].area_cd+"' selected>"+areaList[i].area_nm+"</option>";
                   }else{
                        options += "<option value='"+areaList[i].area_cd+"'>"+areaList[i].area_nm+"</option>";
                   }

                }
                $target.html(options);

             },
             error: function(){
                 alert("지역 조회시 에러 발생");
             }
          });
}







/*
사용자 그룹 셀렉트
*/
var userSearch = function(user_gr, target, set_data){

    var $target = $('#'+target);
    var params = "?user_grade="+user_gr;

    $.ajax({
             type: "GET",
             url: "/user/select/search"+params,
             success : function(json) {

                var userList = JSON.parse(json.data);

                var options = "<option value='all' selected>선택하세요</option>";

                for(var i = 0;i<userList.length;i++){

                   if(userList[i].user_id == set_data){
                        options += "<option value='"+userList[i].user_id+"' selected>"+userList[i].user_nm+" ("+userList[i].user_gr_nm+")</option>";
                   }else{
                        options += "<option value='"+userList[i].user_id+"'>"+userList[i].user_nm+" ("+userList[i].user_gr_nm+")</option>";
                   }
                }
                $target.html(options);
             },
             error: function(){
                 alert("상세 조회시 에러가 발생했습니다.");
             }
    });
}


/*
 사용자 등급
*/
var userGradeSearch = function(comm_up_cd, target, set_data){

    var $target = $('#'+target);
    var params = "?comm_up_cd="+comm_up_cd;
    $.ajax({
             type: "GET",
             url: "/code/applySearch"+params,
             success : function(json) {

                var applyList = JSON.parse(json.data);

                var options = "<option value='all'>사용자 등급을 선택해 주세요.</option>";


                for(var i = 0;i<applyList.length;i++){
                    // if(applyList[i].comm_cd !="0101"){
                    if(applyList[i].comm_cd == "0101"){
                        if(applyList[i].comm_cd == set_data){
                            options += "<option value='"+applyList[i].comm_cd+"' selected>관리자</option>";
                        }else{
                            options += "<option value='"+applyList[i].comm_cd+"'>"+applyList[i].comm_nm+"</option>";
                        }
                    } else { 
                        if(applyList[i].comm_cd == set_data){
                            options += "<option value='"+applyList[i].comm_cd+"' selected>"+applyList[i].comm_nm+"</option>";
                        }else{
                            options += "<option value='"+applyList[i].comm_cd+"'>"+applyList[i].comm_nm+"</option>";
                        }
                    }
                    // } else if(set_data == "0101"){
                    //     if(applyList[i].comm_cd == set_data){
                    //         options += "<option value='"+applyList[i].comm_cd+"' selected>"+applyList[i].comm_nm+"</option>";
                    //         }else{
                    //         options += "<option value='"+applyList[i].comm_cd+"'>"+applyList[i].comm_nm+"</option>";
                    //         }
                    // }

                }

                $target.html(options);
             },
             error: function(){
                 alert("상세 조회시 에러가 발생했습니다.");
             }
    });

}

/*
   그룹 이름가져오기
*/
var groupAllName = function(target){

    var $target = $('#'+target);
    $.ajax({
             type: "GET",
             url: "/group/search/list",
             success : function(json) {

                var groupList = JSON.parse(json.data);

                var options = "<option value='all'>그룹을 선택하세요.</option>";


                for(var i = 0;i<groupList.length;i++){
                    options += "<option value='"+groupList[i].group_seq+"'>"+groupList[i].group_nm+"</option>";
                }

                $target.html(options);
             },
             error: function(){
                 alert("상세 조회시 에러가 발생했습니다.");
             }
    });

}



//사용 유무 확인 변환 함수
var yOrN = function(data){
    var yorn = ''

    if(data == 'Y'){
        yorn = "사용"
    }else{
        yorn = "미사용"
    }
    return yorn;
}
//핸드폰 번호 변환 함수
var phoneNumber = function(data){
    var number = ''

    if(data.length < 11){
        number = data.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }else{
        number = data.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return number;
}

var loginPress = function(){

    if(event.keyCode == 13){
        login();
    }
}

var login = function(){

     var remember = $("#remember").is(":checked");
     var user_id = $("#user_id").val();
     var user_pwd = $("#user_pwd").val();

     if(user_id.trim() == ""){
        alert("아이디를 입력하세요");
        $("#user_id").focus();
        return;
     }

     if(user_pwd.trim() == ""){
        alert("패스워드를 입력하세요");
        $("#user_pwd").focus();
        return;
     }

    var form_data = new FormData($('#frmLogin')[0]);

    $.ajax({
          url : '/user/login',
          data:form_data,
          type: 'post',
          contentType: false,
          processData: false,
          success:function(data) {

            if(data.resultCode == "0"){

                location.href=data.next_url;

                if(remember){
                localStorage.setItem("user_id",user_id);
                }else{
                localStorage.removeItem("user_id");
                }
                document.cookie=("fold=Y");

            }else{
                alert(data.resultString)
                if(data.resultCode == "101")
                {
                  $("#modalInsert").modal('show');
                  $("#user_ide").val(user_id);
                }
            }
        }
    });
}


// 사용자 패스워드 변경시에 작동하는 패스워드 체크 로직 !! (ARNOLD 휴 ~~ 헤멤)
// $("#btnUpdate").click(function(){


//     var user_id = $("#user_ide").val();
//     var method="PUT";
//     var url = "/user/password/"+user_id;

//     var userPwd = $("#user_pwde").val()
//     var userConfPwd = $("#user_conf_pwd").val()

//     if(userPwd == ""){
//             alert("비밀번호를 입력 하세요");
//             $("input[name=user_pwd").focus();
//             return;
//     }else if(userPwd != userConfPwd){
//             alert("비밀번호가 서로 일치하지 않습니다..");
//             $("#user_conf_pwd").val("")
//             $("#user_conf_pwd").focus();
//             return;
//     }

//     // ARNOLD 반드시 해제하고 상용적용 해야 함. (ARNOLD)
//     var pattern_num = /[0-9]/;	// 숫자
//     var pattern_eng = /[a-zA-Z]/;	// 문자
//     var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자
//     var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글체크

//     if(user_id == 'admin')

//     if( (pattern_num.test(userPwd)) && (pattern_eng.test(userPwd)) && (pattern_spc.test(userPwd)) && !(pattern_kor.test(userPwd)) && userPwd.length>8 ){

//     }else{
//         alert("(숫자,영문,특문)포함 8자 이상 비밀번호를 입력해 주세요")
//         return;
//     }

//     var form_data = new FormData();

//     form_data.append("user_pwd", userPwd)

//     $.ajax({
//         url : url,
//         data:form_data,
//         type: method,
//         contentType: false,
//         processData: false,
//         error:function(){
//            alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
//         },
//         success:function(data) {
//            if(data.resultCode == "0"){
//                 // 수정시 패스워드 오류
//                 alert(data.resultString)
//                 location.reload();
//                 return
//            }else if (data.resultCode == "100"){
//                 alert(data.resultString)
//                 return
//            }


//        }
//     });
// })


var logout = function(){

    var form_data = new FormData();

    $.ajax({
          url : '/user/logout',
          data:form_data,
          type: 'post',
          contentType: false,
          processData: false,
          error:function(){
             alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
          },
          success:function(data) {

             alert(data.resultString)
             location.href="/";
         }
       });
}

/*
 스토어 리스트 (그룹에 속한 스토어 리스트 select box 처리)
*/
var storeCodeList = function(target, set_data){

    var $target_tag = $('#'+target);

    $.ajax({
             type: "GET",
             url: '/parking/storelist/0',

             success : function(json) {
                var applyList = JSON.parse(json.data);

                var options = "<option value='all'>담당 가맹점을 선택 해 주세요.</option>";

                for(var i = 0;i<applyList.length;i++){
                    if(applyList[i].parking_seq == set_data){
                        options += "<option value='"+applyList[i].parking_seq+"' selected>"+applyList[i].parking_nm+"</option>";
                    }else{
                        options += "<option value='"+applyList[i].parking_seq+"'>"+applyList[i].parking_nm+"</option>";
                    }
                }

                $target_tag.html(options);
             },
             error: function(){
                 alert("상세 조회시 에러가 발생했습니다.");
             }
    });
};

function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    ;

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j; // Used as a counter across the whole file
    var result = '';

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
     var hash = [], k = [];
     var primeCounter = 0;
     //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += '\x80'; // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty] % 64 - 56)
        ascii += '\x00'; // More zero padding

    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8)
            return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);

    // process each chunk
    for (j = 0; j < words[lengthProperty]; ) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                    + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                    + k[i]
                    // Expand the message schedule if needed
                    + (w[i] = (i < 16) ? w[i] : (
                            w[i - 16]
                            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                            + w[i - 7]
                            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                            ) | 0
                            );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

            hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

// Logout 
function logout() {

    var form_data = new FormData();

    $.ajax({
          url : '/user/logout',
          data:form_data,
          type: 'post',
          contentType: false,
          processData: false,
          error:function(){
             alert("서버 응답이 없습니다. 서버 확인후 다시 시도해 주세요.");
          },
          success:function(data) {

             alert(data.resultString)
             location.href="/";
         }
    });
}


