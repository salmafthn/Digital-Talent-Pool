import logging
import random
from datetime import date
from faker import Faker
from sqlalchemy.orm import Session
from app import models
from app.core.security import get_password_hash

# Setup Logger & Faker
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
fake = Faker('id_ID') # Pakai data Indonesia

# --- DATA STATIS (Untuk menghindari error Faker) ---
UNIVERSITIES = [
    "Universitas Indonesia", "Institut Teknologi Bandung", "Universitas Gadjah Mada",
    "Institut Teknologi Sepuluh Nopember", "Universitas Airlangga", "Universitas Brawijaya",
    "Universitas Padjadjaran", "Universitas Diponegoro", "Binus University",
    "Telkom University", "Universitas Sebelas Maret", "Universitas Hasanuddin"
]

MAJORS = [
    "Teknik Informatika", "Sistem Informasi", "Ilmu Komputer", 
    "Teknik Elektro", "Manajemen Bisnis", "Akuntansi",
    "Desain Komunikasi Visual", "Statistika", "Matematika"
]

def seed_all(db: Session) -> None:
    logger.info("🌱 Mulai seeding data DTP...")
     
    admin_email = "admin@dtp.id"
    user = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if not user:
        logger.info("Membuat akun Admin...")
        admin = models.User(
            username="admin",
            email=admin_email,
            hashed_password=get_password_hash("123")
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        admin_profile = models.Profile(
            user_id=admin.id, 
            full_name="Super Admin", 
            nik="1234567890123456",
            gender="Laki-laki",
            birth_date=date(1995, 1, 1),
            bio="Akun ini untuk testing admin."
        )
        db.add(admin_profile)
        db.commit()
    else:
        logger.info("Admin sudah ada, skip.")
 
    logger.info("Membuat 10 User Dummy...")
    
    levels = ["SMA/SMK", "D3", "D4", "S1", "S2"]
    job_types = ["Kerja", "Freelance", "Magang", "Tidak/belum bekerja"]
    areas = [
        "Tata Kelola Teknologi Informasi (IT Governance)",
        "Pengembangan Produk Digital (Digital Product Development)",
        "Sains Data-Kecerdasan Artifisial (Data Science-AI)",
        "Keamanan Informasi dan Siber",
        "Teknologi dan Infrastruktur"
    ]

    for _ in range(10):
        # A. User Akun
        email = fake.unique.email()
        username = email.split("@")[0]
        
        user = models.User(
            username=username,
            email=email,
            hashed_password=get_password_hash("123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # B. Profile
        profile = models.Profile(
            user_id=user.id,
            # PAKE NUMERIFY (Pengganti fake.nik)
            nik=fake.unique.numerify(text='################'), 
            full_name=fake.name(),
            gender=random.choice(["Laki-laki", "Perempuan"]),
            birth_date=fake.date_of_birth(minimum_age=20, maximum_age=35),
            phone=fake.phone_number(),
            address=fake.address(),
            bio=fake.text(max_nb_chars=100),
            linkedin_url=f"https://linkedin.com/in/{username}"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # C. Pendidikan
        for _ in range(random.randint(1, 2)):
            edu_level = random.choice(levels)
            
            if edu_level == "SMA/SMK":
                gpa = None
                major = "IPA/IPS"
                institution = f"SMA {fake.city()}"
            else:
                gpa = str(round(random.uniform(3.0, 4.0), 2))
                major = random.choice(MAJORS) # PAKE LIST MANUAL
                institution = random.choice(UNIVERSITIES) # PAKE LIST MANUAL

            edu = models.Education(
                profile_id=profile.id,
                level=edu_level,
                institution_name=institution,
                major=major,
                enrollment_year=random.randint(2015, 2019),
                graduation_year=random.randint(2020, 2023),
                gpa=gpa
            )
            db.add(edu)
        
        # D. Pengalaman
        for _ in range(random.randint(0, 2)):
            is_current = random.choice([True, False])
            end_date = None if is_current else fake.date_between(start_date='-1y', end_date='today')
            
            exp = models.Experience(
                profile_id=profile.id,
                position=fake.job(),
                company_name=fake.company(),
                job_type=random.choice(job_types),
                functional_area=random.choice(areas),
                start_date=fake.date_between(start_date='-4y', end_date='-2y'),
                end_date=end_date,
                is_current=is_current,
                description=fake.bs()
            )
            db.add(exp)
            
        # E. Sertifikasi
        if random.choice([True, False]):
            cert = models.Certification(
                profile_id=profile.id,
                name=f"Sertifikat {fake.job()}",
                organizer=fake.company(),
                year=random.randint(2020, 2024),
                description=fake.sentence(),
                proof_url=f"/static/certifications/dummy_{random.randint(1,5)}.pdf"
            )
            db.add(cert)

    db.commit()
    logger.info("✅ Seeding Selesai! Data dummy berhasil dibuat.")