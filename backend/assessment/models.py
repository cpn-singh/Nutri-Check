from django.db import models

class AssessmentRecord(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    height_cm = models.FloatField()
    weight_kg = models.FloatField()
    age = models.IntegerField()
    biological_sex = models.CharField(max_length=10)
    waist_cm = models.FloatField(null=True, blank=True)
    hip_cm = models.FloatField(null=True, blank=True)
    neck_cm = models.FloatField(null=True, blank=True)
    thigh_cm = models.FloatField(null=True, blank=True)
    body_build = models.CharField(max_length=20, default='average')
    activity_level = models.CharField(max_length=20)
    primary_goal = models.CharField(max_length=20)
    diet_type = models.CharField(max_length=20)
    sun_exposure = models.CharField(max_length=20)
    life_stage = models.CharField(max_length=20, default='none')

    # Calculated metrics stored for audit/tracking
    bmi = models.FloatField()
    whtr = models.FloatField(null=True, blank=True)
    body_status = models.CharField(max_length=50)
    bmr = models.FloatField()
    tdee = models.FloatField()
    target_calories = models.FloatField()

    # Whole Body Fat and Composition
    body_fat_percentage = models.FloatField(null=True, blank=True)
    fat_mass_kg = models.FloatField(null=True, blank=True)
    lean_mass_kg = models.FloatField(null=True, blank=True)
    waist_to_hip_ratio = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Assessment {self.id} - {self.body_status} ({self.created_at:%Y-%m-%d})"
