from datetime import datetime
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# +----------------------+--------------+------+-----+---------+----------------+
# | Field                | Type         | Null | Key | Default | Extra          |
# +----------------------+--------------+------+-----+---------+----------------+
# | workspace_id         | integer      | NO   | PRI |         | auto_increment |
# | workspace_nm         | varchar(50)  | NO   |     |         |                |
# | workspace_cmt        | varchar(100) |      |     | "NULL"  |                |
# | workspace_memo       | varchar(500) |      |     | "NULL"  |                |
# | workspace_location   | varchar(100) | NO   |     |         |                |
# | use_yn               | varchar(1)   | NO   |     | "Y"     |                |
# | user_id              | varchar(50)  | NO   |     | "Y"     |                |
# | create_date          | datetime     | NO   |     |         |                |
# | modify_date          | datetime     | NO   |     |         |                |
# +----------------------+--------------+------+-----+---------+----------------+

class WorkspaceModel(db.Model):
    __tablename__ = 'tbl_workspace'

    workspace_id = db.Column(db.Integer, primary_key=True)                                  # 현장 아이디
    workspace_nm = db.Column(db.String(50), nullable=False)                                 # 현장명
    workspace_cmt = db.Column(db.String(100), nullable=True)                                # 현장 코멘트 (부가정보)
    workspace_memo = db.Column(db.String(500), nullable=True)                               # 현장 메모  (부가정보)
    workspace_location = db.Column(db.String(100), nullable=False)                          # 현장 주소
    use_yn = db.Column(db.String(1), nullable=True, default="Y")                            # 사용 유무
    user_id = db.Column(db.String(50), nullable=False)                                      # 등록 사용자 아이디(이메일)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    modify_date = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __init__(self, workspace_nm, workspace_cmt, workspace_memo, workspace_location, user_id, create_date, modify_date):

        self.workspace_nm = workspace_nm
        self.workspace_cmt = workspace_cmt
        self.workspace_memo = workspace_memo
        self.workspace_location = workspace_location
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date
        

    @classmethod
    def find_by_id(cls, workspace_id):
        return cls.query.filter_by(workspace_id=workspace_id).first()


    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id, use_yn="Y").first()

    @classmethod
    def find_all_workspace_count(cls, params):
        workspace_nm, workspace_cmt, workspace_location, start_date, end_date= params

        sql = """
            select count(*) tot_cnt
            from tbl_workspace a, tbl_user b
            where a.use_yn = 'Y' and a.user_id = b.user_id
            """

        if workspace_nm:
            sql += "and a.workspace_nm like '%" + workspace_nm + "%'"
        elif workspace_cmt:
            sql += " and a.workspace_cmt like '%" + workspace_cmt + "%'"
        elif workspace_location:
            sql += " and a.workspace_location like '%" + workspace_location + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
        print(sql)
        return db.engine.execute(text(sql))

    @classmethod
    def find_all_workspace(cls, params):
        workspace_nm, workspace_cmt, workspace_location, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by a.workspace_id desc) row_cnt,
                    a.workspace_id, a.workspace_nm, a.workspace_cmt, a.workspace_memo, a.workspace_location, 
                    case when a.use_yn = 'Y' then '사용' else '미사용' end use_yn, a.user_id, b.user_nm,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.modify_date, 'YYYY-MM-DD') modify_date
             from tbl_workspace a, tbl_user b
             where a.use_yn = 'Y' and a.user_id = b.user_id
        """
        if workspace_nm:
            sql += "and a.workspace_nm like '%" + workspace_nm + "%'"
        elif workspace_cmt:
            sql += " and a.workspace_cmt like '%" + workspace_cmt + "%'"
        elif workspace_location:
            sql += " and a.workspace_location like '%" + workspace_location + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"


        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
            
        if int(length) > 0:
            sql += " order by a.workspace_id desc limit " + str(length) + " offset " + str(start)
        else :
            sql += " order by a.workspace_id desc"

        return db.engine.execute(text(sql))

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()