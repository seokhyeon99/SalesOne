from rest_framework import serializers
from .models import Client, ClientNote, ClientFile


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'representative_name', 'business_number',
            'emails', 'phones', 'address', 'website', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientNoteSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientNote
        fields = [
            'id', 'client', 'title', 'content', 'user',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'email': obj.user.email
        }


class ClientFileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientFile
        fields = [
            'id', 'client', 'name', 'size', 'type', 'url',
            'description', 'user', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'email': obj.user.email
        }
    
    def get_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_size(self, obj):
        if obj.file:
            return obj.file.size
        return 0
    
    def get_type(self, obj):
        if obj.file:
            return obj.file.name.split('.')[-1].lower()
        return ''


class TimelineItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.ChoiceField(choices=['note', 'file'])
    title = serializers.CharField(required=False)
    content = serializers.CharField(required=False)
    name = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_null=True)
    file_url = serializers.URLField(required=False, allow_null=True)
    created_at = serializers.DateTimeField()
    created_by = serializers.CharField()


class EmailAttachmentSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    url = serializers.URLField()
    size = serializers.IntegerField(required=False)
    type = serializers.CharField(required=False)


class EmailSerializer(serializers.Serializer):
    id = serializers.CharField()
    subject = serializers.CharField()
    from_email = serializers.CharField(source='from')
    to = serializers.CharField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField()
    attachments = EmailAttachmentSerializer(many=True, required=False)


class ClientDetailSerializer(ClientSerializer):
    notes = ClientNoteSerializer(many=True, read_only=True)
    files = ClientFileSerializer(many=True, read_only=True)
    
    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ['notes', 'files']
