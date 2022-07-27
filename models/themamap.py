from datetime import datetime
from re import S
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# +----------------------+--------------+------+-----+---------+----------------+
# | Field                | Type         | Null | Key | Default | Extra          |
# +----------------------+--------------+------+-----+---------+----------------+
# | themamap_id          | integer      | NO   | PRI |         | auto_increment |
# | themamap_nm          | varchar(50)  | NO   |     |         |                |
# | themamap_type        | varchar(4)   | NO   |     |         | tbl_common     |
# | themamap_status      | varchar(4)   | NO   |     |         | tbl_common     |
# | workspace_id         | integer      | NO   |     |         | tbl_workspace  |
# | use_yn               | varchar(1)   | NO   |     | "Y"     |                |
# | user_id              | varchar(50)  | NO   |     |         |                |
# | create_date          | datetime     | NO   |     |         |                |
# | modify_date          | datetime     | NO   |     |         |                |
# +----------------------+--------------+------+-----+---------+----------------+

class ThemamapModel(db.Model):
    __tablename__ = 'tbl_themamap'

    themamap_id = db.Column(db.Integer, primary_key=True)                                   # 주제도 아이디
    themamap_nm = db.Column(db.String(50), nullable=False)                                  # 주제도 제목명
    themamap_type = db.Column(db.String(4), nullable=False)                                 # 주제도 검출종류
    themamap_status = db.Column(db.String(4), nullable=False)                               # 주제도 진행상태
    workspace_id = db.Column(db.Integer, nullable=False)                                    # 현장 아이디
    use_yn = db.Column(db.String(1), nullable=False, default="Y")                           # 사용 유무
    user_id = db.Column(db.String(50), nullable=False)                                      # 등록 사용자 아이디(이메일)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    modify_date = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __init__(self, themamap_nm, themamap_type, themamap_status, workspace_id, use_yn, user_id, create_date, modify_date):

        self.themamap_nm = themamap_nm
        self.themamap_type = themamap_type
        self.themamap_status = themamap_status
        self.workspace_id = workspace_id
        self.use_yn = use_yn
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date
        

    @classmethod
    def find_by_id(cls, themamap_id):
        return cls.query.filter_by(themamap_id=themamap_id).first()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()


    @classmethod
    def find_all_themamap_count(cls, params):
        themamap_nm, themamap_type, themamap_status, workspace_id, user_id, start_date, end_date = params

        sql = """
            select count(*) tot_cnt
            from tbl_themamap a, tbl_user b
            where a.use_yn = 'Y' and a.user_id = b.user_id
            """

        if themamap_nm:
            sql += "and a.themamap_nm like '%" + themamap_nm + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        
        if themamap_status:
            sql += " and a.themamap_status like '%" + themamap_status + "%'"

        if themamap_type:
            sql += " and a.themamap_type like '%" + themamap_type + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

    
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
       
        return db.engine.execute(text(sql))

    @classmethod
    def find_all_themamap(cls, params):
        themamap_nm, themamap_type, themamap_status, workspace_id, user_id, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by a.themamap_id desc) row_cnt,
                    a.themamap_id, a.themamap_nm, a.themamap_type, a.themamap_status, a.workspace_id, c.workspace_nm,
                    case when a.use_yn = 'Y' then '사용' else '미사용' end use_yn, a.user_id, b.user_nm,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.modify_date, 'YYYY-MM-DD') modify_date
             from tbl_themamap a, tbl_user b, tbl_workspace c
             where a.use_yn = 'Y' and a.user_id = b.user_id and a.workspace_id = c.workspace_id
        """
        if themamap_nm:
            sql += "and a.themamap_nm like '%" + themamap_nm + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        
        if themamap_status:
            sql += " and a.themamap_status like '%" + themamap_status + "%'"

        if themamap_type:
            sql += " and a.themamap_type like '%" + themamap_type + "%'"

        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"
        
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
            
        if int(length) > 0:
            sql += " order by a.themamap_id desc limit " + str(length) + " offset " + str(start)
        else :
            sql += " order by a.themamap_id desc"

        return db.engine.execute(text(sql))

    @classmethod
    def find_mapping_themamap_count(cls, themamap_id):

        sql = """
            select count(*) tot_cnt
            from tbl_themamap a, tbl_themamap_cont b, tbl_contents c
            where a.themamap_id = '"""+themamap_id+"""' and a.themamap_id = b.themamap_id and b.cont_id = c.cont_id
            """

        return db.engine.execute(text(sql))

    @classmethod
    def find_mapping_themamap(cls, params):
        themamap_id, start, length = params

        sql = """
             select a.themamap_id, a.themamap_nm, a.user_id, to_char(a.create_date, 'YYYY-MM-DD') themamap_date, 
                    b.cont_id, c.cont_nm, to_char(c.cont_date, 'YYYY-MM-DD') cont_date, c.cont_size, to_char(c.create_date, 'YYYY-MM-DD') content_date 
             from tbl_themamap a, tbl_themamap_cont b, tbl_contents c
                where a.themamap_id = '"""+themamap_id+"""' and a.themamap_id = b.themamap_id and b.cont_id = c.cont_id
        """
            
        if int(length) > 0:
            sql += " order by a.themamap_id desc limit " + str(length) + " offset " + str(start)
        else :
            sql += " order by a.themamap_id desc"

        return db.engine.execute(text(sql))




    @classmethod
    def count_by_workspace_id(cls, workspace_id):
        sql = """
            select themamap_status, count(*) from tbl_themamap
            where workspace_id = :workspace_id and use_yn = 'Y'
            group by themamap_status;
        """
        return db.engine.execute(text(sql),{'workspace_id':workspace_id})

