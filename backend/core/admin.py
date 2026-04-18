from django.contrib import admin
from .models import Subject, StudyGroup, Membership, Category, StudyRequest

admin.site.register(Subject)
admin.site.register(StudyGroup)
admin.site.register(Membership)
admin.site.register(Category)     
admin.site.register(StudyRequest)  