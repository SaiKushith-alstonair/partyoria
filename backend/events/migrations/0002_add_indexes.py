from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_events_user_id;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);",
            reverse_sql="DROP INDEX IF EXISTS idx_events_created_at;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_budget_event_id ON budgets(event_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_budget_event_id;"
        ),
    ]