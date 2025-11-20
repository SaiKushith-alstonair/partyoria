# Generated manually to add vendor_responses field

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('events', '0003_alter_quoterequest_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='quoterequest',
            name='vendor_responses',
            field=models.JSONField(default=dict, help_text='Vendor responses to this quote request'),
        ),
    ]