from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug
from models.contents import ContentsModel
from resource.log import LogMessage
# from models.contents    import  ContentsModel
from models.themamap     import  ThemamapModel
from models.themamap_cont     import  ThemamapContModel
from models.user          import UserModel
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
    parse.add_argument('cont_id', type=str)
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
        cont_id = params['cont_id']
        use_yn = "Y"
        user_id = current_user.user_id
        create_date = datetime.now()
        modify_date = datetime.now()
        
        print(params)

        cont_list = cont_id.split('|')
        
        result_data = []
        try:
            # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
            themamap_obj = ThemamapModel(themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date)
            themamap_obj.save_to_db()
            LogMessage.set_message("msg_insert", themamap_nm , "0604")

            print("THEMAMAP ID", themamap_obj.themamap_id)
            for idx in range(len(cont_list)): 
                cont_obj = ContentsModel.find_by_id(cont_list[idx])
                
                themamapcont_obj = ThemamapContModel(themamap_obj.themamap_id, cont_obj.cont_id, themamap_type, cont_obj.cont_org_nm, workspace_id, user_id, create_date, modify_date)
                themamapcont_obj.save_to_db()
                result_data.append({'file_name' : 'w'+workspace_id+':'+cont_obj.cont_org_nm})
                
        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        themamap_data = {'themamap_type' : themamap_type, 'themamap_id' : themamap_obj.themamap_id}
        return {'resultCode': '0', "resultString": "'"+ themamap_nm + "' (이)가 등록 되었습니다.", 'file_path' : result_data, 'themamap_data' : themamap_data}, 200

    def put(self):
        print("ENTERED ================ Themamap PUT")
        jsonData = request.get_json()
        themamap_data = jsonData["data"]
        themamap_ids = []
        modify_date = datetime.now()

        if jsonData["type"] == "list" :
            for key in themamap_data :
                themamap_ids.append(key)

            print(themamap_ids)

            for idx in range(len(themamap_ids)) :

                themamap_id = themamap_data[themamap_ids[idx]]['job_id']
                themamap_status = themamap_data[themamap_ids[idx]]['status']

                if themamap_status == 'idle' :
                    themamap_status = "0201"
                elif themamap_status == 'working' :
                    themamap_status = "0202"
                elif themamap_status == 'suspend' :
                    themamap_status = "0203"
                elif themamap_status == 'done' :
                    themamap_status = "0204"
                # workspace_id = params['workspace_id']
                # use_yn = params['use_yn']
                # user_id = params['user_id']
                # create_date = datetime.now()
                
                try:
                    themamap_id = themamap_id.replace("J","")

                    themamap_obj = ThemamapModel.find_by_id(str(themamap_id))
                    themamap_obj.themamap_status = themamap_status
                    themamap_obj.modify_date = modify_date
                    themamap_obj.save_to_db()

                except Exception as e:

                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": "FAIL"}, 500

            return {'resultCode': '0', "resultString": "상태가 변경 되었습니다."}, 200
        
        elif jsonData["type"] == "command" :

            themamap_id = themamap_data['job_id']
            themamap_status = themamap_data['status']

            try:
                    themamap_obj = ThemamapModel.find_by_id(str(themamap_id))
                    themamap_obj.themamap_status = themamap_status
                    themamap_obj.modify_date = modify_date
                    themamap_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            return {'resultCode': '0', "resultString": "'"+ themamap_obj.themamap_nm + "' (이)가 요청 되었습니다."}, 200

        elif jsonData["type"] == "rename" :
            themamap_id = themamap_data['themamap_id']
            themamap_name = themamap_data['name']
            print(themamap_id)
            print(themamap_name)

            try:
                    themamap_obj = ThemamapModel.find_by_id(str(themamap_id))
                    themamap_obj.themamap_nm = themamap_name
                    themamap_obj.modify_date = modify_date
                    themamap_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            return {'resultCode': '0', "resultString": "'"+ themamap_obj.themamap_nm + "' (이)가 수정 되었습니다."}, 200
            
    

    def delete(self, themamap_id):
        print("ENTERED ================ THEMAMAP DELETE")
        params = Themamap.parse.parse_args()
        
        themamap_id = params['themamap_id']
        use_yn = "N"
        modify_date = datetime.now()
        
        themamap_id_list = []
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
            
            themamap_id_list.append(themamap_obj.themamap_id)

        if len(seleted_list) == 1 :
            resultString = "'"+ themamap_obj.themamap_nm + "' (이)가 삭제 되었습니다."
        else : 
            resultString = str(len(seleted_list)) + " 개가 삭제 되었습니다."


        return {'resultCode': '0', "resultString": resultString, "themamap_id_list" : themamap_id_list }, 200
        


# 현장관리(LIST 조회)
class ThemamapSearch(Resource):
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

    parse.add_argument('start_date', type=str)
    parse.add_argument('end_date', type=str)

    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)


    def post(self):
        print("ENTERED ================ ThemamapSearch POST")
        # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
        params = ThemamapSearch.parse.parse_args()

        themamap_nm = params['themamap_nm']
        themamap_type = params['themamap_type']
        themamap_status = params['themamap_status']
        workspace_id = params['workspace_id']
        use_yn = params['use_yn']
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
        param = (themamap_nm, themamap_type, themamap_status, workspace_id, user_id, start_date, end_date)
        print(param)
        tot_list = [dict(r) for r in ThemamapModel.find_all_themamap_count(param)]
        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
        ###################################################################
        param = (themamap_nm, themamap_type, themamap_status, workspace_id, user_id, start_date, end_date, start, length)
        res_data['data'] = [dict(r) for r in ThemamapModel.find_all_themamap(param)]

        print(res_data['data'])
        
        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200


# themamap_detail(LIST 조회)
class ThemamapMapping(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('themamap_id', type=str)

    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)


    def post(self):
        print("ENTERED ================ ThemamapMapping POST")
        # themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date
        params = ThemamapSearch.parse.parse_args()

        themamap_id = params['themamap_id']
        use_yn = params['use_yn']
        user_id = params['user_id']
        create_date = datetime.now()
        modify_date = datetime.now()

        start = params['start']
        length = params['length']

        if(length == None): 
            length = 0

        res_data = {}

        # themamap_id Total Count
        tot_list = [dict(r) for r in ThemamapModel.find_mapping_themamap_count(themamap_id)]
        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
        ###################################################################
        param = (themamap_id, start, length)
        res_data['data'] = [dict(r) for r in ThemamapModel.find_mapping_themamap(param)]

        print(res_data['data'])
        
        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200
