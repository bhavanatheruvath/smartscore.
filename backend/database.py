from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# REPLACE 'root' and 'password' with your real MySQL info
# Format: mysql+pymysql://username:password@localhost:3306/db_name
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:Bhavana_18$@localhost:3306/smartscore_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()