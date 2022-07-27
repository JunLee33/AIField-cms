from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug
from models.payment import PaymentModel

# from models.contents    import  ContentsModel
from models.workspace     import  WorkspaceModel
from models.user          import UserModel
from models.point          import PointModel
# from models.layer_dtl import LayerDtlModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from config.properties import *
from utils.fileutil import FileUtils
from datetime import datetime
from flask_login import current_user
import json
import logging
import time


# 포인트관리(등록/수정/삭제)
class Point(Resource):
    parse = reqparse.RequestParser()

    # def __init__(point_id, point_type, point_use, point_detail, user_id, create_date):
    parse.add_argument('point_type', type=str)
    parse.add_argument('point_use', type=str)
    parse.add_argument('point_detail', type=str)
    parse.add_argument('user_id', type=str)
    parse.add_argument('create_date', type=str)

    
    # def get(self):

    #     params = Point.parse.parse_args()
    #     return {'resultCode': '0', "resultString": "SUCCESS", "result" : Payment_list}, 200

    def post(self):
        print("ENTERED ================ Point POST")
        # point_type, point_use, user_id, create_date
        params = Point.parse.parse_args()

        point_type      = params['point_type']
        point_use       = params['point_use']
        point_detail       = params['point_detail']
        user_id         = params['user_id']
        create_date     = datetime.now()
        

        try:
            point_obj = PointModel(point_type, point_use, point_detail, user_id, create_date)
            point_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": "포인트가 등록되었습니다."}, 200


# 포인트관리(LIST 조회)
class PointSearch(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('point_id', type=str)
    parse.add_argument('point_type', type=str)
    parse.add_argument('point_use', type=str)
    parse.add_argument('point_detail', type=str)
    parse.add_argument('user_id', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('create_date', type=str)

    parse.add_argument('start_date', type=str)
    parse.add_argument('end_date', type=str)
    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)


    def post(self):
        print("ENTERED ================ PointSearch POST")
        params = PointSearch.parse.parse_args()

        point_type      = params['point_type']
        point_use       = params['point_use']
        point_detail    = params['point_detail']
        user_id         = params['user_id']
        user_nm         = params['user_nm']
        create_date     = datetime.now()

        start_date = params['start_date']
        end_date = params['end_date']
        start = params['start']
        length = params['length']


        res_data = {}

        # workspace Total Count
        param = (point_type, user_id, user_nm, start_date, end_date)
        tot_list = [dict(r) for r in PointModel.find_all_point_count(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        if(length == None):
            length = "0" 
        param = (point_type, user_id, user_nm, start_date, end_date, start, length)

        res_data['data'] = [dict(r) for r in PointModel.find_all_point(param)]
        
        # print(res_data['data'])
        
        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200