from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, request
from sqlalchemy.sql.elements import Null
# from werkzeug.datastructures import FileStorage
import werkzeug
from models.payment import PaymentModel
from models.point import PointModel

# from models.contents    import  ContentsModel
from models.workspace     import  WorkspaceModel
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
from flask_mail             import Mail, Message

class Notify(Resource):

    def get(selt):
        email_adddress = request.args.get('email')

        print(email_adddress)

        try:
            msg = Message("Hello",
                            sender="help@georim.kr",
                            recipients=[email_adddress])

            # msg.body = "TEST MESSAGE FROM 정사영상 시스템"
            msg.html = "<H3><b>testing</b></H3>"
            mail.send(msg)
            print("---------------------------------------------")
            print("Mail sending OK !!")
            print("---------------------------------------------")

        except Exception as e: 
            print(e)
            return {'resultCode': '100', "resultString": "MAIL SENDING FAIL"}, 200
        
        return {'resultCode': '0', "resultString": email_adddress + "메일 전송을 완료 하였습니다."}, 200