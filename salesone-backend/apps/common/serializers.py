from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    """
    Base serializer for all serializers to inherit from.
    """
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
