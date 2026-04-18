from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404

from .models import Subject, StudyGroup, Membership, StudyRequest 
from .serializers import (
    SubjectSerializer, StudyGroupSerializer, 
    LoginSerializer, StudyRequestSerializer, RemoveMemberSerializer
)

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
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def subject_list(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)




@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_group(request, pk):
    group = get_object_or_404(StudyGroup, pk=pk)
    
    if Membership.objects.filter(user=request.user, group=group).exists():
        return Response({'error': 'Вы уже состоите в этой группе'}, status=status.HTTP_400_BAD_REQUEST)
    
    current_members_count = Membership.objects.filter(group=group).count()
    if current_members_count >= group.max_members:
        return Response({'error': 'Группа заполнена'}, status=status.HTTP_400_BAD_REQUEST)
    
    Membership.objects.create(user=request.user, group=group)
    return Response({'message': 'Вы успешно вступили в группу'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_group(request, pk):
    group = get_object_or_404(StudyGroup, pk=pk)
    membership = Membership.objects.filter(user=request.user, group=group).first()
    
    if membership:
        membership.delete()
        return Response({'message': 'Вы вышли из группы'}, status=status.HTTP_204_NO_CONTENT)
    
    return Response({'error': 'Вы не являетесь участником этой группы'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_member(request, pk):
    group = get_object_or_404(StudyGroup, pk=pk)
    
    if group.creator != request.user:
        return Response({'error': 'Только создатель может удалять участников'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RemoveMemberSerializer(data=request.data)
    if serializer.is_valid():
        user_id = serializer.validated_data['user_id']
        if user_id == request.user.id:
            return Response({'error': 'Вы не можете удалить себя'}, status=status.HTTP_400_BAD_REQUEST)
            
        membership = Membership.objects.filter(user_id=user_id, group=group).first()
        if membership:
            membership.delete()
            return Response({'message': 'Участник удален'})
        return Response({'error': 'Пользователь не найден в группе'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class GroupListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
@permission_classes([permissions.IsAuthenticated])
def get_my_requests(request):
    requests = StudyRequest.objects.filter(user=request.user)
    serializer = StudyRequestSerializer(requests, many=True)
    return Response(serializer.data)


class StudyRequestList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StudyRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)