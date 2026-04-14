from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Subject, StudyGroup, Membership


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code']

class StudyGroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='creator.username')
    subject_details = SubjectSerializer(source='subject', read_only=True)
    
    class Meta:
        model = StudyGroup
        fields = [
            'id', 'title', 'description', 'subject', 
            'subject_details', 'creator', 'creator_name', 
            'max_members', 'is_active', 'created_at'
        ]
        read_only_fields = ['creator', 'is_active']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class RemoveMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()