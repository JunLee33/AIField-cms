from datetime import datetime
from core.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from models.code import CodeModel
from sqlalchemy.sql import text
from flask_login import current_user

# +--------------------+--------------+------+-----+---------+-------+
# | Field              | Type         | Null | Key | Default | Extra |
# +--------------------+--------------+------+-----+---------+-------+
# | user_id            | varchar(50)  | NO   | PRI |         |       |
# | user_pwd           | varchar(128) | NO   |     |         |       |
# | user_nm            | varchar(20)  | NO   |     |         |       |
# | user_grade         | varchar(4)   | NO   |     |         |       |
# | user_phone         | varchar(15)  | NO   |     |         |       |
# | user_birth         | varchar(10)  | NO   |     |         |       |
# | user_point         | integer      | NO   |     | "0"     |       |
# | user_office        | varchar(20)  | YES  |     | NULL    |       |
# | user_dept_nm       | varchar(20)  | YES  |     | NULL    |       |
# | user_dept_charge   | varchar(20)  | YES  |     | NULL    |       |
# | user_conn_date     | datetime     | YES  |     | NULL    |       |
# | user_dor_acc       | varchar(1)   | NO   |     | "Y"     |       |
# | user_pwd_change_dt | datetime     | NO   |     |         |       |
# | use_yn             | varchar(1)   | NO   |     | "Y"     |       |
# | create_date        | datetime     | NO   |     |         |       |
# | modify_date        | datetime     | NO   |     |         |       |
# +--------------------+--------------+------+-----+---------+-------+

