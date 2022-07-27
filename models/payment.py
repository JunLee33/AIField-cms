from datetime import datetime
from core.db import db
from models.code import CodeModel
from sqlalchemy.sql.expression import true
from sqlalchemy.sql import text
from flask_login import current_user

# +----------------------+--------------+------+-----+---------+----------------+
# | Field                | Type         | Null | Key | Default | Extra          |
# +----------------------+--------------+------+-----+---------+----------------+
# | payment_no           | integer      | NO   | PRI |         | auto_increment |
# | payment_type         | varchar(4)   | NO   |     |         |                |
# | payment_msg          | varchar(50)  | NO   |     |         | tbl_common     |
# | payment_point        | integer      | NO   |     |         |                |
# | user_id              | varchar(50)  | NO   |     |         |                |
# | merchant_uid         | varchar(50)  | NO   |     |         |                |
# | imp_uid              | varchar(50)  | NO   |     |         |                |
# | create_date          | datetime     | NO   |     |         |                |
# | modify_date          | datetime     | NO   |     |         |                |
# +----------------------+--------------+------+-----+---------+----------------+

class PaymentModel(db.Model):
    __tablename__ = 'tbl_payment'

    payment_no = db.Column(db.Integer, primary_key=True)                                   # 결제 순번
    payment_type = db.Column(db.String(4), nullable=False)                                 # 결제 메시지 (결제성공, 결제실패, 환불)
    payment_msg = db.Column(db.String(50), nullable=False)                              # 결제 내역
    payment_point = db.Column(db.Integer, nullable=False)                                  # 결제 금액
    merchant_uid = db.Column(db.String(30), nullable=False)                                # 주문 번호 (우리가 제공)
    imp_uid = db.Column(db.String(30), nullable=False)                                     # 결제 번호 (아임포트 제공)
    user_id = db.Column(db.String(50), nullable=False)                                     # 결제 사용자 아이디(이메일)
    create_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    modify_date = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __init__(self, payment_type, payment_msg, payment_point, merchant_uid, imp_uid, user_id, create_date, modify_date):

        self.payment_type = payment_type
        self.payment_msg = payment_msg
        self.payment_point = payment_point
        self.merchant_uid = merchant_uid
        self.imp_uid = imp_uid
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date
        

    @classmethod
    def find_by_id(cls, merchant_uid):
        return cls.query.filter_by(merchant_uid=merchant_uid).first()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()


    @classmethod
    def find_all_payment_count(cls, params):
        payment_type, user_id, user_nm, start_date, end_date,  = params

        sql = """
            select count(*) tot_cnt
            from tbl_payment a, tbl_user b
            where (a.payment_type = '0302' or a.payment_type = '0402') and a.user_id = b.user_id
            """

        if payment_type:
            sql += "and a.payment_type like '%" + payment_type + "%'"
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
    def find_by_payment_no(cls, payment_no):

        # sql = """ select * from tbl_payment where payment_no = '"""+payment_no+"' "

        return cls.query.filter_by(payment_no=payment_no).first()

    @classmethod
    def find_all_payment(cls, params):
        payment_type, user_id, user_nm, start_date, end_date, start, length = params

        sql = """
             select row_number() OVER(order by a.payment_no) row_cnt,
                    a.payment_no, a.payment_type, a.payment_msg, a.payment_point, a.merchant_uid, a.imp_uid, a.user_id, b.user_nm,
                    to_char(a.create_date, 'YYYY-MM-DD') create_date,
                    to_char(a.modify_date, 'YYYY-MM-DD') modify_date
             from tbl_payment a, tbl_user b
             where (a.payment_type = '0302' or a.payment_type = '0402')  and a.user_id = b.user_id
        """
        if payment_type:
            sql += "and a.payment_type like '%" + payment_type + "%'"
        elif user_id:
            sql += " and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and b.user_nm like '%" + user_nm + "%'"
        
        if start_date:
            sql += " and date(a.create_date) >= date '"+start_date+"'"
            sql += " and date(a.create_date) <= date '"+end_date+"'"

        if current_user.user_grade != '0101':
            sql += " and (a.user_id = '"+current_user.user_id+"')"

        sql += " order by a.payment_no DESC"

        if int(length) > 0:
            sql += "limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))
