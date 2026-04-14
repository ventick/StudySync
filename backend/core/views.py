from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import Subject, StudyGroup, Membership
from .serializers import SubjectSerializer, StudyGroupSerializer, LoginSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    request.user.auth_token.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

class GroupListCreateAPIView(APIView):
    def get(self, request):
        groups = StudyGroup.objects.all()
        serializer = StudyGroupSerializer(groups, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudyGroupSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupDetailAPIView(APIView):
    def get_object(self, pk):
        return get_object_or_404(StudyGroup, pk=pk)

    def get(self, request, pk):
        group = self.get_object(pk)
        serializer = StudyGroupSerializer(group)
        return Response(serializer.data)

    def put(self, request, pk):
        group = self.get_object(pk)
        if group.creator != request.user:
            return Response({'error': 'Only creator can edit'}, status=status.HTTP_403_FORBIDDEN)
        serializer = StudyGroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = self.get_object(pk)
        if group.creator != request.user:
            return Response({'error': 'Only creator can delete'}, status=status.HTTP_403_FORBIDDEN)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def subject_list(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)
