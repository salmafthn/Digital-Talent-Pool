from sqlalchemy.orm import Session
import models
from schemas import profile_schema
from fastapi import HTTPException

class ProfileService:
    
    # 1. Get Profil Lengkap
    def get_profile_by_user_id(self, db: Session, user_id: int):
        profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile

    # 2. Update Data Diri (Partial)
    def update_profile(self, db: Session, user_id: int, data: profile_schema.ProfileUpdate):
        profile = self.get_profile_by_user_id(db, user_id)
        
        # Update field yang dikirim saja
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile

    # 3. Tambah Pendidikan
    def add_education(self, db: Session, user_id: int, education: profile_schema.EducationCreate):
        profile = self.get_profile_by_user_id(db, user_id)
        
        # Cek jumlah pendidikan saat ini
        count = db.query(models.Education).filter(models.Education.profile_id == profile.id).count()
        if count >= 3:
            raise HTTPException(status_code=400, detail="Maksimal hanya boleh 3 data pendidikan.")
            
        # Simpan data baru
        new_edu = models.Education(**education.dict(), profile_id=profile.id)
        db.add(new_edu)
        db.commit()
        db.refresh(new_edu)
        return new_edu

    # 4. Hapus Pendidikan
    def delete_education(self, db: Session, user_id: int, education_id: int):
        profile = self.get_profile_by_user_id(db, user_id)
        edu = db.query(models.Education).filter(
            models.Education.id == education_id,
            models.Education.profile_id == profile.id
        ).first()
        
        if not edu:
            raise HTTPException(status_code=404, detail="Education not found")
            
        db.delete(edu)
        db.commit()
        return {"message": "Education deleted"}

    # ... (Buat fungsi serupa untuk Certification dan Experience) ...
    # Biar singkat, polanya sama persis dengan add_education dan delete_education
    
    def add_certification(self, db: Session, user_id: int, cert: profile_schema.CertificationCreate):
        profile = self.get_profile_by_user_id(db, user_id)
        new_cert = models.Certification(**cert.dict(), profile_id=profile.id)
        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)
        return new_cert
    
    def delete_certification(self, db: Session, user_id: int, cert_id: int):
        profile = self.get_profile_by_user_id(db, user_id)
        
        # Cari sertifikat milik user ini
        cert = db.query(models.Certification).filter(
            models.Certification.id == cert_id,
            models.Certification.profile_id == profile.id
        ).first()
        
        if not cert:
            raise HTTPException(status_code=404, detail="Certification not found")

        db.delete(cert)
        db.commit()
        return {"message": "Certification deleted successfully"}

    def add_experience(self, db: Session, user_id: int, exp: profile_schema.ExperienceCreate):
        profile = self.get_profile_by_user_id(db, user_id)
        new_exp = models.Experience(**exp.dict(), profile_id=profile.id)
        db.add(new_exp)
        db.commit()
        db.refresh(new_exp)
        return new_exp
    def delete_experience(self, db: Session, user_id: int, exp_id: int):
        profile = self.get_profile_by_user_id(db, user_id)
        
        # Cari data pengalaman
        exp = db.query(models.Experience).filter(
            models.Experience.id == exp_id,
            models.Experience.profile_id == profile.id
        ).first()
        
        if not exp:
            raise HTTPException(status_code=404, detail="Experience not found")
            
        db.delete(exp)
        db.commit()
        return {"message": "Experience deleted successfully"}