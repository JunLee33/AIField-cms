from datetime import datetime
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# +----------------------+--------------+------+-----+---------+----------------+
# | Field                | Type         | Null | Key | Default | Extra          |
# +----------------------+--------------+------+-----+---------+----------------+
# | point_id             | Biginteger   | NO   | PRI |         | auto_increment |
# | point_type           | varchar(4)   | NO   |     |         | tbl_common     |
# | point_use            | varchar(10)  | NO   |     |         |                |
# | point_detail         | varchar(50)  | YES  |     | null    |                |
# | user_id              | varchar(50)  | NO   |     |         |                |
# | create_date          | datetime     | NO   |     |         |                |
# +----------------------+--------------+------+-----+---------+----------------+

class PointModel(db.Model):
    __tablename__ = 'tbl_point'

    point_id = db.Column(db.BigInteger, primary_key=True)                                   # 포인트 순번
    point_type = db.Column(db.String(4), nullable=False)                                    # 포인트 타입 (충전, 환불, 사용)
    point_use = db.Column(db.String(10), nullable=False)                                    # 사용 포인트
    point_detail = db.Column(db.String(50), nullable=True)                                  # 포인트 사용 상세내역
    user_id = db.Column(db.String(50), nullable=False)                                      # 포인트 사용자 아이디(이메일)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __init__(self, point_type, point_use, point_detail, user_id, create_date):

        self.point_type = point_type
        self.point_use = point_use
        self.point_detail = point_detail
        self.user_id = user_id
        self.create_date = create_date
        

    @classmethod
    def find_by_id(cls, point_id):
        return cls.query.filter_by(point_id=point_id).first()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()


    @classmethod
    def find_all_point_count(cls, params):
        point_type, user_id, user_nm, start_date, end_date = params

        sql = """
            select count(*) tot_cnt
            from tbl_point a, tbl_user b
            where a.user_id = b.user_id and (a.point_type = '0503' or a.point_type = '0504')
            """

        if point_type:
            sql += "and a.point_type like '%" + point_type + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and b.user_nm like '%" + user_nm + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"


        return db.engine.execute(text(sql))

    @classmethod
    def find_all_point(cls, params):
        point_type, user_id, user_nm, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by a.point_id) row_cnt,
                    a.point_id, a.point_type, a.point_use, a.point_detail, a.user_id,b.user_nm,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date
             from tbl_point a, tbl_user b
             where a.user_id = b.user_id and (a.point_type = '0503' or a.point_type = '0504')
        """
        if point_type:
            sql += "and a.point_type like '%" + point_type + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and b.user_nm like '%" + user_nm + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"
         

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"

        sql += " order by a.point_id DESC"
        

        if int(length) > 0:
            sql += "limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))
