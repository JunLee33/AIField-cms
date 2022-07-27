from cmath import pi
from datetime import datetime
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# tbl_contents
# +---------------+--------------+------+-----+---------+----------------+
# | Field         | Type         | Null | Key | Default | Extra          |
# +---------------+--------------+------+-----+---------+----------------+
# | cont_id       | int          | NO   | PRI |         | auto_increment |
# | cont_nm       | varchar(50)  | NO   |     |         |                |
# | cont_org_nm   | varchar(50)  | NO   |     |         |                |
# | cont_size     | bigint       | NO   |     |         | MEGABYTE       |
# | cont_date     | datetime     | NO   |     |         |                |
# | cont_url      | varchar(300) | NO   |     |         |                |
# | cont_thu_url  | varchar(300) | NO   |     |         |                |
# | cont_status   | varchar(4)   | NO   |     |         | TBL_COMMON     |
# | workspace_id  | int          | NO   |     |         | TBL_WORKSPACE  |
# | use_yn        | varchar(1)   | NO   |     | "Y"     |                |
# | user_id       | varchar(50)  | NO   |     |         |                |
# | create_date   | datetime     | NO   |     |         |                |
# | modify_date   | datetime     | NO   |     |         |                |
# +---------------+--------------+------+-----+---------+----------------+

class ContentsModel(db.Model):
    __tablename__ = 'tbl_contents'

    cont_id = db.Column(db.Integer, primary_key=True, autoincrement=True)           # 콘텐츠 순번(Auto)
    cont_nm = db.Column(db.String(50), nullable=False)                              # 콘텐츠명
    cont_org_nm = db.Column(db.String(50), nullable=False)                          # 콘텐츠 파일명
    cont_size = db.Column(db.BigInteger, nullable=False)                            # 콘텐츠 용량
    cont_date = db.Column(db.DateTime, nullable=False, default=datetime.now())      # 콘텐츠 촬영일
    cont_url = db.Column(db.String(300), nullable=False)                            # 콘텐츠 URL
    cont_thu_url = db.Column(db.String(300), nullable=False)                        # 콘텐츠 썸네일 URL
    cont_status = db.Column(db.String(4), nullable=False)                           # 콘텐츠 상태
    workspace_id = db.Column(db.Integer, nullable=False)                            # 현장 아이디
    use_yn = db.Column(db.String(1), nullable=False, default='Y')                   # 컨텐츠 사용 유무
    user_id = db.Column(db.String(50), nullable=False)                              # 사용자 아이디
    create_date = db.Column(db.DateTime, default=datetime.now())                     
    modify_date = db.Column(db.DateTime, default=datetime.now())                    

    def __init__(self, cont_nm, cont_org_nm, cont_size, cont_date, cont_url, cont_thu_url, cont_status, workspace_id, use_yn, user_id, create_date, modify_date):

        self.cont_nm = cont_nm
        self.cont_org_nm = cont_org_nm
        self.cont_size = cont_size
        self.cont_date = cont_date
        self.cont_url = cont_url
        self.cont_thu_url = cont_thu_url
        self.cont_status = cont_status
        self.workspace_id = workspace_id
        self.use_yn = use_yn
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date

    @classmethod
    def find_by_id(cls, cont_id):
        return cls.query.filter_by(cont_id=cont_id).first()

    @classmethod
    def get_contents_list(cls):

        query = db.session.query(cls)

        return query.all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_all_contents_count(cls, params):
        cont_nm, user_id, workspace_id, cont_status, start_date, end_date = params

        sql = """
            select count(*) tot_cnt
            from tbl_contents a, tbl_user b
            where a.use_yn = 'Y' and a.user_id = b.user_id
            """

        if cont_nm:
            sql += "and a.cont_nm like '%" + cont_nm + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
    
        if cont_status:
            sql += " and a.cont_status like '%" + cont_status + "%'"
        
        if start_date:
            sql += " and date(a.cont_date) >= date '"+start_date+"'"
            sql += " and date(a.cont_date) <= date '"+end_date+"'"

    
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
       
        return db.engine.execute(text(sql))

    @classmethod
    def find_all_contents(cls, params):
        cont_nm, user_id, workspace_id, cont_status, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by a.cont_id desc) row_cnt,
                    a.cont_id, a.cont_nm, a.cont_org_nm, a.cont_size, c.workspace_nm,
                    to_char(a.cont_date, 'YYYY-MM-DD') cont_date,
                    a.cont_url, a.cont_thu_url, a.cont_status, a.workspace_id,
                    case when a.use_yn = 'Y' then '사용' else '미사용' end use_yn, a.user_id, b.user_nm,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.modify_date, 'YYYY-MM-DD') modify_date
             from tbl_contents a, tbl_user b, tbl_workspace c
             where a.use_yn = 'Y' and a.user_id = b.user_id and a.workspace_id = c.workspace_id
        """
        if cont_nm:
            sql += "and a.cont_nm like '%" + cont_nm + "%'"
        
        if cont_status:
            sql += " and a.cont_status like '%" + cont_status + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"
        
        if workspace_id:
            sql += " and a.workspace_id = '" + workspace_id + "'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"
            
        if int(length) > 0:
            sql += " order by a.cont_id desc limit " + str(length) + " offset " + str(start)
        else :
            sql += " order by a.cont_id desc"
        return db.engine.execute(text(sql))


    @classmethod
    def get_count_list_by_user_id(cls, user_id):

        sql = '''
            SELECT group_concat(distinct cont_tp) cont_tp, count(cont_tp) as count 
            FROM tbl_contents a, tbl_user b
            WHERE a.user_id = b.user_id and a.cont_yn = "Y"
            '''
        if current_user.user_gr == "0102":
            sql += ' and (a.user_id = :user_id or b.create_user_id = :user_id) \n'
        if current_user.user_gr == "0103":
            sql += ' and a.user_id = :user_id \n'


        sql += 'group by cont_tp'
            
        # print(sql)
        return db.engine.execute(text(sql),{'user_id':user_id})

    @classmethod
    def cont_count_by_workspace_id(cls, workspace_id):
        sql = """
            select SUM(cont_size::int), cont_status, count(*) from tbl_contents 
            where workspace_id = :workspace_id and use_yn = 'Y'
            group by cont_status;
        """
        return db.engine.execute(text(sql),{'workspace_id':workspace_id})