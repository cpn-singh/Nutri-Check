from rest_framework import serializers
from .models import AssessmentRecord

class AssessmentInputSerializer(serializers.Serializer):
    height_cm = serializers.FloatField(min_value=50.0, max_value=280.0)
    weight_kg = serializers.FloatField(min_value=20.0, max_value=400.0)
    age = serializers.IntegerField(min_value=10, max_value=120)
    biological_sex = serializers.ChoiceField(choices=['male', 'female'])
    waist_cm = serializers.FloatField(required=False, allow_null=True, min_value=30.0, max_value=250.0)
    hip_cm = serializers.FloatField(required=False, allow_null=True, min_value=40.0, max_value=250.0)
    neck_cm = serializers.FloatField(required=False, allow_null=True, min_value=20.0, max_value=90.0)
    thigh_cm = serializers.FloatField(required=False, allow_null=True, min_value=25.0, max_value=130.0)
    body_build = serializers.ChoiceField(
        choices=['slim', 'average', 'muscular', 'heavy'],
        default='average'
    )
    activity_level = serializers.ChoiceField(
        choices=['sedentary', 'light', 'moderate', 'very_active']
    )
    primary_goal = serializers.ChoiceField(
        choices=['lose_fat', 'maintain', 'gain_muscle']
    )
    diet_type = serializers.ChoiceField(
        choices=['everything', 'vegetarian', 'eggetarian', 'vegan', 'no_dairy']
    )
    sun_exposure = serializers.ChoiceField(
        choices=['rarely', 'moderate', 'high']
    )
    life_stage = serializers.ChoiceField(
        choices=['none', 'pregnant', 'breastfeeding'],
        default='none'
    )

class AssessmentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentRecord
        fields = '__all__'
