from database import SessionLocal, engine
import models

# Create the table if it doesn't exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if user already exists
existing_user = db.query(models.User).filter(models.User.username == "admin").first()

if not existing_user:
    new_user = models.User(
        username="admin", 
        password_hash="admin123", # Simple password for now
        role="admin"
    )
    db.add(new_user)
    db.commit()
    print("User 'admin' created successfully!")
else:
    print("User 'admin' already exists.")

db.close()