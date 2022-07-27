from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug

# from models.contents    import  ContentsModel
from models.themamap     import  ThemamapModel
from models.user          import UserModel
from models.themamap_cont     import  ThemamapContModel
# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import datetime
from flask_login import current_user
import json
import logging
import time


# 주제도관리(상세조회/등록/수정/삭제)
class Themamap(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('themamap_id', type=str)
    parse.add_argument('themamap_nm', type=str)
    parse.add_argument('themamap_type', type=str)
    parse.add_argument('themamap_status', type=str)
    parse.add_argument('workspace_id', type=str)
    parse.add_argument('use_yn', type=str)
    parse.add_argument('user_id', type=str)               
    parse.add_argument('create_data', type=str)             
    parse.add_argument('modify_date', type=str)
 
    
    def get(self):

        params = Themamap.parse.parse_args()
        themamap_id = params['themamap_id']

        themamap_list = ThemamapModel.find_by_id(themamap_id)

        return {'resultCode': '0', "resultString": "SUCCESS"}, 200

    def post(self):
        print("ENTERED ================ Themamap POST")
        # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
        params = Themamap.parse.parse_args()

        themamap_nm = params['themamap_nm']
        themamap_type = params['themamap_type']
        themamap_status = "0201"
        workspace_id = params['workspace_id']
        use_yn = "Y"
        user_id = current_user.user_id
        create_date = datetime.now()
        modify_date = datetime.now()
        
        print(params)

        try:
            # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
            themamap_obj = ThemamapModel(themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date)
         
            themamap_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "'"+ themamap_nm + "' (이)가 등록 되었습니다."}, 200

    def put(self, themamap_id):
        print("ENTERED ================ Themamap PUT")
        # workspace_nm, workspace_cmt, workspace_memo, workspace_location,  user_id, create_date, modify_date
        params = Themamap.parse.parse_args()
        
        themamap_id = params['themamap_id']
        themamap_nm = params['themamap_nm']
        themamap_type = params['themamap_type']
        themamap_status = params['themamap_status']
        workspace_id = params['workspace_id']
        use_yn = params['use_yn']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()
        
        print(params)


        try:
            themamap_obj = ThemamapModel.find_by_id(str(themamap_id))
            themamap_obj.themamap_nm = themamap_nm
            themamap_obj.themamap_type = themamap_type
            themamap_obj.themamap_status = themamap_status
            themamap_obj.modify_date = modify_date
         
            themamap_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "'"+ themamap_nm + "' (이)가 수정 되었습니다."}, 200
    
    def delete(self, themamap_id):
        print("ENTERED ================ WORKSPACE DELETE")
        params = Themamap.parse.parse_args()
        
        themamap_id = params['themamap_id']
        use_yn = "N"
        modify_date = datetime.now()
        
        print(params)

        seleted_list = themamap_id.split('|')

        print(seleted_list)

        for themamap_id in seleted_list :
            print(themamap_id)
            try:
                themamap_obj = ThemamapModel.find_by_id(str(themamap_id))
                themamap_obj.use_yn = use_yn
                themamap_obj.modify_date = modify_date
            
                themamap_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

        if len(seleted_list) == 1 :
            resultString = "'"+ themamap_obj.themamap_nm + "' (이)가 삭제 되었습니다."
        else : 
            resultString = str(len(seleted_list)) + " 개가 삭제 되었습니다."


        return {'resultCode': '0', "resultString": resultString }, 200
        


# 현장관리(LIST 조회)
class ThemamapContSearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('themamap_id', type=str)
    parse.add_argument('cont_id', type=str)
    parse.add_argument('themamap_type', type=str)
    parse.add_argument('cont_org_nm', type=str)
    parse.add_argument('workspace_id', type=str)
    parse.add_argument('user_id', type=str)               
    parse.add_argument('create_data', type=str)             
    parse.add_argument('modify_date', type=str)

    parse.add_argument('start_date', type=str)
    parse.add_argument('end_date', type=str)

    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)


    def post(self):
        print("ENTERED ================ ThemamapContSearch POST")
        # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
        params = ThemamapContSearch.parse.parse_args()

        themamap_id = params['themamap_id']
        cont_id = params['cont_id']
        themamap_type = params['themamap_type']
        cont_org_nm = params['cont_org_nm']
        workspace_id = params['workspace_id']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()

        start_date = params['start_date']
        end_date = params['end_date']

        start = params['start']
        length = params['length']

        if(length == None): 
            length = 0

        res_data = {}

        # workspace Total Count
        param = (themamap_id, cont_id, themamap_type, cont_org_nm, workspace_id, user_id, start_date, end_date)
        print(param)
        tot_list = [dict(r) for r in ThemamapContModel.find_all_themamapcont_count(param)]
        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
        ###################################################################
        param = (themamap_id, cont_id, themamap_type, cont_org_nm, workspace_id, user_id, start_date, end_date, start, length)
        res_data['data'] = [dict(r) for r in ThemamapContModel.find_all_themamapcont(param)]

        print(res_data['data'])
        
        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200