class UserModel(db.Model):
    __tablename__ = 'tbl_user'

    user_id = db.Column(db.String(50), primary_key=True)                                 # 사용자 아이디
    user_pwd = db.Column(db.String(128), nullable=False)                                 # 사용자 패스워드(hash 양방향 암호)
    user_nm = db.Column(db.String(20), nullable=False)                                   # 사용자명
    user_grade = db.Column(db.String(4), nullable=False)                                 # 사용자 등급(TBL_COMMON)
    user_phone = db.Column(db.String(15), nullable=False)                               # 사용자 핸드폰 번호
    user_birth = db.Column(db.String(10), nullable=False)                               # 사용자 생년월일
    user_point = db.Column(db.Integer, nullable=False, default="0")                     # 사용자 포인트
    user_office = db.Column(db.String(20), nullable=True)                               # 사용자 소속회사명  (부가정보)
    user_dept_nm = db.Column(db.String(20), nullable=True)                              # 사용자 부서명     (부가정보)
    user_dept_charge = db.Column(db.String(20), nullable=True)                          # 사용자 담당업무    (부가정보)
    user_conn_date = db.Column(db.DateTime, nullable=True, default=datetime.now())      # 사용자 로그인한 시간(90일 미접속 시 휴면계정 전환 체크)
    user_dor_acc = db.Column(db.String(1), nullable=False, default="Y")                 # 사용자 휴먼계정여부 (최초 가입시 관리자 승인 필요)
    user_pwd_change_dt = db.Column(db.DateTime, nullable=False, default=datetime.now()) # 사용자 비밀번호 변경 일자
    use_yn = db.Column(db.String(1), nullable=False, default="Y")                       # 사용자 활성화/비활성화(default:Y)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    modify_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    delete_yn = db.Column(db.String(1), nullable=False, default="Y")                    # 사용자 완전삭제


    def __init__(self, user_id, user_pwd, user_nm, user_grade, user_phone, user_birth, user_point, user_office, user_dept_nm, user_dept_charge, create_date, modify_date):

        self.user_id = user_id
        self.set_password(user_pwd)
        self.user_nm = user_nm
        self.user_grade = user_grade
        self.user_phone = user_phone
        self.user_birth = user_birth
        self.user_point = user_point
        self.user_office = user_office
        self.user_dept_nm = user_dept_nm
        self.user_dept_charge = user_dept_charge
        self.create_date = create_date
        self.modify_date = modify_date
        

    def set_password(self, password):
        self.user_pwd = generate_password_hash(password)

    def set_dor_acc(self):
        self.user_dor_acc = "N"
        self.user_conn_date = None

    def check_id_pwd(self, user_id):
        return check_password_hash(self.user_pwd, user_id)

    def check_password(self, password):
        return check_password_hash(self.user_pwd, password)

    def check_time(self):
        sql = """
        SELECT DATE_PART('day', NOW()) - DATE_PART('day', user_conn_date) AS "DiffDo", 
               DATE_PART('day', NOW()) - DATE_PART('day', user_pwd_change_dt) AS "DiffPw"
        FROM tbl_user 
        """
        sql += "where user_id = '" + self.user_id + "'"

        return db.engine.execute(text(sql))


    @classmethod
    def update_user_settop_usage(cls, user_id, settop_cnt):
        sql = """
            UPDATE tbl_user 
            SET now_settop = now_settop + :settop_cnt
            WHERE user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id':user_id, 'settop_cnt':settop_cnt})

    @classmethod
    def get_password(cls, user_id, user_nm, user_phone):
        sql = """
            select user_pwd 
            from tbl_user
            where user_nm = :user_nm and user_phone = :user_phone and user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_nm':user_nm, 'user_phone':user_phone, 'user_id':user_id})

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).first()

    @classmethod
    def get_user_grade(cls, user_id):
        sql = """
            select user_grade
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_create_user_id(cls, user_id):
        sql = """
            select create_user_id
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_sum_user_disk(cls, user_id):
        sql = """
            select sum(user_disk) sum_disk
            from tbl_user 
            where create_user_id = :user_id and user_id != :user_id
        
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})
        
    @classmethod
    def get_sum_user_settop(cls, user_id):
        sql = """
            select sum(user_settop) sum_settop
            from tbl_user 
            where create_user_id = :user_id and user_id != :user_id
        
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    # @classmethod
    # def get_sum_now_settop(cls, user_id):
    #     sql = """
    #         select sum(now_settop) sum_now_settop
    #         from tbl_user 
    #         where create_user_id = :user_id or user_id = :user_id
        
    #     """
    #     return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_config_by_user_id(cls, user_id):
        sql = """
            select user_M, user_I, user_T, user_W, user_L, user_G  
            from tbl_user 
            WHERE user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id':user_id})

    @classmethod
    def find_all_user_count(cls, params):
        user_id, user_nm, user_grade, group_id = params

        sql = """
            select count(*) tot_cnt
            from tbl_user a
            where a.user_grade != '0100' and a.delete_yn = 'Y'
            """

        if user_id:
            sql += "and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and a.user_nm like '%" + user_nm + "%'"
        elif user_grade:
            sql += " and a.user_grade like '%" + user_grade + "%'"
        elif group_id:
            sql += " and a.group_id = '" + group_id + "'"
        
        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"

        return db.engine.execute(text(sql))

    @classmethod
    def find_all_user(cls, params):
        user_id, user_nm, user_grade, start, length = params

        sql = """
             select row_number() OVER(order by a.user_grade, a.user_id) row_cnt,
                    a.user_id, a.user_nm, case when a.use_yn = 'Y' then '사용' else '탈퇴' end use_yn, a.user_pwd, a.user_office, a.user_dept_nm, a.user_dept_charge, 
                    a.user_point, a.user_phone, a.user_birth, a.user_grade, a.user_dept_nm, a.user_dor_acc,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.user_conn_date, 'YYYY-MM-DD') user_conn_date, to_char(a.user_pwd_change_dt, 'YYYY-MM-DD') user_pwd_change_dt
             from tbl_user a
             where a.user_grade != '0100' and a.delete_yn = 'Y'
        """
        if user_id:
            sql += "and a.user_id like '%"+user_id+"%'"
        elif user_nm:
            sql += " and a.user_nm like '%"+user_nm+"%'"
        elif user_grade:
            sql += " and a.user_grade like '%"+user_grade+"%'"

        if current_user.user_grade == "0103":
            sql += " and a.user_id = '"+current_user.user_id+"' "

        if current_user.user_grade == "0102":
            sql += " and (a.user_id = '"+current_user.user_id+"')"

        if int(length) > 0:
            sql += " order by a.user_grade, a.user_id limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))

    def is_active(self):
        return True

    def get_id(self):
        return self.user_id

    def is_authenticated(self):
        return self.user_auth

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_user_code(cls, user_grade):

        return db.session.query(cls.user_id, cls.user_nm, CodeModel.comm_nm)\
                         .join(CodeModel, cls.user_grade == CodeModel.comm_cd) \
                         .filter(cls.user_grade.in_(user_grade))\
                         .filter(CodeModel.comm_up_cd == '0100').all()

    # 데이터 사용량(now_disk) 갱신 (6/21 김동수 추가)
    @classmethod
    def update_now_disk(cls, user_id, user_grade):
        sql = """
                update
                    tbl_user
                set
            """
        sql2 = """
                where
                    user_id = :user_id
             """
             
        # 관리자가 아닌 경우     
        if user_grade != '0102':
            sql += ("now_disk = (select sum(cont_size) from tbl_contents where user_id = :user_id and cont_yn='Y')" + sql2)
        # 관리자인 경우
        else:
            sql += ("now_disk = ifnull((select sum from (select sum(c.cont_size) as sum from tbl_user u, tbl_contents c where u.user_id = c.user_id and (u.create_user_id=:user_id  or u.user_id=:user_id) and c.cont_yn='Y') tmp),0)" + sql2)
                
        db.engine.execute(text(sql), {'user_id':user_id, 'user_grade':user_grade}) 
        print(sql)
        return 'update_now_disk success'

    # 하위 사용자 수(now_user) 갱신 (6/22 김동수 추가)
    @classmethod
    def update_now_user(cls, user_id):
        if current_user.create_user_id == user_id:
            sql = """
                update
                    tbl_user
                set
                    now_user = (select count from (select count(*) as count from tbl_user where create_user_id = :user_id) tmp)
                where
                    user_id = :user_id
            """  
        else:
            sql = """
                    update
                        tbl_user
                    set
                        now_user = (select count+1 from (select count(*) as count from tbl_user where create_user_id = :user_id) tmp)
                    where
                        user_id = :user_id
                """
        print(sql)
        db.engine.execute(text(sql), {'user_id':user_id}) 
        return 'update_now_user success'

    # 셋톱 갯수(now_settop) 갱신 (6/22 김동수 추가)
    def update_now_settop(cls, user_id, user_grade):
        sql = """
                update
                    tbl_user
                set
            """
        sql2 = """
                where
                    user_id = :user_id
             """
             
        # 관리자가 아닌 경우     
        if user_grade != '0102':
            sql += ("now_settop = (select count(*) from tbl_device where use_yn = 'Y' and user_id = :user_id)" + sql2)
        # 관리자인 경우
        else:
            sql += ("now_settop = (select count from (select count(*) as count from tbl_user u, tbl_device d where d.use_yn = 'Y' and u.user_id = d.user_id and (u.create_user_id=:user_id  or u.user_id=:user_id)) tmp)" + sql2)
                
        db.engine.execute(text(sql), {'user_id':user_id, 'user_grade':user_grade}) 
        return 'update_now_settop success'