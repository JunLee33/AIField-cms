from datetime import datetime
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# +----------------------+--------------+------+-----+---------+----------------+
# | Field                | Type         | Null | Key | Default | Extra          |
# +----------------------+--------------+------+-----+---------+----------------+
# | themamap_id          | integer      | NO   | PRI |         | tbl_themamap   |
# | cont_id              | integer      | NO   | PRI |         | tbl_contents   |
# | themamap_type        | varchar(4)   | NO   |     |         | tbl_common     |
# | cont_org_nm          | varchar(50)   | NO  |     |         | tbl_contents   |
# | workspace_id         | integer      | NO   |     |         | tbl_workspace  |
# | user_id              | varchar(50)  | NO   |     |         |                |
# | create_date          | datetime     | NO   |     |         |                |
# | modify_date          | datetime     | NO   |     |         |                |
# +----------------------+--------------+------+-----+---------+----------------+

class ThemamapContModel(db.Model):
    __tablename__ = 'tbl_themamap_cont'

    themamap_id = db.Column(db.Integer, primary_key=True)                                   # 주제도 아이디
    cont_id = db.Column(db.Integer, primary_key=True)                                       # 컨텐츠 아이디
    themamap_type = db.Column(db.String(10), nullable=False)                                # 주제도 검출종류
    cont_org_nm = db.Column(db.String(50), nullable=False)                                  # 컨텐츠 파일명
    workspace_id = db.Column(db.Integer, nullable=False)                                    # 현장 아이디
    user_id = db.Column(db.String(50), nullable=False)                                      # 등록 사용자 아이디(이메일)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    modify_date = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __init__(self, themamap_id, cont_id, themamap_type, cont_org_nm, workspace_id,  user_id, create_date, modify_date):

        self.themamap_id = themamap_id
        self.cont_id = cont_id
        self.themamap_type = themamap_type
        self.cont_org_nm = cont_org_nm
        self.workspace_id = workspace_id
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date
        

    @classmethod
    def find_by_id(cls, themamap_id):
        return cls.query.filter_by(themamap_id=themamap_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()


    @classmethod
    def find_all_themamapcont_count(cls, params):
        themamap_id, cont_id, themamap_type, cont_org_nm, workspace_id, user_id, start_date, end_date = params

        sql = """
            select count(*) tot_cnt
            from tbl_themamap_cont a, tbl_user b
            where a.user_id = b.user_id
            """

        if themamap_id:
            sql += "and a.themamap_id = '" + themamap_id + "'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"

        if cont_id:
            sql += "and a.cont_id like '%" + cont_id + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        
        if themamap_type:
            sql += " and a.themamap_type like '%" + themamap_type + "%'"

        if cont_org_nm:
            sql += " and a.cont_org_nm like '%" + cont_org_nm + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

    
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
       
        return db.engine.execute(text(sql))

    @classmethod
    def find_all_themamapcont(cls, params):
        themamap_id, cont_id, themamap_type, cont_org_nm, workspace_id, user_id, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by cont_date) row_cnt,
                    a.themamap_id, a.cont_id, to_char(d.cont_date, 'YYYY-MM-DD') cont_date, a.themamap_type, a.cont_org_nm, a.workspace_id, c.workspace_nm,
                    a.user_id, to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.modify_date, 'YYYY-MM-DD') modify_date
             from tbl_themamap_cont a, tbl_user b, tbl_workspace c, tbl_contents d
             where a.user_id = b.user_id and a.workspace_id = c.workspace_id and a.cont_id = d.cont_id 
        """
        if themamap_id:
            sql += "and a.themamap_id = '" + themamap_id + "'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"

        if cont_id:
            sql += "and a.cont_id like '%" + cont_id + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        
        if themamap_type:
            sql += " and a.themamap_type like '%" + themamap_type + "%'"

        if cont_org_nm:
            sql += " and a.cont_org_nm like '%" + cont_org_nm + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

    
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
            
        if int(length) > 0:
            sql += " order by cont_date limit " + str(length) + " offset " + str(start)
        else :
            sql += " order by cont_date"

        print(sql)
        return db.engine.execute(text(sql))
