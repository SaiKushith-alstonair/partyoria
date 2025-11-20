# Generated migration for enhanced chat features

from django.db import migrations, models
import django.db.models.deletion
import uuid
import os

def upload_path(instance, filename):
    return f'chat_files/{instance.message.conversation.id}/{uuid.uuid4()}{os.path.splitext(filename)[1]}'

class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_merge_0003_auto_20251115_1541_0003_production_chat'),
    ]

    operations = [
        # Update Message model
        migrations.AddField(
            model_name='message',
            name='message_type',
            field=models.CharField(
                choices=[
                    ('text', 'Text'),
                    ('file', 'File'),
                    ('quote', 'Quote'),
                    ('booking_update', 'Booking Update'),
                    ('system', 'System')
                ],
                default='text',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='message',
            name='status',
            field=models.CharField(
                choices=[
                    ('sending', 'Sending'),
                    ('sent', 'Sent'),
                    ('delivered', 'Delivered'),
                    ('read', 'Read'),
                    ('failed', 'Failed')
                ],
                default='sending',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='message',
            name='delivered_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='read_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='reply_to',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='chat.message'
            ),
        ),
        migrations.AddField(
            model_name='message',
            name='retry_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='message',
            name='metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(blank=True, max_length=1000),
        ),
        
        # Create MessageAttachment model
        migrations.CreateModel(
            name='MessageAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to=upload_path)),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.BigIntegerField()),
                ('file_type', models.CharField(
                    choices=[
                        ('image', 'Image'),
                        ('document', 'Document'),
                        ('video', 'Video'),
                        ('audio', 'Audio')
                    ],
                    max_length=20
                )),
                ('mime_type', models.CharField(max_length=100)),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='chat_thumbnails/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('message', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='attachments',
                    to='chat.message'
                )),
            ],
        ),
        
        # Create ConversationContext model
        migrations.CreateModel(
            name='ConversationContext',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.IntegerField(blank=True, null=True)),
                ('event_title', models.CharField(blank=True, max_length=200)),
                ('event_date', models.DateTimeField(blank=True, null=True)),
                ('event_budget', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('booking_status', models.CharField(default='inquiry', max_length=50)),
                ('service_category', models.CharField(blank=True, max_length=100)),
                ('requirements', models.TextField(blank=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('conversation', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='context',
                    to='chat.conversation'
                )),
            ],
        ),
        
        # Add new indexes
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['message_type'], name='chat_message_msg_type_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['conversation', 'status'], name='chat_message_conv_status_idx'),
        ),
    ]