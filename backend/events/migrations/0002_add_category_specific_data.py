# Generated migration for category-specific data field

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='quoterequest',
            name='category_specific_data',
            field=models.JSONField(default=dict, help_text='Category-specific requirements and budget allocation: {category: {requirements: {}, budget: amount, details: {}}}'),
        ),
    ]