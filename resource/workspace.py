from operator import le
from unittest import result
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug
from models.contents import ContentsModel
from models.themamap import ThemamapModel

# from models.contents    import  ContentsModel
from models.workspace     import  WorkspaceModel
from models.user          import  UserModel
# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import datetime
from flask_login import current_user
import json
import logging
import time


# 현장관리(상세조회/등록/수정/삭제)
class Workspace(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('workspace_id', type=str)
    parse.add_argument('workspace_nm', type=str)
    parse.add_argument('workspace_cmt', type=str)
    parse.add_argument('workspace_memo', type=str)
    parse.add_argument('workspace_location', type=str)
    parse.add_argument('workspace_disk_total', type=str)
    parse.add_argument('use_yn', type=str)          
    parse.add_argument('user_id', type=str)               
    parse.add_argument('create_data', type=str)             
    parse.add_argument('modify_date', type=str)
 
    
    def get(self):

        params = Workspace.parse.parse_args()
        workspace_id = params['workspace_id']

        workspace_list = WorkspaceModel.find_by_id(workspace_id)

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def post(self):
        print("ENTERED ================ WORKSPACE POST")
        # workspace_nm, workspace_cmt, workspace_memo, workspace_location,  user_id, create_date, modify_date
        params = Workspace.parse.parse_args()

        workspace_nm = params['workspace_nm']
        workspace_cmt = params['workspace_cmt']
        workspace_memo = params['workspace_memo']
        workspace_location = params['workspace_location']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()
        
        print(params)

        try:
            # workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date
            workspace_obj = WorkspaceModel(workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date)
         
            workspace_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "'"+ workspace_nm + "' (이)가 등록 되었습니다."}, 200

    def put(self, workspace_id):
        print("ENTERED ================ WORKSPACE PUT")
        # workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date
        params = Workspace.parse.parse_args()
        
        workspace_id = params['workspace_id']
        workspace_nm = params['workspace_nm']
        workspace_cmt = params['workspace_cmt']
        workspace_memo = params['workspace_memo']
        workspace_location = params['workspace_location']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()
        
        print(params)

        
        try:
            # workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date
            workspace_obj = WorkspaceModel.find_by_id(workspace_id)
            workspace_obj.workspace_nm = workspace_nm
            workspace_obj.workspace_cmt = workspace_cmt
            workspace_obj.workspace_memo = workspace_memo
            workspace_obj.workspace_location = workspace_location
            workspace_obj.modify_date = modify_date
         
            workspace_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "'"+ workspace_nm + "' (이)가 수정 되었습니다."}, 200
    
    def delete(self, workspace_id):
        print("ENTERED ================ WORKSPACE DELETE")
        # workspace_nm, workspace_cmt, workspace_memo, workspace_location,  user_id, create_date, modify_date
        params = Workspace.parse.parse_args()
        
        workspace_id = params['workspace_id']
        use_yn = "N"
        modify_date = datetime.now()
        
        print(params)

        seleted_list = workspace_id.split('|')

        print(seleted_list)

        for workspace_id in seleted_list :
            print(workspace_id)
            try:
                # workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date
                workspace_obj = WorkspaceModel.find_by_id(str(workspace_id))
                workspace_obj.use_yn = use_yn
                workspace_obj.modify_date = modify_date
            
                workspace_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

        if len(seleted_list) == 1 :
            resultString = "'"+ workspace_obj.workspace_nm + "' (이)가 삭제 되었습니다."
        else : 
            resultString = str(len(seleted_list)) + " 개가 삭제 되었습니다."


        return {'resultCode': '0', "resultString": resultString }, 200
        


