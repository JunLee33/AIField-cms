#-*- coding:utf-8 -*-

from core.db                import db
from flask_restful          import Api
from flask                  import Flask, session, render_template, jsonify
from flask_jwt_extended     import JWTManager
from config.configuration   import Configuration
from dateutil.relativedelta import *
import datetime

from apscheduler.schedulers.background import BackgroundScheduler

from datetime               import timedelta

from flask                  import request
from flask_login            import LoginManager, login_required
from resource.user          import User, UserLogin, UserLogout, UserPwFind, UserSearch, UserPassword, UserDuplicate, UserDormancy, UserModel
from resource.code          import Code, CodeSearch, CodeApplySearch
from resource.contents      import ContentsSearch, Contents
from resource.dashboard     import Dashboard
from resource.workspace     import Workspace, WorkspaceSearch
from resource.themamap      import Themamap, ThemamapSearch, ThemamapMapping
from resource.themamap_cont      import ThemamapContSearch
from resource.payment       import Payment, PaymentSearch, Paymentcancle
from resource.point         import Point, PointSearch
# from resource.notify        import Notify
from flask_mail             import Mail, Message
from threading              import Thread

# Flask Init App
app = Flask(__name__)


# SQLITE and secret Config
app.config.from_object(Configuration)
# app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
# app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=30)
# app.config['SQLALCHEMY_POOL_RECYCLE'] = <db_wait_timeout> - 1
app.config['SQLALCHEMY_POOL_RECYCLE'] = 499
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20

# MAIL SET start *******************************
# Mail service config ==> GEORIM
# app.config['MAIL_SERVER']=      'mail.georim.kr'
# app.config['MAIL_PORT'] =       587
# app.config['MAIL_USERNAME'] =   'help@georim.kr'
# app.config['MAIL_PASSWORD'] =   'georimWkd!'
# app.config['MAIL_USE_TLS'] =    True

# TEIXON
app.config['MAIL_SERVER']=      'smtp.mailplug.co.kr'
app.config['MAIL_PORT'] =       465
app.config['MAIL_USERNAME'] =   'support@teixon.com'
# app.config['MAIL_PASSWORD'] =   'k!3731197'
app.config['MAIL_PASSWORD'] =   '3731197!k'     # 비밀번호 변경 요청(05/16)
app.config['MAIL_USE_TLS'] =    False
app.config['MAIL_USE_SSL'] =    True

mail = Mail(app)
# MAIL SET end *******************************


# JWT Set
jwt = JWTManager(app)

# APP Set
api = Api(app)

# DataBase Init
db.init_app(app)

# DB Table creation test.
with app.app_context():
    db.create_all()
    # print("NEW DB Tables created (Not exist only created !!)")

# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/"
login_manager.needs_refresh_message = (u"Session timedout, please re-login")
login_manager.needs_refresh_message_category = "info"

@app.before_request
def before_request():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=300)
    app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=300)

@login_manager.user_loader
def user_loader(user_id):
    return UserModel.find_by_id(user_id)


# ######################################################################################################################
# INTRO PAGE and LOGIN API 모음
# ######################################################################################################################
@app.route('/')
def main():
        return  render_template('/did/Login.html')


api.add_resource(UserLogin,     '/user/login', endpoint='user/login')                                 # CMS 로그인   method:post
api.add_resource(UserLogout,    '/user/logout', endpoint='user/logout')                               # CMS 로그아웃  method:post
api.add_resource(UserPwFind,    '/user/find', endpoint='user/find')                                 # 비밀번호 검증 method:post
api.add_resource(UserPwFind,    '/user/resetPw/<string:user_id_verify>', endpoint='user/resetPw')

# ######################################################################################################################
# DASHBOARD 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/dashboard')
@login_required
def dashboard_main():

    return render_template('/did/dashboard.html')

api.add_resource(WorkspaceSearch,    '/dashboard/search', endpoint='/dashboard/search')                                # 현장 리스트 조회


# ######################################################################################################################
# ORGANIC 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/workspace')
@login_required
def workspace_main():
    return render_template('/did/workspace.html')


# 페이지
@app.route('/workspace/admin')
@login_required
def workspace_admin():
    return render_template('/admin/workspace_admin.html')

# API
#  API
api.add_resource(WorkspaceSearch,    '/workspace/search', endpoint='/workspace/search')                                # 현장 리스트 조회
api.add_resource(Workspace,          '/workspace/insert', endpoint='/workspace/insert')                                # 현장 추가
api.add_resource(Workspace,          '/workspace/update/<int:workspace_id>', endpoint='workspace/update')              # 현장 수정
api.add_resource(Workspace,          '/workspace/delete/<workspace_id>', endpoint='workspace/delete')                  # 현장 삭제




# ######################################################################################################################
# 콘텐츠관리(콘텐츠, 템플릿, 레이어) 및 API 모음
# ######################################################################################################################

# # 페이지
@app.route('/content')
@login_required
def contents_workspace():
    return render_template('/did/content.html')

# # 페이지
@app.route('/content/cont')
@login_required
def contents_cont():
    return render_template('/did/content_cont.html')

# # 페이지
@app.route('/content/cont/detail')
@login_required
def contents_detail():
    return render_template('/did/content_detail.html')


# # 페이지
@app.route('/content/admin')
@login_required
def contents_admin():
    return render_template('/admin/content_admin.html')
