import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/aegisai")

def verify_db():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = ["users", "files", "analysis_results", "feature_vectors"]
        print("\nTables found in DB:")
        for table in tables:
            print(f" - {table}")
            
        missing = [t for t in expected_tables if t not in tables]
        if not missing:
            print("\nVerification SUCCESS: All expected tables are present.")
        else:
            print(f"\nVerification PARTIAL: Missing tables: {missing}")
            print("Note: Tables are created on FastAPI startup using Base.metadata.create_all().")
            
    except Exception as e:
        print(f"\nVerification FAILED: {str(e)}")

if __name__ == "__main__":
    verify_db()
