import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# Connect to the local Postgres database created from previous phases
# (You might need to pip install psycopg2-binary or asyncpg)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:%40Abhiram_006@localhost:5432/civicpulse"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to retrieve an independent DB session per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
