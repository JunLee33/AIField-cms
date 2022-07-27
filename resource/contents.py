from configparser import Interpolation
import os
os.environ["OPENCV_IO_MAX_IMAGE_PIXELS"] = str(pow(2,40))
import cv2
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug
from resource.log import LogMessage

from models.contents    import  ContentsModel
from models.workspace     import  WorkspaceModel
from models.user          import UserModel
from models.log          import LogModel
from models.point import PointModel
# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import datetime
from flask_login import current_user
import json
import logging
import time


# 콘텐츠(상세조회/등록/수정/삭제)
class Contents(Resource):
    parse = reqparse.RequestParser()

    # cont_nm, cont_org_nm, cont_size, cont_date, cont_url, cont_thu_url, cont_status, workspace_id, use_yn, user_id, create_date, modify_date
    parse.add_argument('cont_id',       type=str, action='append')
    parse.add_argument('cont_nm',       type=str, action='append')
    parse.add_argument('cont_org_nm',   type=str, action='append')
    parse.add_argument('cont_size',     type=str, action='append')
    parse.add_argument('cont_date',     type=str, action='append')
    parse.add_argument('cont_url',      type=str, action='append')
    parse.add_argument('cont_thu_url',  type=str, action='append')
    parse.add_argument('cont_status',   type=str, action='append')
    parse.add_argument('workspace_id',  type=str, action='append')
    parse.add_argument('use_yn',        type=str, action='append')
    parse.add_argument('user_id',       type=str, action='append')
    parse.add_argument('create_date',   type=str, action='append')
    parse.add_argument('modify_date',   type=str, action='append')

    parse.add_argument('use_point',   type=str, action='append')

    def get(self):
        params = Contents.parse.parse_args()
        cont_id = params['cont_id']

        contents_list = ContentsModel.find_by_id(cont_id)

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200
        
    def post(self):
        print("ENTERED ================ POST")
        
        params = Contents.parse.parse_args()
        
        # cont_nm, cont_org_nm, cont_size, cont_date, cont_url, cont_thu_url, cont_status, workspace_id, use_yn, user_id, create_date, modify_date
        cont_nm =           params['cont_nm']
        cont_org_nm =       params['cont_org_nm']
        cont_size =         params['cont_size']
        cont_date =         params['cont_date']
        cont_status =       params['cont_status']
        workspace_id =      params['workspace_id']
        use_yn =            params['use_yn']

        use_point =      params['use_point']

        upload_file_data = []
        cont_files = []
        cont_url = ''
        cont_path = ''
        cont_thum_path = ''
        cont_thum_url = ''
        user_id = current_user.user_id
        create_date = datetime.now()
        modify_date = datetime.now()
        user_id_array = user_id.split("@")
        print(params)
        try:
            # 파일명 추출
            for file in request.files.getlist("files"):
                cont_files.append(file)

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "파일 업로드에 실패하였습니다."}, 500

        # 업로드된 파일이 존재 하는 경우 conts 데이터 셋 만들기
        for idx in range(len(cont_nm)):

            cont_path =         common_file
            cont_thum_path =    common_file
            cont_url =          common_url
            cont_thum_url =     common_url

            print("LOOP ["+str(idx)+"]")

            # 파일명 추출 (파일명에 띄어쓰기 있는경우 파일명이 중간에 잘림)
            cont_org_nm = str(cont_files[idx].filename.replace(" ", "_"))           # 필드 생성 후 저장 해야함
            fname, ext = os.path.splitext(cont_org_nm)
            cont_file_name = user_id_array[0] + "_" +str(int(time.time())) + "_" + str(idx) + ext
            cont_file_only_name = user_id_array[0] + "_" +str(int(time.time())) + "_" + str(idx)

            print(int(time.time()))
            print("FILE NAME = ["+cont_file_name+"]")

            # URL 설정(코드 + 파일명) directory : <user_id> / <workspace_id>/
            cont_url += user_id_array[0] +"/"+ str(workspace_id[0]) + "/"
            cont_path += user_id_array[0] +"/"+ str(workspace_id[0]) + "/"

            cont_url += cont_file_name

            cont_thum_replace = cont_file_name.replace(".tif", "")
            cont_thum_replace = cont_thum_replace.replace(".tfw", "")
            cont_thum_replace = cont_thum_replace.replace(".mp4", "")
            
            cont_thum_url += user_id_array[0] +"/"+ str(workspace_id[0]) + "/"
            cont_thum_url += cont_thum_replace + ".png"
            cont_thum_path += user_id_array[0] +"/"+ str(workspace_id[0]) + "/"
            cont_thum_path += cont_thum_replace + ".png"
            print("FILE THUMB NAME = ["+cont_thum_url+"]")
            print("FILE cont_path = ["+cont_path+"]")
            # cont_nm, cont_org_nm, cont_size, cont_date, cont_url, cont_thu_url, cont_status, workspace_id, use_yn, user_id, create_date, modify_date
            content_obj = ContentsModel(cont_nm[idx], cont_file_only_name, str(int(float(cont_size[idx])*1024)), cont_date[idx], cont_url, cont_thum_url, "0204", workspace_id[0], "Y", user_id, create_date, modify_date)
            
            upload_file_data.append({'file_name' : cont_file_only_name, 'file_path' : cont_url})

            try:
                if not FileUtils.save_file(cont_files[idx], cont_path, cont_file_name):
                    raise Exception('not save image %s' % cont_path + cont_file_name)

                if ext == ".mp4" :
                    video_cap = cv2.VideoCapture(cont_path + cont_file_name)
                    print(cont_path + cont_file_name)

                    while video_cap.isOpened():
                        ret, img = video_cap.read()
                        image = cv2.resize(img, (480,270))
                        cv2.imwrite(cont_thum_path, image)
                        break
                    video_cap.release()
                elif ext == ".tif" or ext == ".tfw" :
                    img = cv2.imread(cont_path+cont_file_name, flags=cv2.IMREAD_UNCHANGED)
                    w = img.shape[0]
                    h = img.shape[1]
                    print(w,h)
                    image = cv2.resize(img, (int(w/10),int(h/10)), interpolation = cv2.INTER_AREA)
                    cv2.imwrite(cont_thum_path, image)

                else :
                    raise Exception('not save image %s' % cont_path + cont_file_name)

                # DB 저장
                content_obj.save_to_db()
                LogMessage.set_message("msg_upload", cont_nm[idx] , "0603")

            except Exception as e:
                
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "콘텐츠 업로드에 실패하였습니다."}, 500

        print(upload_file_data)

        #  포인트관련처리
        point_detail = 0
        for idx in range(len(cont_nm)):
            point_detail += float(cont_size[idx])

        try:
            print("USER POINT UPDATE")
            user_obj = UserModel.find_by_id(user_id)

            now_user_point = user_obj.user_point

            user_obj.user_point = int(now_user_point) - int(use_point[0])
            user_obj.modify_date = modify_date

            user_obj.save_to_db()

            print("TBL_POINT INSERT")
            point_obj = PointModel("0503", use_point[0], point_detail, user_id, create_date)
            point_obj.save_to_db()
            LogMessage.set_message("msg_point", use_point[0] +"P 사용" , "0606")

            return {'resultCode': '0', "resultString": "콘텐츠가 업로드 되었습니다.", "file_name" : upload_file_data}, 200

        except Exception as e:
            
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "콘텐츠 업로드에 실패하였습니다."}, 500

                



    def replaceMultiple(mainString, toBeReplaces, newString):
        # Iterate over the strings to be replaced
        for elem in toBeReplaces:
            # Check if string is in the main string
            if elem in mainString:
                # Replace the string
                mainString = mainString.replace(elem, newString)

        return mainString


    def put(self,cont_id):
        print("CONTENTS ------ PUT ENTER ----------")
        params = Contents.parse.parse_args()

        cont_id =           params['cont_id']
        cont_nm =           params['cont_nm']
        cont_date =         params['cont_date']
        cont_status =       params['cont_status']
        workspace_id =      params['workspace_id']
        use_yn =            params['use_yn']

        create_date  = datetime.now()
        modify_date = datetime.now()

        try:
            site_obj = ContentsModel.find_by_id(cont_id[0])
            
            site_obj.modify_date = datetime.now()
            site_obj.cont_nm = cont_nm[0]
            site_obj.cont_date = cont_date[0]
            
            site_obj.save_to_db()
            LogMessage.set_message("msg_update", cont_nm[0] , "0603")

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "콘텐츠 수정에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": "콘텐츠 수정에 성공하였습니다."}, 200




    def delete(self,cont_id):
                

        params = Contents.parse.parse_args()

        cont_id =           params['cont_id']
        cont_nm =           params['cont_nm']
        cont_date =         params['cont_date']
        cont_status =       params['cont_status']
        workspace_id =      params['workspace_id']
        use_yn =            "N"

        create_date  = datetime.now()
        modify_date  = datetime.now()
        

        cont_path =         common_file
        cont_thum_path =    common_file

        upload_file_data = []
        print(params)

        seleted_list = cont_id[0].split('|')

        print(seleted_list)

        for cont_id in seleted_list :
            print(cont_id)
            try:
                site_obj = ContentsModel.find_by_id(str(cont_id))
                file_url = site_obj.cont_url
                thum_url = site_obj.cont_thu_url

                site_obj.use_yn = use_yn
                site_obj.modify_date = modify_date
            
                site_obj.save_to_db()
                # site_obj.delete_to_db()


            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            upload_file_data.append({'file_name' : site_obj.cont_url, 'workspaceid': site_obj.workspace_id})
            LogMessage.set_message("msg_delete", site_obj.cont_nm , "0603")

            # http://localhost:5100/static/contents/STORAGE/ECTNFS_CHANGE/test/21/test_1647495977_0.tif
            # # file delete
            file_path_array = file_url.split("/")
            thum_path_array = thum_url.split("/")

            file_path = file_url.replace("/"+file_path_array[len(file_path_array)-1],"") + "/"
            thum_path = thum_url.replace("/"+thum_path_array[len(thum_path_array)-1],"") + "/"

            file_name = file_path_array[len(file_path_array)-1]
            thum_name = thum_path_array[len(thum_path_array)-1]
            FileUtils.delete_file(file_path, file_name)
            FileUtils.delete_file(thum_path, thum_name)

        if len(seleted_list) == 1 :
            resultString = "'"+ site_obj.cont_nm + "' (이)가 삭제 되었습니다."
        else : 
            resultString = str(len(seleted_list)) + " 개가 삭제 되었습니다."


        return {'resultCode': '0', "resultString": resultString, "file_name" : upload_file_data }, 200