# # 페이지
@app.route('/content/admin/cont')
@login_required
def contents_cont_admin():
    return render_template('/admin/content_cont_admin.html')

# # 페이지
@app.route('/content/admin/cont/detail')
@login_required
def contents_detail_admin():
    return render_template('/admin/content_detail_admin.html')


# # API
api.add_resource(ContentsSearch,    '/content/search', endpoint='content/search')                                     # 콘텐츠전체조회
api.add_resource(Contents,          '/content/insert', endpoint="content/insert")                                     # 콘텐츠등록
api.add_resource(Contents,          '/content/update/<int:cont_id>', endpoint="content/update")                       # 콘텐츠수정
api.add_resource(Contents,          '/content/delete/<cont_id>', endpoint="content/delete")                       # 콘텐츠삭제

# ######################################################################################################################
# ORGANIC 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/themamap')
@login_required
def themamap_main():

    return render_template('/did/themamap.html')

# # 페이지
@app.route('/themamap/cont')
@login_required
def themamap_cont():
    return render_template('/did/themamap_cont.html')

# # 페이지
@app.route('/themamap/cont/detail')
@login_required
def themamap_detail():
    return render_template('/did/themamap_detail.html')

# # 페이지
@app.route('/themamap/cont/add')
@login_required
def themamap_add():
    return render_template('/did/themamap_add.html')

# # 페이지
@app.route('/themamap/admin')
@login_required
def themamap_admin():
    return render_template('/admin/themamap_admin.html')

# # 페이지
@app.route('/themamap/admin/cont')
@login_required
def themamap_cont_admin():
    return render_template('/admin/themamap_cont_admin.html')

# # 페이지
@app.route('/themamap/admin/cont/detail')
@login_required
def themamap_detail_admin():
    return render_template('/admin/themamap_detail_admin.html')
    
#  API
api.add_resource(ThemamapSearch,    '/themamap/search',                     endpoint='/themamap/search')              # 주제도 리스트 조회
api.add_resource(ThemamapMapping,    '/themamap/mapping',                     endpoint='/themamap/mapping')           # 주제도 매팡 리스트
api.add_resource(Themamap,          '/themamap/insert',                     endpoint='/themamap/insert')              # 주제도 추가
api.add_resource(Themamap,          '/themamap/update',                     endpoint='/themamap/update')              # 주제도 수정
api.add_resource(Themamap,          '/themamap/delete/<themamap_id>',       endpoint='/themamap/delete')              # 주제도 삭제
api.add_resource(ThemamapContSearch,  '/themamap/cont/search',       endpoint='/themamap/cont/search')                # 주제도 파일가져오기



# ######################################################################################################################
# PAYMENT
# ######################################################################################################################

#preview
@app.route('/payment')
@login_required
def payment_main():
    return render_template('/did/payment.html')

#  API
api.add_resource(Payment,           '/payment/insert', endpoint='/payment/insert')                                     # 결제 데이터 넣기
api.add_resource(PaymentSearch,     '/payment/search', endpoint='/payment/search')                                     # 결제 리스트 조회
api.add_resource(PointSearch,       '/payment/point/search', endpoint='/payment/point/search')                                           # 포인트 리스트 조회
api.add_resource(Paymentcancle,       '/payment/cancle', endpoint='/payment/cancle')                                           # 포인트 리스트 조회

#preview
@app.route('/payment/admin')
@login_required
def payment_admin():
    return render_template('/admin/payment_admin.html')

# ######################################################################################################################
# 사용자 화면 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/user')
@login_required
def user_main():
    return render_template('/did/user.html')

#  API
api.add_resource(UserSearch,    '/user/search', endpoint='/user/search')                                        # 사용자 리스트 조회
api.add_resource(User,          '/user/insert', endpoint='/user/insert')                                        # 사용자 등록
api.add_resource(User,          '/user/update/<string:user_id>', endpoint='user/update')                        # 사용자 수정
api.add_resource(User,          '/user/delete/<string:user_id>/<string:type>', endpoint='user/delete')          # 사용자 사용유무 변경 처리
api.add_resource(UserDuplicate, '/user/duplicate_check/<string:user_id>', endpoint='user/UserDuplicate')        # 중복체크 처리             # 완료(jun)


# ######################################################################################################################
# 공통코드 화면 및 API 모음
# ######################################################################################################################

# API
api.add_resource(CodeApplySearch,   '/code/applySearch', endpoint='code/applySearch')



# ######################################################################################################################
# SETUP
# ######################################################################################################################

# 페이지
@app.route('/service')
@login_required
def service():
    return render_template('/did/servicecenter.html')



# ######################################################################################################################
# MAIL SENDING
# ######################################################################################################################

@app.route('/notify', methods = ['POST'])
def send_email():
    print(request.form)
    title = request.form['title']
    receiver = request.form['email']
    content = request.form['contents']


    try:
        msg = Message(title,
                        sender="support@teixon.com",
                        recipients=[receiver])

        msg.html = content
        mail.send(msg)
        print("---------------------------------------------")
        print("***            Mail sending OK !!         ***")
        print("---------------------------------------------")

    except Exception as e: 
        print(e)
        return {'resultCode': '100', "resultString": "MAIL SENDING FAIL"}, 200
    
    return {'resultCode': '0', "resultString":  "메일 전송을 완료 하였습니다."}, 200



# ######################################################################################################################
# APP RUN
# ######################################################################################################################
if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5100)