# 현장관리(LIST 조회)
class WorkspaceSearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('workspace_id', type=str)
    parse.add_argument('workspace_nm', type=str)
    parse.add_argument('workspace_cmt', type=str)
    parse.add_argument('workspace_memo', type=str)
    parse.add_argument('workspace_location', type=str)
    parse.add_argument('use_yn', type=str)          
    parse.add_argument('user_id', type=str)               
    parse.add_argument('create_data', type=str)             
    parse.add_argument('modify_date', type=str)

    parse.add_argument('start_date', type=str)
    parse.add_argument('end_date', type=str)

    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)

    def get(self):
        print("ENTERED ================ WorkspaceSearch GET")
        params = WorkspaceSearch.parse.parse_args()
        user_id = current_user.user_id
        param = (None, None, None, None, None)
        workspace_total = [dict(r) for r in WorkspaceModel.find_all_workspace_count(param)]
        result_obj = {"workspace_total" : (workspace_total[0]['tot_cnt'])}

        params = (None, user_id, None, None, None, None, None, 0)
        contents_total = [dict(r) for r in ContentsModel.find_all_contents(params)]
        result_obj["contents_total"] = len(contents_total)

        total_size = 0
        for idx in range(len(contents_total)) :
            total_size += contents_total[idx]["cont_size"]

        result_obj["disk_total"] = total_size

        paramss = (None, None, None, None, user_id, None, None)
        themamap_total = [dict(r) for r in ThemamapModel.find_all_themamap_count(paramss)]

        result_obj["themamap_total"] = (themamap_total[0]['tot_cnt'])

        return {'resultCode': '0', "resultString": "정보조회완료", "data" : result_obj}, 200





    def post(self):
        print("ENTERED ================ WorkspaceSearch POST")
        # workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date
        params = WorkspaceSearch.parse.parse_args()

        workspace_nm = params['workspace_nm']
        workspace_cmt = params['workspace_cmt']
        workspace_memo = params['workspace_memo']
        workspace_location = params['workspace_location']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()

        start_date = params['start_date']
        end_date = params['end_date']

        start = params['start']
        length = params['length']


        res_data = {}

        # workspace Total Count
        param = (workspace_nm, workspace_cmt, workspace_location, start_date, end_date)
        tot_list = [dict(r) for r in WorkspaceModel.find_all_workspace_count(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        if(length == None):
            length = "0" 
        param = (workspace_nm, workspace_cmt, workspace_location, start_date, end_date, start, length)

        res_data['data'] = [dict(r) for r in WorkspaceModel.find_all_workspace(param)]
        
        
        for idx in range(len(res_data['data'])) :

            res_data['data'][idx]['tm_0201'] = 0
            res_data['data'][idx]['tm_0202'] = 0
            res_data['data'][idx]['tm_0203'] = 0
            res_data['data'][idx]['tm_0204'] = 0

            res_data['data'][idx]['workspace_disk_total'] = 0
            res_data['data'][idx]['cn_0201'] = 0
            res_data['data'][idx]['cn_0202'] = 0
            res_data['data'][idx]['cn_0203'] = 0
            res_data['data'][idx]['cn_0204'] = 0

            now_workspace_id = res_data['data'][idx]['workspace_id']

            themamap_cnt = [dict(r) for r in ThemamapModel.count_by_workspace_id(now_workspace_id)]

            for i in range(len(themamap_cnt)) :
                if themamap_cnt[i]['themamap_status'] == '0201' :
                    res_data['data'][idx]['tm_0201'] = themamap_cnt[i]['count']
                elif themamap_cnt[i]['themamap_status'] == '0202' :
                    res_data['data'][idx]['tm_0202'] = themamap_cnt[i]['count']
                elif themamap_cnt[i]['themamap_status'] == '0203' :
                    res_data['data'][idx]['tm_0203'] = themamap_cnt[i]['count']
                elif themamap_cnt[i]['themamap_status'] == '0204' :
                    res_data['data'][idx]['tm_0204'] = themamap_cnt[i]['count']

            
            
            cont_cnt = [dict(r) for r in ContentsModel.cont_count_by_workspace_id(now_workspace_id)]
            cont_total = 0
            for j in range(len(cont_cnt)) :
                
                cont_total += cont_cnt[j]['sum']
                if cont_cnt[j]['cont_status'] == '0201' :
                    res_data['data'][idx]['cn_0201'] = cont_cnt[j]['count']
                elif cont_cnt[j]['cont_status'] == '0202' :
                    res_data['data'][idx]['cn_0202'] = cont_cnt[j]['count']
                elif cont_cnt[j]['cont_status'] == '0203' :
                    res_data['data'][idx]['cn_0203'] = cont_cnt[j]['count']
                elif cont_cnt[j]['cont_status'] == '0204' :
                    res_data['data'][idx]['cn_0204'] = cont_cnt[j]['count']

            res_data['data'][idx]['workspace_disk_total'] = cont_total/1000

        # res_data['data'][0]['hello'] = 'H,E,L,L,O'

        print(res_data['data'])
        # print(res_data['data'][0]['hello'])
        


        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200
