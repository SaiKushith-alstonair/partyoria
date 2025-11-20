from django.db import migrations, models
import uuid

def generate_message_ids(apps, schema_editor):
    Message = apps.get_model('chat', 'Message')
    for message in Message.objects.all():
        if not message.message_id:
            message.message_id = str(uuid.uuid4())
            message.save()

def reverse_message_ids(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_conversation_is_active_message_message_type_and_more'),
    ]

    operations = [
        # Rename fields
        migrations.RenameField(
            model_name='message',
            old_name='read',
            new_name='is_read',
        ),
        migrations.RenameField(
            model_name='message',
            old_name='delivered',
            new_name='temp_delivered',
        ),
        
        # Add new fields
        migrations.AddField(
            model_name='conversation',
            name='last_message_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='message_id',
            field=models.CharField(default='', max_length=50),
        ),
        
        # Remove old fields
        migrations.RemoveField(
            model_name='message',
            name='temp_delivered',
        ),
        migrations.RemoveField(
            model_name='message',
            name='metadata',
        ),
        migrations.RemoveField(
            model_name='message',
            name='message_type',
        ),
        
        # Modify existing fields
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(max_length=1000),
        ),
        
        # Generate UUIDs for existing messages
        migrations.RunPython(generate_message_ids, reverse_message_ids),
        
        # Make message_id unique after populating
        migrations.AlterField(
            model_name='message',
            name='message_id',
            field=models.CharField(max_length=50, unique=True, default=''),
        ),
        
        # Update indexes
        migrations.AlterModelOptions(
            name='conversation',
            options={},
        ),
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ['-created_at']},
        ),
        
        # Remove old indexes and add new ones
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_conversation_vendor_updated_at_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_conversation_customer_updated_at_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_conversation_vendor_customer_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_conversation_is_active_updated_at_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_message_conversation_created_at_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_message_sender_created_at_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_message_conversation_read_idx;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP INDEX IF EXISTS chat_message_conversation_delivered_idx;",
            reverse_sql="",
        ),
        
        # Add new indexes
        migrations.RunSQL(
            "CREATE INDEX chat_conversation_last_message_at_idx ON chat_conversation (last_message_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS chat_conversation_last_message_at_idx;",
        ),
        migrations.RunSQL(
            "CREATE INDEX chat_conversation_vendor_last_message_at_idx ON chat_conversation (vendor_id, last_message_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS chat_conversation_vendor_last_message_at_idx;",
        ),
        migrations.RunSQL(
            "CREATE INDEX chat_conversation_customer_last_message_at_idx ON chat_conversation (customer_id, last_message_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS chat_conversation_customer_last_message_at_idx;",
        ),
        migrations.RunSQL(
            "CREATE INDEX chat_message_conversation_created_at_idx ON chat_message (conversation_id, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS chat_message_conversation_created_at_idx;",
        ),
        migrations.RunSQL(
            "CREATE INDEX chat_message_conversation_is_read_idx ON chat_message (conversation_id, is_read);",
            reverse_sql="DROP INDEX IF EXISTS chat_message_conversation_is_read_idx;",
        ),
        migrations.RunSQL(
            "CREATE INDEX chat_message_message_id_idx ON chat_message (message_id);",
            reverse_sql="DROP INDEX IF EXISTS chat_message_message_id_idx;",
        ),
    ]