# 콘텐츠 메인 리스트 조회
class ContentsSearch(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('cont_id',       type=str)
    parse.add_argument('cont_nm',       type=str)
    parse.add_argument('cont_org_nm',   type=str)
    parse.add_argument('cont_size',     type=str)
    parse.add_argument('cont_date',     type=int)
    parse.add_argument('cont_url',      type=str)
    parse.add_argument('cont_thu_url',  type=str)
    parse.add_argument('cont_status',   type=str)
    parse.add_argument('workspace_id',  type=str)
    parse.add_argument('use_yn',        type=str)
    parse.add_argument('user_id',       type=str)
    parse.add_argument('create_data',   type=str)
    parse.add_argument('modify_date',   type=str)

    parse.add_argument('start_date', type=str)
    parse.add_argument('end_date', type=str)
    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)

    def get(self):
        params = ContentsSearch.parse.parse_args()

        cont_id = params['cont_id']

        contents_list = ContentsModel.find_by_id(cont_id)
        user_obj = UserModel.find_by_id(contents_list.user_id)
        worksapce_obj = WorkspaceModel.find_by_id(contents_list.workspace_id)
        contents_list = json.dumps(contents_list, cls=jsonEncoder)
        user_nm = user_obj.user_nm
        workspace_nm = worksapce_obj.workspace_nm
        return {
                    'resultCode': '0',
                    "resultString": "SUCCESS",
                    "data": contents_list,
                    "username" : user_nm,
                    "workspace_nm" : workspace_nm
               }, 200

    def post(self):
        
        res_data = {}
        # 모든 콘텐츠 데이터 가져오기
        # 콘텐츠 전체 조회에 사용
        params = ContentsSearch.parse.parse_args()
        cont_id = params['cont_id']
        cont_nm = params['cont_nm']
        cont_org_nm = params['cont_org_nm']
        cont_size = params['cont_size']
        cont_date = params['cont_date']
        cont_url = params['cont_url']
        cont_thu_url = params['cont_thu_url']
        cont_status = params['cont_status']
        workspace_id = params['workspace_id']
        use_yn = params['use_yn']
        print(workspace_id)
        user_id = current_user.user_id
    
        start_date = params['start_date']
        end_date = params['end_date']
        start = params['start']
        length = params['length']

        if(length == None): 
            length = 0
        

        # Total Count
        param = (cont_nm, user_id, workspace_id, cont_status, start_date, end_date)
        print(param)
        tot_list = [dict(r) for r in ContentsModel.find_all_contents_count(param)]
        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
        ###################################################################
        param = (cont_nm, user_id, workspace_id, cont_status, start_date, end_date, start, length)
        res_data['data'] = [dict(r) for r in ContentsModel.find_all_contents(param)]

        print(res_data['data'])

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"
        # print(res_data['recordsTotal'])
        # print(res_data['recordsFiltered'])
        
        return res_data, 200
