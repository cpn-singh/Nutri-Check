from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AssessmentInputSerializer, AssessmentRecordSerializer
from .models import AssessmentRecord
from .calculations import (
    calculate_bmi,
    calculate_whtr,
    determine_body_status,
    calculate_body_composition,
    calculate_bmr,
    calculate_tdee,
    calculate_nutrition_targets,
    calculate_body_3d
)
from .fat_ai_service import predict_fat_distribution

class HealthAssessmentView(APIView):
    """
    Evaluates body status (BMI + WHtR + Body Build nuance),
    runs trained AI to map 3D fat distribution & red blinking alerts,
    and calculates personalized nutrition, macro, and micronutrient targets.
    """
    def post(self, request):
        serializer = AssessmentInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        d = serializer.validated_data
        height_cm = d['height_cm']
        weight_kg = d['weight_kg']
        age = d['age']
        sex = d['biological_sex']
        waist_cm = d.get('waist_cm')
        hip_cm = d.get('hip_cm')
        neck_cm = d.get('neck_cm')
        thigh_cm = d.get('thigh_cm')
        body_build = d.get('body_build', 'average')
        activity = d['activity_level']
        goal = d['primary_goal']
        diet = d['diet_type']
        sun = d['sun_exposure']
        life_stage = d.get('life_stage', 'none')

        # 1. Body Status
        bmi = calculate_bmi(weight_kg, height_cm)
        whtr = calculate_whtr(waist_cm, height_cm)
        status_info = determine_body_status(bmi, whtr, body_build)

        # 2. Whole Body Fat Percentage, Fat Mass, Lean Mass & Composition
        body_composition = calculate_body_composition(
            weight_kg=weight_kg,
            height_cm=height_cm,
            age=age,
            sex=sex,
            waist_cm=waist_cm,
            hip_cm=hip_cm,
            neck_cm=neck_cm,
            thigh_cm=thigh_cm,
            body_build=body_build
        )

        # 3. 3D Body Mesh Morph & Scale Parameters
        body_3d = calculate_body_3d(
            height_cm=height_cm,
            weight_kg=weight_kg,
            waist_cm=waist_cm,
            sex=sex,
            body_build=body_build,
            hip_cm=hip_cm,
            thigh_cm=thigh_cm
        )

        # 4. AI Adiposity Distribution Prediction (for 3D Body Model)
        fat_distribution = predict_fat_distribution(
            bmi=bmi,
            whtr=whtr,
            age=age,
            biological_sex=sex,
            body_build=body_build,
            activity_level=activity,
            hip_cm=hip_cm,
            thigh_cm=thigh_cm
        )

        # 5. Energy & Nutrition
        bmr = calculate_bmr(weight_kg, height_cm, age, sex)
        tdee = calculate_tdee(bmr, activity)
        nutrition = calculate_nutrition_targets(
            weight_kg=weight_kg,
            tdee=tdee,
            primary_goal=goal,
            activity_level=activity,
            diet_type=diet,
            sun_exposure=sun,
            age=age,
            sex=sex,
            life_stage=life_stage
        )

        # Save record for audit/history
        try:
            record = AssessmentRecord.objects.create(
                height_cm=height_cm,
                weight_kg=weight_kg,
                age=age,
                biological_sex=sex,
                waist_cm=waist_cm,
                hip_cm=hip_cm,
                neck_cm=neck_cm,
                thigh_cm=thigh_cm,
                body_build=body_build,
                activity_level=activity,
                primary_goal=goal,
                diet_type=diet,
                sun_exposure=sun,
                life_stage=life_stage,
                bmi=bmi,
                whtr=whtr,
                body_status=status_info['category'],
                bmr=bmr,
                tdee=tdee,
                target_calories=nutrition['calories']['target'],
                body_fat_percentage=body_composition['body_fat_percentage'],
                fat_mass_kg=body_composition['fat_mass_kg'],
                lean_mass_kg=body_composition['lean_mass_kg'],
                waist_to_hip_ratio=body_composition['waist_to_hip_ratio']
            )
            record_id = record.id
        except Exception:
            record_id = None

        response_data = {
            "record_id": record_id,
            "inputs": {
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "age": age,
                "biological_sex": sex,
                "waist_cm": waist_cm,
                "hip_cm": hip_cm,
                "neck_cm": neck_cm,
                "thigh_cm": thigh_cm,
                "body_build": body_build,
                "activity_level": activity,
                "primary_goal": goal,
                "diet_type": diet,
                "sun_exposure": sun,
                "life_stage": life_stage
            },
            "body_status": status_info,
            "body_composition": body_composition,
            "body_3d": body_3d,
            "fat_distribution": fat_distribution,
            "energy": {
                "bmr": bmr,
                "tdee": tdee
            },
            "nutrition": nutrition,
            "disclaimer": (
                "These estimations are based on established clinical and nutritional formulas "
                "(Mifflin-St Jeor, Ashwell WHtR guidelines, and DRI/RDA tables) designed for educational "
                "and lifestyle optimization purposes. They do not constitute formal medical diagnosis or clinical prescription."
            )
        }

        return Response(response_data, status=status.HTTP_200_OK)
